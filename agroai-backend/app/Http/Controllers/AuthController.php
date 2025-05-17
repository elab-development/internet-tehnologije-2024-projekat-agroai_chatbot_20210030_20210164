<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a new user and return token + user data.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|unique:users,email',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => 'required|in:regular,administrator',
            'image_url'  => 'nullable|url',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'role'      => $validated['role'],
            'image_url' => $validated['image_url'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        $message = $this->getRoleSpecificMessage($user->role, 'registered');

        return response()->json([
            'message'   => $message,
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'imageUrl'  => $user->image_url,
            'token'     => $token,
        ], 201);
    }

    /**
     * Log in an existing user and return token + user data.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt([
            'email'    => $validated['email'],
            'password' => $validated['password'],
        ])) {
            return response()->json(['error' => 'Invalid credentials!'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        $message = $this->getRoleSpecificMessage($user->role, 'logged in');

        return response()->json([
            'message'   => $message,
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'imageUrl'  => $user->image_url,
            'token'     => $token,
        ]);
    }

    /**
     * Log out the user (revoke all tokens).
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        $message = $this->getRoleSpecificMessage($user->role, 'logged out');

        return response()->json(['message' => $message]);
    }

    /**
     * Return a role-specific message based on action.
     */
    private function getRoleSpecificMessage(string $role, string $action): string
    {
        $roleMessages = [
            'regular' => [
                'registered' => 'Welcome! Your account has been successfully created. 🎉',
                'logged in'  => 'You are now logged in. Enjoy your experience! 👍',
                'logged out' => 'You have been logged out. See you soon! 👋',
            ],
            'administrator' => [
                'registered' => 'Welcome, administrator! You now have full access to the system. 🛠️',
                'logged in'  => 'Administrator logged in successfully. 🔧',
                'logged out' => 'Administrator has been logged out. 👋',
            ],
        ];

        return $roleMessages[$role][$action] ?? 'Action completed successfully.';
    }
}