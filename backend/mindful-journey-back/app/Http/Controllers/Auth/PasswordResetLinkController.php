<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        // Envoi (toujours répondre par un message générique pour ne pas révéler l'existence du compte)
        try {
            Password::sendResetLink($request->only('email'));
        } catch (\Throwable $e) {
            Log::error('Password reset email sending failed', [
                'error' => $e->getMessage(),
                'class' => get_class($e)
            ]);
            // Ne pas propager pour éviter 500 côté client: on garde la réponse générique
        }

        // Si appel API (pas de session), renvoyer JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => __('A reset link will be sent if the account exists.')
            ]);
        }

        // Fallback web (session flash)
        return back()->with('status', __('A reset link will be sent if the account exists.'));
    }
}
