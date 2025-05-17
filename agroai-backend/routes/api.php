<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
    Route::post('logout', [AuthController::class, 'logout']);
});