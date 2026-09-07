<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceHistoryController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        $query = Attendance::with(['attendanceSession.classRoom', 'attendanceSession.subject'])
            ->where('student_id', $student->id);

        if ($request->filled('bulan')) {
            $query->whereHas('attendanceSession', function ($q) use ($request) {
                $q->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$request->input('bulan')]);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('subject_id')) {
            $query->whereHas('attendanceSession', function ($q) use ($request) {
                $q->where('subject_id', $request->input('subject_id'));
            });
        }

        $riwayat = $query->latest('scanned_at')
            ->get()
            ->map(fn ($attendance) => [
                'id' => $attendance->id,
                'tanggal' => $attendance->attendanceSession->date->format('Y-m-d'),
                'mata_pelajaran' => $attendance->attendanceSession->subject->name,
                'kelas' => $attendance->attendanceSession->classRoom->name,
                'status' => $attendance->status,
                'waktu' => optional($attendance->scanned_at)->format('H:i'),
            ]);

        return response()->json(['data' => $riwayat]);
    }
}