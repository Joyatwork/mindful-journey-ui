<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Specialist;
use Illuminate\Database\Schema\Blueprint;

class ContensController extends Controller
{
    /**
     * Liste des suggestions personnalisées (table `contens`) destinées à l'utilisateur courant.
     * S'adapte aux variations de schéma: colonne destinataire (user_id/patient_id/target_user_id/employee_id),
     * colonnes de contenu (title/titre/label, body/content/message/texte/description), marquage lecture (read_at/seen_at/consumed_at/seen).
     */
    public function index(Request $request): JsonResponse
    {
        // Déterminer dynamiquement la table: préférer 'contents', sinon 'contens'
        $table = null;
        if (Schema::hasTable('contents')) $table = 'contents';
        elseif (Schema::hasTable('contens')) $table = 'contens';
        if (!$table) {
            return response()->json(['items' => [], 'count' => 0]);
        }

        $user = $request->user();
        $cols = Schema::getColumnListing($table);

        // Trouver la colonne du destinataire
        $recipientCandidates = ['user_id', 'patient_id', 'target_user_id', 'employee_id'];
        $recipientCol = null;
        foreach ($recipientCandidates as $c) {
            if (in_array($c, $cols, true)) {
                $recipientCol = $c;
                break;
            }
        }

        // Colonnes de mapping pour affichage
        $titleCol = $this->firstExisting(['title', 'titre', 'label', 'subject'], $cols);
        $bodyCol  = $this->firstExisting(['body', 'content', 'message', 'texte', 'description'], $cols);
        // Message de recommandation spécifique (si présent)
        $recomCol = $this->firstExisting([
            'recommendation_message',
            'recommended_message',
            'last_recommended_message',
            'practitioner_message',
            'message_recommandation',
            'message_praticien',
            'message_conseil'
        ], $cols);
        $urlCol   = $this->firstExisting(['url', 'link', 'lien'], $cols);
        $typeCol  = $this->firstExisting(['type', 'category', 'categorie', 'kind'], $cols);
        $practCol = $this->firstExisting(['practitioner_id', 'praticien_id', 'specialist_id'], $cols);
        $createdAtCol = in_array('created_at', $cols, true) ? 'created_at' : null;
        $readAtCol = $this->firstExisting(['read_at', 'seen_at', 'consumed_at'], $cols);
        $seenCol = $this->firstExisting(['seen', 'is_read'], $cols);

        $limit = min((int) $request->query('limit', 50), 200);
        $unreadOnly = filter_var($request->query('unreadOnly', 'false'), FILTER_VALIDATE_BOOLEAN);

        $q = DB::table($table)->select([$table . '.id']);
        $useFallbackReads = (!$readAtCol && !$seenCol);
        if ($titleCol) $q->addSelect(DB::raw($titleCol . ' as title'));
        else $q->addSelect(DB::raw("'' as title"));
        if ($bodyCol) $q->addSelect(DB::raw($bodyCol . ' as body'));
        else $q->addSelect(DB::raw("'' as body"));
        if ($recomCol) $q->addSelect(DB::raw($recomCol . ' as recommendation_message'));
        else $q->addSelect(DB::raw('NULL as recommendation_message'));
        if ($urlCol) $q->addSelect(DB::raw($urlCol . ' as url'));
        else $q->addSelect(DB::raw('NULL as url'));
        if ($typeCol) $q->addSelect(DB::raw($typeCol . ' as type'));
        else $q->addSelect(DB::raw("'note' as type"));
        if ($practCol) $q->addSelect(DB::raw($practCol . ' as practitioner_id'));
        else $q->addSelect(DB::raw('NULL as practitioner_id'));
        if ($createdAtCol) $q->addSelect(DB::raw($table . '.' . $createdAtCol . ' as created_at'));
        else $q->addSelect(DB::raw('NULL as created_at'));
        if ($readAtCol) $q->addSelect(DB::raw($readAtCol . ' as read_at'));
        else if ($seenCol) $q->addSelect(DB::raw($seenCol . ' as seen'));
        else if ($useFallbackReads) $q->addSelect(DB::raw('cr.read_at as read_at'));
        else $q->addSelect(DB::raw('NULL as read_at'));

        // Filtrer par destinataire si possible, en gérant le cas employee_id -> map via employees.user_id
        if ($recipientCol) {
            $recipientValue = $user->id;
            if ($recipientCol === 'employee_id' && Schema::hasTable('employees')) {
                try {
                    $empId = DB::table('employees')->where('user_id', $user->id)->value('id');
                    if ($empId) {
                        $recipientValue = $empId;
                    } else {
                        // Si aucun mapping trouvé, on évite de filtrer pour ne pas retourner vide par erreur d'appairage
                        $recipientValue = null;
                    }
                } catch (\Throwable $e) {
                    $recipientValue = null;
                }
            }
            if ($recipientValue !== null) {
                $q->where($recipientCol, $recipientValue);
            }
        }

        // Optionnel: scoper par entreprise si la colonne existe dans contens et sur l'utilisateur
        if (in_array('entreprise_id', $cols, true)) {
            try {
                $userEntrepriseId = null;
                if (Schema::hasTable('users') && Schema::hasColumn('users', 'entreprise_id')) {
                    $userEntrepriseId = DB::table('users')->where('id', $user->id)->value('entreprise_id');
                }
                if ($userEntrepriseId) {
                    $q->where('entreprise_id', $userEntrepriseId);
                }
            } catch (\Throwable $e) { /* ignore scope errors */
            }
        }

        // Fallback lecture: joindre la table de repli si aucune colonne native
        if ($useFallbackReads) {
            try {
                $fallback = $this->getFallbackReadsTable();
                $this->ensureFallbackReadsTable($fallback);
                $q->leftJoin($fallback . ' as cr', function ($join) use ($table, $user) {
                    $join->on('cr.content_id', '=', $table . '.id')
                        ->where('cr.user_id', '=', $user->id);
                });
            } catch (\Throwable $e) { /* ignore */ }
        }

        // Filtrer non lus si demandé
        if ($unreadOnly) {
            if ($readAtCol) {
                $q->whereNull($readAtCol);
            } elseif ($seenCol) {
                $q->where(function ($qq) use ($seenCol) {
                    $qq->where($seenCol, 0)->orWhereNull($seenCol);
                });
            } else {
                // fallback: non lus si cr.read_at est NULL
                $q->whereNull('cr.read_at');
            }
        }

        // Ordre: plus récents d'abord si created_at disponible
        if ($createdAtCol) $q->orderByDesc($table . '.' . $createdAtCol);
        else $q->orderByDesc($table . '.id');

        $items = $q->limit($limit)->get();

        // Résoudre les noms de praticiens si un identifiant est présent
        if ($practCol && $items->count() > 0) {
            try {
                $ids = $items->pluck('practitioner_id')->filter()->unique()->values();
                if ($ids->count() > 0) {
                    $specs = Specialist::query()
                        ->whereIn('id', $ids)
                        ->get();
                    $nameMap = $specs->mapWithKeys(function (Specialist $s) {
                        return [$s->id => $s->name];
                    });
                    $specMap = $specs->mapWithKeys(function (Specialist $s) {
                        return [$s->id => $s->specialty];
                    });
                    $items = $items->map(function ($it) use ($nameMap, $specMap) {
                        $pid = property_exists($it, 'practitioner_id') ? $it->practitioner_id : null;
                        $it->practitioner_name = $pid && isset($nameMap[$pid]) ? $nameMap[$pid] : null;
                        $it->practitioner_specialty = $pid && isset($specMap[$pid]) ? $specMap[$pid] : null;
                        return $it;
                    });
                }
            } catch (\Throwable $e) {
                // silencieux si incapacité à résoudre les noms
            }
        }
        return response()->json(['items' => $items, 'count' => $items->count()]);
    }

