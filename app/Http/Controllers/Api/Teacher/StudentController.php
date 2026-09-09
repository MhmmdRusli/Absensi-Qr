<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()->teacher;

        $classIds = AttendanceSession::where('teacher_id', $teacher->id)
            ->distinct('class_id')
            ->pluck('class_id');

        $students = Student::whereIn('class_id', $classIds)
            ->with(['user', 'classRoom'])
            ->get();

        $sessionCountsByClass = AttendanceSession::where('teacher_id', $teacher->id)
            ->select('class_id', DB::raw('count(*) as total'))
            ->groupBy('class_id')
            ->pluck('total', 'class_id');

        $sessionIds = AttendanceSession::where('teacher_id', $teacher->id)->pluck('id');

        $attendances = Attendance::whereIn('attendance_session_id', $sessionIds)
            ->get()
            ->groupBy('student_id');

        $data = $students->map(function ($student) use ($attendances, $sessionCountsByClass) {
            $studentAttendances = $attendances->get($student->id, collect());
            $totalSessions = (int) ($sessionCountsByClass[$student->class_id] ?? 0);
            $totalHadir = (int) $studentAttendances->where('status', 'hadir')->count();
            $pct = $totalSessions > 0 ? round(($totalHadir / $totalSessions) * 100, 1) : 0;

            return [
                'id' => $student->id,
                'nama' => $student->user->name,
                'kelas' => $student->classRoom->name,
                'class_id' => $student->class_id,
                'total_sesi' => $totalSessions,
                'total_hadir' => $totalHadir,
                'pct' => $pct,
            ];
        })
        ->sortBy('nama')
        ->values();

        return response()->json(['data' => $data]);
    }
}
