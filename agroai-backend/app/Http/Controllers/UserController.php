<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * List all users (admin only).
     */
    public function index()
    {
        $me = Auth::user();
        if ($me->role !== 'administrator') {
            return response()->json(
                ['message' => 'Forbidden. Only administrators can list users.'],
                403
            );
        }

        $users = User::all();
        return UserResource::collection($users);
    }

    /**
     * Show a user by ID (admin only).
     */
    public function show($id)
    {
        $me = Auth::user();

        if ($me->role !== 'administrator') {
            return response()->json(
                ['message' => 'Forbidden. Only administrators can view user details.'],
                403
            );
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        return new UserResource($user);
    }

    /**
    * Update a user's name, email, and image_url (admin only).
    */
    public function update(Request $request, $id)
    {
        $me = Auth::user();
        if ($me->role !== 'administrator') {
            return response()->json(
                ['message' => 'Forbidden. Only administrators can update users.'],
                403
            );
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'email'     => 'sometimes|required|string|email|unique:users,email,' . $id,
            'image_url' => 'nullable|url',
        ]);

        $user->update($validated);

        return new UserResource($user);
    }
}
