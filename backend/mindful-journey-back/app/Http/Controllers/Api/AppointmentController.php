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

        // Déduire entreprise_id si la colonne existe dans appointments
        $apptColumns = \Illuminate\Support\Facades\Schema::getColumnListing('appointments');
        $appointmentPayload = [
            'employee_id' => $employeeId,
            'practitioner_id' => $spec->id,
            'praticien_id' => null, // Initialize to null
            'scheduled_at' => $scheduledAt,
            'mode' => $mode,
            'status' => 'confirmed',
            'price_cents' => $priceCents,
            'notes' => $validated['notes'] ?? null,
        ];

        // If the database uses the French column name, set it too to satisfy NOT NULL constraints
        try {
            if (\Illuminate\Support\Facades\Schema::hasColumn('appointments', 'praticien_id')) {
                $appointmentPayload['praticien_id'] = $spec->id;
            }
        } catch (\Throwable $e) {
            // ignore schema check failures in case of permission issues
        }

        // Renseigner created_by si la colonne existe (certains schémas la déclarent NOT NULL)
        try {
            if (\Illuminate\Support\Facades\Schema::hasColumn('appointments', 'created_by')) {
                $appointmentPayload['created_by'] = $user->id;
            }
        } catch (\Throwable $e) {
            // ignore schema check failures
        }

        if (in_array('entreprise_id', $apptColumns, true)) {
            // 1) essayer enterprise via employees
            $empEntrepriseId = DB::table('employees')->where('id', $employeeId)->value('entreprise_id');
            // 2) fallback via users.entreprise_id
            $userEntrepriseId = null;
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'entreprise_id')) {
                $userEntrepriseId = DB::table('users')->where('id', $user->id)->value('entreprise_id');
            }
            // 3) fallback via practitioners.entreprise_id
            $practEntrepriseId = DB::table('practitioners')->where('id', $spec->id)->value('entreprise_id');

            $entrepriseId = $empEntrepriseId ?? $userEntrepriseId ?? $practEntrepriseId;

            // Si toujours null mais colonne NOT NULL, tenter un id quelconque
            if ($entrepriseId === null) {
                try {
                    $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
                    $notNull = false;
                    if ($dbName) {
                        $row = DB::selectOne('SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1', [$dbName, 'appointments', 'entreprise_id']);
                        $notNull = isset($row) && ($row->IS_NULLABLE === 'NO');
                    }
                    if ($notNull && \Illuminate\Support\Facades\Schema::hasTable('entreprises')) {
                        $entrepriseId = DB::table('entreprises')->value('id');
                    }
                } catch (\Throwable $e) { /* ignore */
                }
            }

            if ($entrepriseId !== null) {
                $appointmentPayload['entreprise_id'] = $entrepriseId;
            }
        }

        // Gérer un éventuel service_id NOT NULL dans appointments
        if (in_array('service_id', $apptColumns, true)) {
            $serviceId = null;
            $serviceNotNull = false;
            try {
                $dbName = DB::selectOne('SELECT DATABASE() AS db')->db ?? null;
                if ($dbName) {
                    $row = DB::selectOne('SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1', [$dbName, 'appointments', 'service_id']);
                    $serviceNotNull = isset($row) && ($row->IS_NULLABLE === 'NO');
                }
            } catch (\Throwable $e) { /* ignore */
            }

            // Si la base utilise la table appointment_services (FK stricte), privilégier cette source
            if (\Illuminate\Support\Facades\Schema::hasTable('appointment_services')) {
                $serviceId = DB::table('appointment_services')->value('id');
            }
            // Sinon, essayer de récupérer un service lié au praticien
            if ($serviceId === null && \Illuminate\Support\Facades\Schema::hasTable('practitioner_services')) {
                $serviceId = DB::table('practitioner_services')->where('practitioner_id', $spec->id)->value('service_id')
                    ?? DB::table('practitioner_services')->value('service_id');
            }
            // Sinon tenter la table services
            if ($serviceId === null && \Illuminate\Support\Facades\Schema::hasTable('services')) {
                $serviceId = DB::table('services')->value('id');
            }
            // Autre convention possible
            if ($serviceId === null && \Illuminate\Support\Facades\Schema::hasTable('specialist_services')) {
                $serviceId = DB::table('specialist_services')->where('specialist_id', $spec->id)->value('service_id')
                    ?? DB::table('specialist_services')->value('service_id');
            }

            // Si NOT NULL et aucun service trouvable: renvoyer une erreur 422 explicite
            if ($serviceId === null && $serviceNotNull) {
                return response()->json([
                    'success' => false,
                    'message' => "Aucun service disponible pour ce rendez-vous. Veuillez créer/assigner un service au praticien."
                ], 422);
            }

            if ($serviceId !== null) {
                $appointmentPayload['service_id'] = $serviceId;
            }
        }

        $appointment = Appointment::create($appointmentPayload);

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
