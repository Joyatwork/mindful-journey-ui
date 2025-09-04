<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnnualDiagnostic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnualDiagnosticController extends Controller
{
    public function show(): JsonResponse
    {
        $user = request()->user();
        if (!$user) return response()->json(['success' => true, 'data' => null]);
        $diag = AnnualDiagnostic::where('user_id', $user->id)->latest('completed_at')->first();
        return response()->json(['success' => true, 'data' => $diag]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stress_level'   => 'required|integer|between:1,10',
            'energy_level'   => 'required|integer|between:1,10',
            'work_pressure'  => 'required|string',
            'gender'         => 'nullable|string|max:30',
            'age_group'      => 'nullable|string|max:30',
            'department'     => 'nullable|string|max:120',
            'answers'        => 'required|array',
        ]);
        $user = $request->user();
        if ($user) {
            $recent = AnnualDiagnostic::where('user_id', $user->id)
                ->where('completed_at', '>=', now()->subDays(365))
                ->orderByDesc('completed_at')
                ->first();
            if ($recent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Auto-diagnostic annuel déjà réalisé durant les 12 derniers mois.',
                    'next_allowed_at' => $recent->completed_at?->copy()->addYear(),
                ], 429);
            }
        }
        $record = AnnualDiagnostic::create([
            'user_id'      => $user?->id,
            'gender'       => $validated['gender'] ?? ($request->input('answers.gender') ?? null),
            'age_group'    => $validated['age_group'] ?? ($request->input('answers.age') ?? null),
            'department'   => $validated['department'] ?? ($request->input('answers.department') ?? null),
            'stress_level' => $validated['stress_level'],
            'energy_level' => $validated['energy_level'],
            'work_pressure'=> $validated['work_pressure'],
            'answers'      => $validated['answers'],
            'completed_at' => now(),
        ]);
        return response()->json(['success' => true,'message' => 'Auto-diagnostic annuel sauvegardé','data' => $record], 201);
    }

    public function index(): JsonResponse
    {
        $user = request()->user();
        if (!$user) return response()->json(['success' => true, 'data' => []]);
        $items = AnnualDiagnostic::where('user_id', $user->id)->orderByDesc('completed_at')->paginate(25);
        return response()->json(['success' => true, 'data' => $items]);
    }
}
