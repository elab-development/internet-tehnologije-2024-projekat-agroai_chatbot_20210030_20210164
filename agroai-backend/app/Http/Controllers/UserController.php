<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Chat;
use App\Models\Message;

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

    public function statistics()
    {
        $auth = Auth::user();
        if (!$auth || $auth->role !== 'administrator') {
            return response()->json(
                ['message' => 'Forbidden. Only administrators can view user statistics.'],
                403
            );
        }

        // Imports needed at top of file:
        // use App\Models\User;
        // use App\Models\Chat;
        // use App\Models\Message;

        $totalUsers        = User::count();
        $regularUsers      = User::where('role', 'regular')->count();
        $administrators    = User::where('role', 'administrator')->count();

        $totalChats        = Chat::count();
        $totalMessages     = Message::count();

        $usersWithChats    = User::whereHas('chats')->count();
        $avgChatsPerUser   = $totalUsers ? round($totalChats / $totalUsers, 2) : 0;
        $avgMsgsPerChat    = $totalChats ? round($totalMessages / $totalChats, 2) : 0;
        $newLast7Days      = User::where('created_at', '>=', now()->subDays(7))->count();

        // Top 5 users by number of chats (assumes User has `chats()` relation)
        $topUsersByChats = User::withCount('chats')
            ->orderByDesc('chats_count')
            ->limit(5)
            ->get(['id','name','email','image_url','role'])
            ->map(fn($u) => [
                'id'          => $u->id,
                'name'        => $u->name,
                'email'       => $u->email,
                'role'        => $u->role,
                'image_url'   => $u->image_url ?? null,
                'chats_count' => $u->chats_count,
            ]);

        return response()->json([
            'data' => [
                'totals' => [
                    'users'         => $totalUsers,
                    'regular_users' => $regularUsers,
                    'administrators'=> $administrators,
                    'chats'         => $totalChats,
                    'messages'      => $totalMessages,
                ],
                'derived' => [
                    'users_with_at_least_one_chat' => $usersWithChats,
                    'avg_chats_per_user'           => $avgChatsPerUser,
                    'avg_messages_per_chat'        => $avgMsgsPerChat,
                    'new_users_last_7_days'        => $newLast7Days,
                ],
                'top_users_by_chats' => $topUsersByChats,
            ]
        ], 200);
    }

}
