<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ResponseController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| Javni routovi
|--------------------------------------------------------------------------
*/

// Autentifikacija (registracija i prijavljivanje)
Route::post('register', [AuthController::class, 'register']);
Route::post('login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Zaštićeni routovi (sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('users/statistics', [UserController::class, 'statistics']);

    // users resource (only index & show)
    Route::apiResource('users', UserController::class)
         ->only(['index', 'show', 'update']);

    // chat CRUD
    Route::apiResource('chats', ChatController::class)
         ->only(['index','show','store','update','destroy']);

     // message routes 
    // List messages in a chat
    Route::get('chats/{chat}/messages', [MessageController::class, 'index']);

    // Create a new message in a chat
    Route::post('chats/{chat}/messages', [MessageController::class, 'store']);

    // Show a single message (with its response)
    Route::get('messages/{message}', [MessageController::class, 'show']);

    // response route
    // Show the AI response for a given message
    Route::get('messages/{message}/response', [ResponseController::class, 'show']);

    Route::post('logout', [AuthController::class, 'logout']);
});