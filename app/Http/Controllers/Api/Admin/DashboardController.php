<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalSiswa = Student::count();
        $totalGuru = Teacher::count();
        $totalKelas = ClassRoom::count();

        $totalAbsensiHariIni = Attendance::whereDate('created_at', today())->count();

        $absensiTerbaru = Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'nama_siswa' => $attendance->student->user->name,
                    'kelas' => $attendance->attendanceSession->classRoom->name,
                    'mata_pelajaran' => $attendance->attendanceSession->subject->name,
                    'status' => $attendance->status,
                    'waktu' => optional($attendance->scanned_at)->format('H:i'),
                ];
            });

        return response()->json([
            'stats' => [
                'total_siswa' => $totalSiswa,
                'total_guru' => $totalGuru,
                'total_kelas' => $totalKelas,
                'total_absensi_hari_ini' => $totalAbsensiHariIni,
            ],
            'absensi_terbaru' => $absensiTerbaru,
        ]);
    }
}