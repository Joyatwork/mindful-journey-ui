<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Specialist;
use Illuminate\Support\Facades\Schema;

class SpecialistController extends Controller
{
    /**
     * Liste des spécialistes avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Specialist::query();

        if ($request->filled('specialty') && $request->specialty !== 'all') {
            $query->where('specialty', $request->specialty);
        }
        if ($request->filled('consultationType') && $request->consultationType !== 'all') {
            $type = $request->consultationType;
            if ($type !== 'both') {
                $query->whereIn('consultation_type', [$type, 'both']);
            }
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                    ->orWhere('specialty', 'like', "%$s%")
                    ->orWhere('description', 'like', "%$s%");
            });
        }

        // Pagination serveur
        $perPage = (int) $request->get('perPage', 10);
        $perPage = max(1, min($perPage, 50));
        $page = (int) $request->get('page', 1);

        // Choisir une colonne d'ordre robuste selon le schéma disponible
        $orderColumn = 'rating';
        if (!Schema::hasColumn('practitioners', 'rating')) {
            if (Schema::hasColumn('practitioners', 'updated_at')) {
                $orderColumn = 'updated_at';
            } elseif (Schema::hasColumn('practitioners', 'created_at')) {
                $orderColumn = 'created_at';
            } else {
                $orderColumn = 'id';
            }
        }

        $direction = $orderColumn === 'id' ? 'desc' : 'desc';

        $paginator = $query->orderBy($orderColumn, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        // Transformer les éléments paginés pour correspondre au format frontend
        $mapped = $paginator->getCollection()->map(function (Specialist $s) {
            return [
                'id' => (string) $s->id,
                'name' => $s->name,
                'specialty' => $s->specialty,
                'rating' => (float) $s->rating,
                'experience' => $s->experience_years . ' ans',
                'price' => intval($s->price_cents / 100) . '€',
                'availability' => $s->availability,
                'consultationType' => $s->consultation_type,
                'description' => $s->description,
                'location' => $s->location,
                'image' => $s->image_url,
                'education' => $s->education,
                'languages' => $s->languages,
                'reviewCount' => $s->review_count,
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
        $s = Specialist::findOrFail($id);
        $specialist = [
            'id' => (string) $s->id,
            'name' => $s->name,
            'specialty' => $s->specialty,
            'rating' => (float) $s->rating,
            'experience' => $s->experience_years . ' ans',
            'price' => intval($s->price_cents / 100) . '€',
            'availability' => $s->availability,
            'consultationType' => $s->consultation_type,
            'description' => $s->description,
            'location' => $s->location,
            'image' => $s->image_url,
            'education' => $s->education,
            'languages' => $s->languages,
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

        $s = Specialist::query()
            ->where('name', 'like', "%$query%")
            ->orWhere('specialty', 'like', "%$query%")
            ->orWhere('description', 'like', "%$query%")
            ->when(true, function ($q) {
                $orderColumn = 'rating';
                if (!Schema::hasColumn('practitioners', 'rating')) {
                    if (Schema::hasColumn('practitioners', 'updated_at')) {
                        $orderColumn = 'updated_at';
                    } elseif (Schema::hasColumn('practitioners', 'created_at')) {
                        $orderColumn = 'created_at';
                    } else {
                        $orderColumn = 'id';
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
                'education' => $sp->education,
                'languages' => $sp->languages,
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
