<?php

use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\StudentController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/classes-list', [StudentController::class, 'classesList']);
        Route::apiResource('students', StudentController::class)->except(['show']);
    });

    Route::middleware('role:teacher')->get('/teacher/ping', function () {
        return response()->json(['message' => 'Halo Guru, akses diterima.']);
    });

    Route::middleware('role:student')->get('/student/ping', function () {
        return response()->json(['message' => 'Halo Siswa, akses diterima.']);
    });
});