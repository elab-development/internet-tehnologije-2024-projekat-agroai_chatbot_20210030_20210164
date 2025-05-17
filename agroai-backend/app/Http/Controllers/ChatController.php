<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Chat;
use App\Http\Resources\ChatResource;

class ChatController extends Controller
{
    /**
     * List all chats of the authenticated regular user.
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message'=>'Forbidden. Only regular users can list chats.'],
                403
            );
        }

        $chats = Chat::where('user_id', $user->id)
                     ->select('id','title','created_at','updated_at')
                     ->get();

        return ChatResource::collection($chats);
    }

    /**
     * Show a specific chat with its messages and responses.
     */
    public function show($id)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message'=>'Forbidden. Only regular users can view chats.'],
                403
            );
        }

        $chat = Chat::with('messages.response')
                    ->where('user_id', $user->id)
                    ->find($id);

        if (! $chat) {
            return response()->json(['message'=>'Chat not found.'], 404);
        }

        return new ChatResource($chat);
    }

    /**
     * Create a new chat for the authenticated regular user.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message'=>'Forbidden. Only regular users can create chats.'],
                403
            );
        }

        $validated = $request->validate([
            'title' => 'required|string|max:1000',
        ]);

        $chat = Chat::create([
            'user_id' => $user->id,
            'title'   => $validated['title'],
        ]);

        return (new ChatResource($chat))
               ->response()
               ->setStatusCode(201);
    }

    /**
     * Update only the title of a specific chat belonging to the regular user.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message'=>'Forbidden. Only regular users can update chats.'],
                403
            );
        }

        $chat = Chat::where('user_id',$user->id)->find($id);
        if (! $chat) {
            return response()->json(['message'=>'Chat not found.'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:1000',
        ]);

        $chat->update(['title'=>$validated['title']]);

        return new ChatResource($chat);
    }

    /**
     * Delete a specific chat belonging to the regular user.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message'=>'Forbidden. Only regular users can delete chats.'],
                403
            );
        }

        $chat = Chat::where('user_id',$user->id)->find($id);
        if (! $chat) {
            return response()->json(['message'=>'Chat not found.'], 404);
        }

        $chat->delete();

        return response()->noContent();
    }
}
