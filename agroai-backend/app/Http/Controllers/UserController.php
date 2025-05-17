<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;
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
     * Show the currently authenticated user (admin only).
     */
    public function show()
    {
        $me = Auth::user();
        if ($me->role !== 'administrator') {
            return response()->json(
                ['message' => 'Forbidden. Only administrators can view user details.'],
                403
            );
        }

        return new UserResource($me);
    }
}
