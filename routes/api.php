<?php

use App\Http\Controllers\Api\Admin\ClassRoomController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\StudentController;
use App\Http\Controllers\Api\Admin\SubjectController;
use App\Http\Controllers\Api\Admin\TeacherController;
use App\Http\Controllers\Api\Teacher\AttendanceSessionController;
use App\Http\Controllers\Api\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Bisa diakses admin maupun guru (untuk dropdown pilihan)
    Route::get('/classes-list', [ClassRoomController::class, 'classesList']);
    Route::get('/subjects-list', [SubjectController::class, 'subjectsList']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::apiResource('students', StudentController::class)->except(['show']);
        Route::apiResource('teachers', TeacherController::class)->except(['show']);
        Route::apiResource('classes', ClassRoomController::class)
            ->except(['show'])
            ->parameters(['classes' => 'classRoom']);
        Route::apiResource('subjects', SubjectController::class)->except(['show']);
    });

    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
        Route::apiResource('sessions', AttendanceSessionController::class)
            ->only(['index', 'store', 'show'])
            ->parameters(['sessions' => 'attendanceSession']);
    });

    Route::middleware('role:student')->get('/student/ping', function () {
        return response()->json(['message' => 'Halo Siswa, akses diterima.']);
    });
});