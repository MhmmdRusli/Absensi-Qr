<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $student = $request->user()->student;

        $session = AttendanceSession::with(['classRoom', 'subject'])
            ->where('qr_token', $validated['token'])
            ->first();

        if (! $session) {
            return response()->json([
                'message' => 'QR Code tidak valid atau sudah tidak berlaku.',
            ], 422);
        }

        if ($session->status !== 'active') {
            return response()->json([
                'message' => 'Sesi absensi sudah ditutup.',
            ], 422);
        }

        $now = now();
        $sessionEnd = $session->date->copy()->setTimeFromTimeString($session->end_time);

        if ($now->greaterThan($sessionEnd)) {
            return response()->json([
                'message' => 'QR Code sudah tidak berlaku.',
            ], 422);
        }

        if ($session->class_id !== $student->class_id) {
            return response()->json([
                'message' => 'QR Code ini bukan untuk kelas Anda.',
            ], 422);
        }

        $sudahAbsen = Attendance::where('attendance_session_id', $session->id)
            ->where('student_id', $student->id)
            ->exists();

        if ($sudahAbsen) {
            return response()->json([
                'message' => 'Anda sudah melakukan absensi pada sesi ini.',
            ], 422);
        }

        $attendance = Attendance::create([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
            'status' => 'hadir',
            'scanned_at' => $now,
        ]);

        return response()->json([
            'message' => 'Absensi berhasil.',
            'data' => [
                'nama' => $student->user->name,
                'kelas' => $session->classRoom->name,
                'mata_pelajaran' => $session->subject->name,
                'status' => $attendance->status,
                'waktu' => $attendance->scanned_at->format('H:i'),
            ],
        ]);
    }
}