    /** Marquer une suggestion comme lue (idempotent) */
    public function markRead(Request $request, int $id): JsonResponse
    {
        // Déterminer dynamiquement la table: préférer 'contents', sinon 'contens'
        $table = null;
        if (Schema::hasTable('contents')) $table = 'contents';
        elseif (Schema::hasTable('contens')) $table = 'contens';
        if (!$table) {
            return response()->json(['success' => false, 'message' => "Table 'contens' absente"], 400);
        }

        $cols = Schema::getColumnListing($table);
        $readAtCol = $this->firstExisting(['read_at', 'seen_at', 'consumed_at'], $cols);
        $seenCol = $this->firstExisting(['seen', 'is_read'], $cols);

        // Si aucune colonne native pour marquer la lecture, utiliser une table de fallback
        if (!$readAtCol && !$seenCol) {
            try {
                $fallback = $this->getFallbackReadsTable();
                $this->ensureFallbackReadsTable($fallback);
                // upsert sur (content_id, user_id)
                $existing = DB::table($fallback)
                    ->where('content_id', $id)
                    ->where('user_id', $request->user()->id)
                    ->first();
                $now = now();
                if ($existing) {
                    DB::table($fallback)
                        ->where('id', $existing->id)
                        ->update(['read_at' => $now, 'updated_at' => $now]);
                } else {
                    DB::table($fallback)->insert([
                        'content_id' => $id,
                        'user_id' => $request->user()->id,
                        'read_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
                return response()->json(['success' => true, 'fallback' => true]);
            } catch (\Throwable $e) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }
        }

        $updated = 0;
        $now = now();
        try {
            $q = DB::table($table)->where('id', $id);
            if ($readAtCol) {
                $updated = $q->update([$readAtCol => $now]);
            } else {
                $updated = $q->update([$seenCol => 1]);
            }
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }

        return response()->json(['success' => $updated > 0, 'updated' => $updated]);
    }

    /** Détail d'une suggestion (par id) */
    public function show(Request $request, int $id): JsonResponse
    {
        // Résolution table dynamique
        $table = null;
        if (Schema::hasTable('contents')) $table = 'contents';
        elseif (Schema::hasTable('contens')) $table = 'contens';
        if (!$table) {
            return response()->json(['message' => "Table 'contents/contens' absente"], 404);
        }

        $cols = Schema::getColumnListing($table);
        $titleCol = $this->firstExisting(['title', 'titre', 'label', 'subject'], $cols);
        $bodyCol  = $this->firstExisting(['body', 'content', 'message', 'texte', 'description'], $cols);
        $urlCol   = $this->firstExisting(['url', 'link', 'lien'], $cols);
        $typeCol  = $this->firstExisting(['type', 'category', 'categorie', 'kind'], $cols);
        $practCol = $this->firstExisting(['practitioner_id', 'praticien_id', 'specialist_id'], $cols);
        $recomCol = $this->firstExisting([
            'recommendation_message',
            'recommended_message',
            'last_recommended_message',
            'practitioner_message',
            'message_recommandation',
            'message_praticien',
            'message_conseil'
        ], $cols);
        $createdAtCol = in_array('created_at', $cols, true) ? 'created_at' : null;
        $readAtCol = $this->firstExisting(['read_at', 'seen_at', 'consumed_at'], $cols);
        $seenCol = $this->firstExisting(['seen', 'is_read'], $cols);

        $row = DB::table($table)->where('id', $id)->first();
        if (!$row) {
            return response()->json(['message' => 'Suggestion introuvable'], 404);
        }

        // Normalisation minimaliste
        $normalized = [
            'id' => $row->id,
            'title' => $titleCol ? ($row->{$titleCol} ?? '') : '',
            'body' => $bodyCol ? ($row->{$bodyCol} ?? '') : '',
            'url' => $urlCol ? ($row->{$urlCol} ?? null) : null,
            'type' => $typeCol ? ($row->{$typeCol} ?? 'note') : 'note',
            'practitioner_id' => $practCol ? ($row->{$practCol} ?? null) : null,
            'created_at' => $createdAtCol ? ($row->{$createdAtCol} ?? null) : null,
            'read_at' => $readAtCol ? ($row->{$readAtCol} ?? null) : null,
            'seen' => $seenCol ? ($row->{$seenCol} ?? null) : null,
            'recommendation_message' => $recomCol ? ($row->{$recomCol} ?? null) : null,
        ];

        // Joindre un nom de praticien si possible
        if (!empty($normalized['practitioner_id'])) {
            try {
                $spec = Specialist::find($normalized['practitioner_id']);
                if ($spec) {
                    $normalized['practitioner_name'] = $spec->name;
                    $normalized['practitioner_specialty'] = $spec->specialty;
                }
            } catch (\Throwable $e) {
                // ignorer
            }
        }

        // Fallback: si pas de colonne read* et pas de seen, récupérer l'état via content_reads
        if (!$readAtCol && !$seenCol) {
            try {
                $fallback = $this->getFallbackReadsTable();
                if (Schema::hasTable($fallback)) {
                    $ra = DB::table($fallback)
                        ->where('content_id', $id)
                        ->where('user_id', $request->user()->id)
                        ->value('read_at');
                    if ($ra) $normalized['read_at'] = $ra;
                }
            } catch (\Throwable $e) { /* ignore */ }
        }

        return response()->json([
            'item' => $row,
            'normalized' => $normalized,
        ]);

    }

    private function getFallbackReadsTable(): string
    {
        if (Schema::hasTable('content_reads')) return 'content_reads';
        if (Schema::hasTable('conten_reads')) return 'conten_reads';
        return 'content_reads';
    }

    private function ensureFallbackReadsTable(string $table): void
    {
        if (Schema::hasTable($table)) return;
        Schema::create($table, function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedBigInteger('content_id');
            $t->unsignedBigInteger('user_id');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
            $t->unique(['content_id', 'user_id']);
        });
    }

    private function firstExisting(array $candidates, array $available): ?string
    {
        foreach ($candidates as $c) {
            if (in_array($c, $available, true)) return $c;
        }
        return null;
    }
}
