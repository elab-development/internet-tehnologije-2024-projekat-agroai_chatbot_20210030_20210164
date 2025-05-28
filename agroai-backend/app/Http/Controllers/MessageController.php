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
     * call the GitHub AI Inference endpoint (OpenAI GPT-4.1) to get the AI response.
     */
    public function store(Request $request, Chat $chat)
    {
        $user = Auth::user();
        if ($user->role !== 'regular') {
            return response()->json(['message' => 'Forbidden. Only regular users can create messages.'], 403);
        }
        if ($chat->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden. You do not own this chat.'], 403);
        }

        // 1) Validate incoming content
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // 2) Persist the user's message
        $message = $chat->messages()->create([
            'content' => $validated['content'],
        ]);

        // 3) Call GitHub AI Inference (GPT-4.1) via the models.github.ai router
        $endpoint = 'https://models.github.ai/inference/chat/completions';
        $response = Http::withToken(env('GITHUB_TOKEN'))
            ->acceptJson()
            ->post($endpoint, [
                'model'       => 'openai/gpt-4.1',
                'messages'    => [
                    [
                        'role'    => 'system',
                        'content' => 'You are an expert in agriculture, providing clear, actionable advice.',
                    ],
                    [
                        'role'    => 'user',
                        'content' => $validated['content'],
                    ],
                ],
                'temperature' => 1.0,
                'top_p'       => 1.0,
                'stream'      => false,
            ]);

        // 4) Handle errors or extract the assistant’s reply
        if ($response->failed()) {
            \Log::error('GitHub AI Inference error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            $botContent = 'The AI service is unavailable. Please try again later.';
        } else {
            $json       = $response->json();
            $botContent = data_get($json, 'choices.0.message.content', '');
            if (! $botContent) {
                $botContent = 'Sorry, I couldn’t generate a response right now.';
            }
        }

        // 5) Persist the AI response
        $message->response()->create([
            'content' => $botContent,
        ]);

        // 6) Return the combined resource
        $message->load('response');
        return (new MessageResource($message))
            ->response()
            ->setStatusCode(201);
    }

}
