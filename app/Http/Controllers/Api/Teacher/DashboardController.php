<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()->teacher;

        $totalKelas = AttendanceSession::where('teacher_id', $teacher->id)
            ->distinct('class_id')
            ->count('class_id');

        $sesiHariIni = AttendanceSession::where('teacher_id', $teacher->id)
            ->whereDate('date', today());

        $sesiAktif = (clone $sesiHariIni)->where('status', 'active')->count();

        $absensiHariIni = Attendance::whereHas('attendanceSession', function ($query) use ($teacher) {
            $query->where('teacher_id', $teacher->id)->whereDate('date', today());
        })->count();

        $siswaHadirHariIni = Attendance::where('status', 'hadir')
            ->whereHas('attendanceSession', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->id)->whereDate('date', today());
            })->count();

        return response()->json([
            'stats' => [
                'total_kelas' => $totalKelas,
                'absensi_hari_ini' => $absensiHariIni,
                'sesi_aktif' => $sesiAktif,
                'siswa_hadir_hari_ini' => $siswaHadirHariIni,
            ],
        ]);
    }
}