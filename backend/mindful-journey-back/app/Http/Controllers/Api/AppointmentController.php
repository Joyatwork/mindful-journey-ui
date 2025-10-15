<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Liste des rendez-vous de l'utilisateur
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = Appointment::with('specialist')
            ->where('user_id', $user->id)
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(function (Appointment $a) {
                return [
                    'id' => (string) $a->id,
                    'specialistId' => (string) $a->specialist_id,
                    'specialistName' => $a->specialist?->name,
                    'specialty' => $a->specialist?->specialty,
                    'date' => $a->scheduled_at?->format('Y-m-d'),
                    'time' => $a->scheduled_at?->format('H:i'),
                    'type' => $a->type,
                    'status' => $a->status,
                    'price' => intval(($a->price_cents ?? 0) / 100) . '€',
                    'notes' => $a->notes,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Créer un nouveau rendez-vous
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            // validate against the canonical practitioners table
            'specialistId' => ['required', Rule::exists('practitioners', 'id')],
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'type' => 'required|in:video,inPerson,phone',
            'notes' => 'nullable|string',
        ]);

        $scheduledAt = \Carbon\Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['time']);

        // Vérifier l'unicité: pas deux RDV pour le même user à la même date/heure
        $exists = Appointment::where('user_id', $user->id)
            ->where('scheduled_at', $scheduledAt)
            ->exists();
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà un rendez-vous à cette date et heure.'
            ], 422);
        }

        $spec = Specialist::findOrFail($validated['specialistId']);
        $priceCents = $spec->price_cents ?? 0;

        $appointment = Appointment::create([
            'user_id' => $user->id,
            'specialist_id' => $spec->id,
            'scheduled_at' => $scheduledAt,
            'type' => $validated['type'],
            'status' => 'confirmed',
            'price_cents' => $priceCents,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous créé avec succès',
            'data' => [
                'id' => (string) $appointment->id,
            ]
        ], 201);
    }

    /**
     * Afficher un rendez-vous spécifique
     */
    public function show(string $id): JsonResponse
    {
        $user = Auth::user();
        $a = Appointment::with('specialist')->where('user_id', $user->id)->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $a->id,
                'specialistId' => (string) $a->specialist_id,
                'specialistName' => $a->specialist?->name,
                'specialty' => $a->specialist?->specialty,
                'date' => $a->scheduled_at?->format('Y-m-d'),
                'time' => $a->scheduled_at?->format('H:i'),
                'type' => $a->type,
                'status' => $a->status,
                'price' => intval(($a->price_cents ?? 0) / 100) . '€',
                'notes' => $a->notes,
            ]
        ]);
    }

    /**
     * Modifier un rendez-vous
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $a = Appointment::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'date' => 'sometimes|date_format:Y-m-d',
            'time' => 'sometimes|date_format:H:i',
            'type' => 'sometimes|in:video,inPerson,phone',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['date']) || isset($validated['time'])) {
            $date = $validated['date'] ?? $a->scheduled_at->format('Y-m-d');
            $time = $validated['time'] ?? $a->scheduled_at->format('H:i');
            $scheduledAt = \Carbon\Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $time);

            // Unicité de créneau
            $exists = Appointment::where('user_id', $user->id)
                ->where('scheduled_at', $scheduledAt)
                ->where('id', '!=', $a->id)
                ->exists();
            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un rendez-vous à cette date et heure.'
                ], 422);
            }

            $a->scheduled_at = $scheduledAt;
        }

        if (isset($validated['type'])) $a->type = $validated['type'];
        if (array_key_exists('notes', $validated)) $a->notes = $validated['notes'];
        $a->save();

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous mis à jour avec succès',
        ]);
    }

    /**
     * Supprimer un rendez-vous
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $a = Appointment::where('user_id', $user->id)->findOrFail($id);
        $a->delete();
        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous supprimé avec succès'
        ]);
    }

    /**
     * Annuler un rendez-vous
     */
    public function cancel(string $id): JsonResponse
    {
        $user = Auth::user();
        $a = Appointment::where('user_id', $user->id)->findOrFail($id);
        $a->status = 'cancelled';
        $a->save();
        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous annulé avec succès',
        ]);
    }
}
