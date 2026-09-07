<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        $rekap = Attendance::where('student_id', $student->id)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'nama' => $student->user->name,
            'kelas' => $student->classRoom->name,
            'riwayat' => [
                'hadir' => $rekap->get('hadir', 0),
                'sakit' => $rekap->get('sakit', 0),
                'izin' => $rekap->get('izin', 0),
                'alpa' => $rekap->get('alpa', 0),
            ],
        ]);
    }
}