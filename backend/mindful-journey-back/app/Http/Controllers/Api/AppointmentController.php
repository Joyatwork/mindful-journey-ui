<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Liste des rendez-vous de l'utilisateur
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        // Map current user to employee_id in mindful_journey schema
        $employeeId = DB::table('employees')->where('user_id', $user->id)->value('id');
        if (!$employeeId) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $items = Appointment::with('specialist')
            ->where('employee_id', $employeeId)
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(function (Appointment $a) {
                // Map mode -> type string expected by frontend
                $type = match ($a->mode) {
                    'presentiel' => 'inPerson',
                    'teleconsultation' => 'video',
                    default => 'video',
                };
                return [
                    'id' => (string) $a->id,
                    'specialistId' => (string) ($a->practitioner_id ?? $a->specialist_id ?? ''),
                    'specialistName' => $a->specialist?->name,
                    'specialty' => $a->specialist?->specialty,
                    'date' => $a->scheduled_at?->format('Y-m-d'),
                    'time' => $a->scheduled_at?->format('H:i'),
                    'type' => $type,
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

        // Determine employee_id for current user
        $employeeId = DB::table('employees')->where('user_id', $user->id)->value('id');
        if (!$employeeId) {
            return response()->json([
                'success' => false,
                'message' => "Aucun profil employé lié à l'utilisateur."
            ], 422);
        }

        // Vérifier l'unicité: pas deux RDV pour le même employé à la même date/heure
        $exists = Appointment::where('employee_id', $employeeId)
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

        // Map frontend type -> mode enum in DB
        $mode = match ($validated['type']) {
            'inPerson' => 'presentiel',
            'video', 'phone' => 'teleconsultation',
            default => 'teleconsultation',
        };

        $appointment = Appointment::create([
            'employee_id' => $employeeId,
            'practitioner_id' => $spec->id,
            'scheduled_at' => $scheduledAt,
            'mode' => $mode,
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
        $employeeId = DB::table('employees')->where('user_id', $user->id)->value('id');
        $a = Appointment::with('specialist')->where('employee_id', $employeeId)->findOrFail($id);
        $type = match ($a->mode) {
            'presentiel' => 'inPerson',
            'teleconsultation' => 'video',
            default => 'video',
        };
        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $a->id,
                'specialistId' => (string) ($a->practitioner_id ?? $a->specialist_id ?? ''),
                'specialistName' => $a->specialist?->name,
                'specialty' => $a->specialist?->specialty,
                'date' => $a->scheduled_at?->format('Y-m-d'),
                'time' => $a->scheduled_at?->format('H:i'),
                'type' => $type,
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
    $employeeId = DB::table('employees')->where('user_id', $user->id)->value('id');
    $a = Appointment::where('employee_id', $employeeId)->findOrFail($id);

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
            $exists = Appointment::where('employee_id', $employeeId)
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
    $employeeId = DB::table('employees')->where('user_id', $user->id)->value('id');
    $a = Appointment::where('employee_id', $employeeId)->findOrFail($id);
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
    $employeeId = DB::table('employees')->where('user_id', $user->id)->value('id');
    $a = Appointment::where('employee_id', $employeeId)->findOrFail($id);
        $a->status = 'cancelled';
        $a->save();
        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous annulé avec succès',
        ]);
    }
}
