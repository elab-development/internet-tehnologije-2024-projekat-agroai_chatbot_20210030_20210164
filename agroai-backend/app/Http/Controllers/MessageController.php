<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\Chat;
use App\Models\Message;
use App\Http\Resources\MessageResource;

class MessageController extends Controller
{
    /**
     * List all messages (with their responses) for a given chat,
     * only if the authenticated user is a regular and owns the chat.
     */
    public function index(Chat $chat)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message' => 'Forbidden. Only regular users can list messages.'],
                403
            );
        }
        if ($chat->user_id !== $user->id) {
            return response()->json(
                ['message' => 'Forbidden. You do not own this chat.'],
                403
            );
        }

        $messages = $chat->messages()->with('response')->get();

        return MessageResource::collection($messages);
    }

    /**
     * Show one specific message (and its response),
     * only if the authenticated user is a regular and owns the parent chat.
     */
    public function show(Message $message)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message' => 'Forbidden. Only regular users can view messages.'],
                403
            );
        }
        if ($message->chat->user_id !== $user->id) {
            return response()->json(
                ['message' => 'Forbidden. You do not own this chat.'],
                403
            );
        }

        $message->load('response');
        return new MessageResource($message);
    }

    /**
     * Create a new message in a chat, and immediately
     * call DeepSeek-R1 to get the AI response.
     */
    public function store(Request $request, Chat $chat)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(
                ['message' => 'Forbidden. Only regular users can create messages.'],
                403
            );
        }
        if ($chat->user_id !== $user->id) {
            return response()->json(
                ['message' => 'Forbidden. You do not own this chat.'],
                403
            );
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $message = $chat->messages()->create([
            'content' => $validated['content'],
        ]);

        // call DeepSeek-R1
        $apiResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
            ])->post('https://api.deepseek.com/v1/reasoner', [
                'model'  => 'deepseek-r1',
                'prompt' => $validated['content'],
            ]);

        $botContent = data_get($apiResponse->json(), 'choices.0.message.content', '');

        $message->response()->create([
            'content' => $botContent,
        ]);

        $message->load('response');
        return (new MessageResource($message))
               ->response()
               ->setStatusCode(201);
    }
}
