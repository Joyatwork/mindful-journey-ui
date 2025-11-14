<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
            if (in_array($c, $cols, true)) { $recipientCol = $c; break; }
        }

        // Colonnes de mapping pour affichage
        $titleCol = $this->firstExisting(['title', 'titre', 'label', 'subject'], $cols);
        $bodyCol  = $this->firstExisting(['body', 'content', 'message', 'texte', 'description'], $cols);
        $urlCol   = $this->firstExisting(['url', 'link', 'lien'], $cols);
        $typeCol  = $this->firstExisting(['type', 'category', 'categorie', 'kind'], $cols);
        $practCol = $this->firstExisting(['practitioner_id', 'praticien_id', 'specialist_id'], $cols);
        $createdAtCol = in_array('created_at', $cols, true) ? 'created_at' : null;
        $readAtCol = $this->firstExisting(['read_at', 'seen_at', 'consumed_at'], $cols);
        $seenCol = $this->firstExisting(['seen', 'is_read'], $cols);

        $limit = min((int) $request->query('limit', 50), 200);
        $unreadOnly = filter_var($request->query('unreadOnly', 'false'), FILTER_VALIDATE_BOOLEAN);

        $q = DB::table($table)->select(['id']);
        if ($titleCol) $q->addSelect(DB::raw($titleCol . ' as title'));
        else $q->addSelect(DB::raw("'' as title"));
        if ($bodyCol) $q->addSelect(DB::raw($bodyCol . ' as body')); else $q->addSelect(DB::raw("'' as body"));
        if ($urlCol) $q->addSelect(DB::raw($urlCol . ' as url')); else $q->addSelect(DB::raw('NULL as url'));
        if ($typeCol) $q->addSelect(DB::raw($typeCol . ' as type')); else $q->addSelect(DB::raw("'note' as type"));
        if ($practCol) $q->addSelect(DB::raw($practCol . ' as practitioner_id')); else $q->addSelect(DB::raw('NULL as practitioner_id'));
        if ($createdAtCol) $q->addSelect($createdAtCol); else $q->addSelect(DB::raw('NULL as created_at'));
        if ($readAtCol) $q->addSelect(DB::raw($readAtCol . ' as read_at')); else if ($seenCol) $q->addSelect(DB::raw($seenCol . ' as seen')); else $q->addSelect(DB::raw('NULL as read_at'));

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
            } catch (\Throwable $e) { /* ignore scope errors */ }
        }

        // Filtrer non lus si demandé
        if ($unreadOnly) {
            if ($readAtCol) {
                $q->whereNull($readAtCol);
            } elseif ($seenCol) {
                $q->where(function ($qq) use ($seenCol) {
                    $qq->where($seenCol, 0)->orWhereNull($seenCol);
                });
            }
        }

        // Ordre: plus récents d'abord si created_at disponible
        if ($createdAtCol) $q->orderByDesc($createdAtCol);
        else $q->orderByDesc('id');

        $items = $q->limit($limit)->get();
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

        if (!$readAtCol && !$seenCol) {
            return response()->json(['success' => false, 'message' => 'Aucune colonne de lecture (read_at/seen_at/consumed_at ou seen)'], 400);
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

    private function firstExisting(array $candidates, array $available): ?string
    {
        foreach ($candidates as $c) {
            if (in_array($c, $available, true)) return $c;
        }
        return null;
    }
}
