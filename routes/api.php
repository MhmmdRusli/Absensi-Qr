<?php

use App\Http\Controllers\Api\Admin\ClassRoomController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\StudentController;
use App\Http\Controllers\Api\Admin\SubjectController;
use App\Http\Controllers\Api\Admin\TeacherController;
use App\Http\Controllers\Api\Student\AttendanceController;
use App\Http\Controllers\Api\Student\AttendanceHistoryController;
use App\Http\Controllers\Api\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Api\Student\PermissionController;
use App\Http\Controllers\Api\Teacher\AttendanceSessionController;
use App\Http\Controllers\Api\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Api\Teacher\ScheduleController;
use App\Http\Controllers\Api\Teacher\StudentController as TeacherStudentController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/classes-list', [ClassRoomController::class, 'classesList']);
    Route::get('/subjects-list', [SubjectController::class, 'subjectsList']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/profile', [AdminProfileController::class, 'show']);
        Route::put('/profile', [AdminProfileController::class, 'update']);
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/export', [ReportController::class, 'export']);
        Route::get('/reports/export/pdf', [ReportController::class, 'exportPdf']);
        Route::get('/reports/export/excel', [ReportController::class, 'exportExcel']);
        Route::apiResource('students', StudentController::class)->except(['show']);
        Route::get('/students/export', [StudentController::class, 'export']);
        Route::get('/students/import/template', [StudentController::class, 'downloadTemplate']);
        Route::post('/students/import', [StudentController::class, 'import']);
        Route::apiResource('teachers', TeacherController::class)->except(['show']);
        Route::get('/teachers/export', [TeacherController::class, 'export']);
        Route::get('/teachers/import/template', [TeacherController::class, 'downloadTemplate']);
        Route::post('/teachers/import', [TeacherController::class, 'import']);
        Route::apiResource('classes', ClassRoomController::class)
            ->except(['show'])
            ->parameters(['classes' => 'classRoom']);
        Route::get('/classes/export', [ClassRoomController::class, 'export']);
        Route::get('/classes/import/template', [ClassRoomController::class, 'downloadTemplate']);
        Route::post('/classes/import', [ClassRoomController::class, 'import']);
        Route::apiResource('subjects', SubjectController::class)->except(['show']);
        Route::get('/subjects/export', [SubjectController::class, 'export']);
        Route::get('/subjects/import/template', [SubjectController::class, 'downloadTemplate']);
        Route::post('/subjects/import', [SubjectController::class, 'import']);
    });

    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        Route::get('/reports', [\App\Http\Controllers\Api\Teacher\ReportController::class, 'index']);
        Route::get('/reports/export', [\App\Http\Controllers\Api\Teacher\ReportController::class, 'export']);
        Route::get('/reports/export/pdf', [\App\Http\Controllers\Api\Teacher\ReportController::class, 'exportPdf']);
        Route::get('/reports/export/excel', [\App\Http\Controllers\Api\Teacher\ReportController::class, 'exportExcel']);
        Route::get('/students', [TeacherStudentController::class, 'index']);
        Route::get('/schedules', [ScheduleController::class, 'index']);
        Route::post('/schedules', [ScheduleController::class, 'store']);
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);
        Route::post('/sessions/{attendanceSession}/close', [AttendanceSessionController::class, 'close']);
        Route::get('/sessions/{attendanceSession}/export', [AttendanceSessionController::class, 'export']);
        Route::get('/sessions/{attendanceSession}/export/pdf', [AttendanceSessionController::class, 'exportPdf']);
        Route::get('/sessions/{attendanceSession}/export/excel', [AttendanceSessionController::class, 'exportExcel']);
        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
        Route::apiResource('sessions', AttendanceSessionController::class)
            ->only(['index', 'store', 'show'])
            ->parameters(['sessions' => 'attendanceSession']);
    });

    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/attendance/scan', [AttendanceController::class, 'scan']);
        Route::get('/attendance/history', [AttendanceHistoryController::class, 'index']);
        Route::get('/attendance/export', [AttendanceHistoryController::class, 'export']);
        Route::get('/attendance/export/pdf', [AttendanceHistoryController::class, 'exportPdf']);
        Route::get('/attendance/export/excel', [AttendanceHistoryController::class, 'exportExcel']);
        Route::get('/permissions', [PermissionController::class, 'index']);
        Route::post('/permissions', [PermissionController::class, 'store']);
    });
});