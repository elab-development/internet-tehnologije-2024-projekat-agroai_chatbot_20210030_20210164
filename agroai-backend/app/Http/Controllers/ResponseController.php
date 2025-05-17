<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use App\Models\Message;
use App\Http\Resources\ResponseResource;

class ResponseController extends Controller
{
    /**
     * Show the AI response for a given user message,
     * only if the authenticated user is a regular and owns the parent chat.
     */
    public function show(Message $message)
    {
        $user = Auth::user();

        if ($user->role !== 'regular') {
            return response()->json(
                ['message' => 'Forbidden. Only regular users can view responses.'],
                403
            );
        }

        if ($message->chat->user_id !== $user->id) {
            return response()->json(
                ['message' => 'Forbidden. You do not own this chat.'],
                403
            );
        }

        $response = $message->response;

        if (! $response) {
            return response()->json(
                ['message' => 'Response not found.'],
                404
            );
        }

        return new ResponseResource($response);
    }
}
