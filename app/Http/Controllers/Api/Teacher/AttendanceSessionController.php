<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttendanceSessionController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()->teacher;

        $sessions = AttendanceSession::with(['classRoom', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->latest()
            ->get()
            ->map(fn ($session) => $this->formatSession($session));

        return response()->json(['data' => $sessions]);
    }

    public function store(Request $request)
    {
        $teacher = $request->user()->teacher;

        $validated = $request->validate([
            'class_id' => ['required', 'exists:classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $session = AttendanceSession::create([
            'teacher_id' => $teacher->id,
            'class_id' => $validated['class_id'],
            'subject_id' => $validated['subject_id'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'qr_token' => Str::random(40),
            'status' => 'active',
        ]);

        $session->load(['classRoom', 'subject']);

        return response()->json([
            'message' => 'Sesi absensi berhasil dibuat.',
            'data' => $this->formatSession($session),
        ], 201);
    }

    public function show(Request $request, AttendanceSession $attendanceSession)
    {
        $this->authorizeOwnership($request, $attendanceSession);

        $attendanceSession->load(['classRoom', 'subject']);

        return response()->json(['data' => $this->formatSession($attendanceSession, true)]);
    }

    public function close(Request $request, AttendanceSession $attendanceSession)
    {
        $this->authorizeOwnership($request, $attendanceSession);

        $attendanceSession->update(['status' => 'closed']);

        return response()->json([
            'message' => 'Sesi absensi berhasil ditutup.',
        ]);
    }

    private function authorizeOwnership(Request $request, AttendanceSession $attendanceSession): void
    {
        abort_unless(
            $attendanceSession->teacher_id === $request->user()->teacher->id,
            403,
            'Anda tidak memiliki akses ke sesi ini.'
        );
    }

    private function formatSession(AttendanceSession $session, bool $withStudents = false): array
    {
        $data = [
            'id' => $session->id,
            'kelas' => $session->classRoom->name,
            'mata_pelajaran' => $session->subject->name,
            'tanggal' => $session->date->format('Y-m-d'),
            'waktu_mulai' => substr($session->start_time, 0, 5),
            'waktu_selesai' => substr($session->end_time, 0, 5),
            'qr_token' => $session->qr_token,
            'status' => $session->status,
        ];

        if ($withStudents) {
            $students = $session->classRoom->students()->with('user')->get();
            $attendances = $session->attendances()->get()->keyBy('student_id');

            $data['total_siswa'] = $students->count();
            $data['total_hadir'] = $attendances->where('status', 'hadir')->count();
            $data['siswa'] = $students->map(function ($student) use ($attendances) {
                $attendance = $attendances->get($student->id);

                return [
                    'nama' => $student->user->name,
                    'status' => $attendance?->status ?? 'belum',
                    'waktu' => optional($attendance?->scanned_at)->format('H:i'),
                ];
            })->sortBy('nama')->values();
        }

        return $data;
    }
}