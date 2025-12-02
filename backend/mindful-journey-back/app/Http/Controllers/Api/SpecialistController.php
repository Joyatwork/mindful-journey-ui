<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Specialist;
use Illuminate\Support\Facades\Schema;

class SpecialistController extends Controller
{
    private function normalizeToArray($value): array
    {
        if (is_array($value)) return $value;
        if (is_string($value)) {
            $trim = trim($value);
            if ($trim === '') return [];
            // Try JSON decode first
            try {
                $decoded = json_decode($trim, true, 512, JSON_THROW_ON_ERROR);
                if (is_array($decoded)) return $decoded;
            } catch (\Throwable $e) {
                // not a JSON array, fall through
            }
            // Comma or semicolon separated list
            if (str_contains($trim, ',') || str_contains($trim, ';')) {
                $parts = preg_split('/[;,]/', $trim);
                return array_values(array_filter(array_map(fn($s) => trim((string)$s), $parts), fn($s) => $s !== ''));
            }
            // Single token string
            return [$trim];
        }
        return [];
    }

    /**
     * Liste des spécialistes avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Specialist::query();
        $table = (new Specialist())->getTable();

        if ($request->filled('specialty') && $request->specialty !== 'all') {
            $query->where(function ($q) use ($request, $table) {
                // specialty (EN) ou speciality (FR)
                $q->where($table . '.specialty', $request->specialty);
                $q->orWhere($table . '.speciality', $request->specialty);
            });
        }
        if ($request->filled('consultationType') && $request->consultationType !== 'all') {
            $type = $request->consultationType;
            if ($type !== 'both') {
                // consultation_type (EN normalisé) ou consultation_mode (FR)
                $query->where(function ($q) use ($type, $table) {
                    $q->whereIn($table . '.consultation_type', [$type, 'both']);
                    // map inverse pour consultation_mode stocké en FR
                    $mode = $type === 'video' ? 'teleconsultation' : ($type === 'inPerson' ? 'presentiel' : 'both');
                    $q->orWhereIn($table . '.consultation_mode', [$mode, 'both']);
                });
            }
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s, $table) {
                // name est un accessoire → on cherche sur first_name/last_name
                $q->where($table . '.first_name', 'like', "%$s%")
                    ->orWhere($table . '.last_name', 'like', "%$s%")
                    ->orWhere($table . '.specialty', 'like', "%$s%")
                    ->orWhere($table . '.speciality', 'like', "%$s%")
                    ->orWhere($table . '.description', 'like', "%$s%")
                    ->orWhere($table . '.bio', 'like', "%$s%");
            });
        }

        // Pagination serveur
        $perPage = (int) $request->get('perPage', 10);
        $perPage = max(1, min($perPage, 50));
        $page = (int) $request->get('page', 1);

        // Choisir une colonne d'ordre robuste selon le schéma disponible
        $orderColumn = 'rating';
        if (!Schema::hasColumn($table, 'rating')) {
            if (Schema::hasColumn($table, 'updated_at')) {
                $orderColumn = $table . '.updated_at';
            } elseif (Schema::hasColumn($table, 'created_at')) {
                $orderColumn = $table . '.created_at';
            } else {
                $orderColumn = $table . '.id';
            }
        }

        $direction = $orderColumn === 'id' ? 'desc' : 'desc';

        $paginator = $query->orderBy($orderColumn, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        // Transformer les éléments paginés pour correspondre au format frontend
        $mapped = $paginator->getCollection()->map(function (Specialist $s) use ($table) {
            return [
                'id' => (string) $s->id,
                'name' => $s->name,
                'specialty' => $s->specialty,
                'rating' => (float) ($s->rating ?? 0),
                'experience' => ($s->experience_years ?? 0) . ' ans',
                'price' => intval(($s->price_cents ?? 0) / 100) . '€',
                'availability' => $s->availability ?? '',
                'consultationType' => $s->consultation_type, // accessoire normalise depuis consultation_mode si besoin
                'description' => $s->description ?? '',
                'location' => $s->location ?? '',
                'image' => $s->image_url ?? null,
                'education' => $this->normalizeToArray($s->education),
                'languages' => $this->normalizeToArray($s->languages),
                'reviewCount' => $s->review_count ?? 0,
            ];
        });
        $paginator->setCollection($mapped);

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Afficher un spécialiste spécifique
     */
    public function show(string $id): JsonResponse
    {
        $table = (new Specialist())->getTable();
        $s = Specialist::findOrFail($id);
        $specialist = [
            'id' => (string) $s->id,
            'name' => $s->name,
            'specialty' => $s->specialty,
            'rating' => (float) ($s->rating ?? 0),
            'experience' => ($s->experience_years ?? 0) . ' ans',
            'price' => intval(($s->price_cents ?? 0) / 100) . '€',
            'availability' => $s->availability ?? '',
            'consultationType' => $s->consultation_type,
            'description' => $s->description ?? '',
            'location' => $s->location ?? '',
            'image' => $s->image_url ?? null,
            'education' => $this->normalizeToArray($s->education),
            'languages' => $this->normalizeToArray($s->languages),
            'reviewCount' => $s->review_count,
            'nextAvailable' => null,
            'reason' => null,
        ];

        return response()->json([
            'success' => true,
            'data' => $specialist
        ]);
    }

    /**
     * Rechercher des spécialistes
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $table = (new Specialist())->getTable();
        $s = Specialist::query()
            ->where($table . '.first_name', 'like', "%$query%")
            ->orWhere($table . '.last_name', 'like', "%$query%")
            ->orWhere($table . '.specialty', 'like', "%$query%")
            ->orWhere($table . '.speciality', 'like', "%$query%")
            ->orWhere($table . '.description', 'like', "%$query%")
            ->orWhere($table . '.bio', 'like', "%$query%")
            ->when(true, function ($q) use ($table) {
                $orderColumn = 'rating';
                if (!Schema::hasColumn($table, 'rating')) {
                    if (Schema::hasColumn($table, 'updated_at')) {
                        $orderColumn = $table . '.updated_at';
                    } elseif (Schema::hasColumn($table, 'created_at')) {
                        $orderColumn = $table . '.created_at';
                    } else {
                        $orderColumn = $table . '.id';
                    }
                }
                $q->orderBy($orderColumn, 'desc');
            })
            ->get();

        $results = $s->map(function (Specialist $sp) {
            return [
                'id' => (string) $sp->id,
                'name' => $sp->name,
                'specialty' => $sp->specialty,
                'rating' => (float) $sp->rating,
                'experience' => $sp->experience_years . ' ans',
                'price' => intval($sp->price_cents / 100) . '€',
                'availability' => $sp->availability,
                'consultationType' => $sp->consultation_type,
                'description' => $sp->description,
                'location' => $sp->location,
                'image' => $sp->image_url,
                'education' => $this->normalizeToArray($sp->education),
                'languages' => $this->normalizeToArray($sp->languages),
                'reviewCount' => $sp->review_count,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $query
        ]);
    }

    /**
     * Liste publique des spécialistes (sans authentification)
     */
    public function publicIndex(Request $request): JsonResponse
    {
        // Passer la requête telle quelle pour conserver filtres et pagination
        return $this->index($request);
    }
}
