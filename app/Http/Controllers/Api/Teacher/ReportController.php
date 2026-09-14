<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Exports\TeacherAttendanceExport;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Student;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use PDF;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()->teacher;

        $query = AttendanceSession::where('teacher_id', $teacher->id)
            ->with(['classRoom', 'subject']);

        if ($request->filled('tanggal_mulai')) {
            $query->whereDate('date', '>=', $request->input('tanggal_mulai'));
        }

        if ($request->filled('tanggal_akhir')) {
            $query->whereDate('date', '<=', $request->input('tanggal_akhir'));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        $sessions = $query->get();

        $sessionIds = $sessions->pluck('id');

        $attendances = Attendance::whereIn('attendance_session_id', $sessionIds)
            ->get()
            ->groupBy('student_id');

        $allAttendances = $attendances->flatten(1);

        $classMap = $sessions->groupBy('class_id')->map(fn ($s) => $s->first()->classRoom?->name ?? 'Tidak Diketahui');

        $studentIds = $attendances->keys();
        $students = Student::whereIn('id', $studentIds)
            ->with(['user', 'classRoom'])
            ->get()
            ->keyBy('id');

        $totalSesi = $sessions->count();
        $totalSiswa = $studentIds->unique()->count();
        $totalAbsensi = $allAttendances->count();
        $totalHadir = $allAttendances->where('status', 'hadir')->count();
        $totalIzin = $allAttendances->where('status', 'izin')->count();
        $totalSakit = $allAttendances->where('status', 'sakit')->count();
        $totalAlpa = $allAttendances->where('status', 'alpa')->count();
        $pctHadir = $totalAbsensi > 0 ? round(($totalHadir / $totalAbsensi) * 100, 1) : 0;

        $perKelas = [];
        foreach ($sessions->groupBy('class_id') as $classId => $classSessions) {
            $classSessionIds = $classSessions->pluck('id')->all();
            $classAttendances = $allAttendances->whereIn('attendance_session_id', $classSessionIds);

            $total = $classAttendances->count();
            $hadir = $classAttendances->where('status', 'hadir')->count();
            $izin = $classAttendances->where('status', 'izin')->count();
            $sakit = $classAttendances->where('status', 'sakit')->count();
            $alpa = $classAttendances->where('status', 'alpa')->count();
            $pct = $total > 0 ? round(($hadir / $total) * 100, 1) : 0;

            $perKelas[] = [
                'kelas' => $classMap[$classId] ?? 'Tidak Diketahui',
                'class_id' => (int) $classId,
                'total' => $total,
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpa' => $alpa,
                'pct' => $pct,
            ];
        }

        usort($perKelas, fn ($a, $b) => $b['pct'] <=> $a['pct']);

        $perSiswa = [];
        foreach ($studentIds->unique() as $sid) {
            $studentAttendances = $attendances->get($sid, collect());
            $student = $students->get($sid);

            if (!$student || !$student->user) continue;

            $total = $studentAttendances->count();
            $hadir = $studentAttendances->where('status', 'hadir')->count();
            $izin = $studentAttendances->where('status', 'izin')->count();
            $sakit = $studentAttendances->where('status', 'sakit')->count();
            $alpa = $studentAttendances->where('status', 'alpa')->count();
            $pct = $total > 0 ? round(($hadir / $total) * 100, 1) : 0;

            $perSiswa[] = [
                'id' => $student->id,
                'nama' => $student->user->name,
                'kelas' => $student->classRoom?->name ?? 'Tidak Diketahui',
                'total' => $total,
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpa' => $alpa,
                'pct' => $pct,
            ];
        }

        usort($perSiswa, fn ($a, $b) => $a['nama'] <=> $b['nama']);

        $perTanggal = [];
        foreach ($sessions->groupBy('date') as $date => $dateSessions) {
            $dateSessionIds = $dateSessions->pluck('id')->all();
            $dateAttendances = $allAttendances->whereIn('attendance_session_id', $dateSessionIds);

            $total = $dateAttendances->count();
            $hadir = $dateAttendances->where('status', 'hadir')->count();
            $izin = $dateAttendances->where('status', 'izin')->count();
            $sakit = $dateAttendances->where('status', 'sakit')->count();
            $alpa = $dateAttendances->where('status', 'alpa')->count();
            $pct = $total > 0 ? round(($hadir / $total) * 100, 1) : 0;

            $perTanggal[] = [
                'tanggal' => is_string($date) ? $date : $date->format('Y-m-d'),
                'total' => $total,
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpa' => $alpa,
                'pct' => $pct,
            ];
        }

        usort($perTanggal, fn ($a, $b) => $a['tanggal'] <=> $b['tanggal']);

        return response()->json([
            'summary' => [
                'total_sesi' => $totalSesi,
                'total_siswa' => $totalSiswa,
                'total_absensi' => $totalAbsensi,
                'total_hadir' => $totalHadir,
                'total_izin' => $totalIzin,
                'total_sakit' => $totalSakit,
                'total_alpa' => $totalAlpa,
                'pct_hadir' => $pctHadir,
                'tidak_hadir' => $totalIzin + $totalSakit + $totalAlpa,
            ],
            'per_kelas' => $perKelas,
            'per_siswa' => $perSiswa,
            'per_tanggal' => $perTanggal,
        ]);
    }

    public function export(Request $request)
    {
        $teacher = $request->user()->teacher;
        $sessionIds = AttendanceSession::where('teacher_id', $teacher->id);

        if ($request->filled('tanggal_mulai')) {
            $sessionIds->whereDate('date', '>=', $request->input('tanggal_mulai'));
        }
        if ($request->filled('tanggal_akhir')) {
            $sessionIds->whereDate('date', '<=', $request->input('tanggal_akhir'));
        }
        if ($request->filled('class_id')) {
            $sessionIds->where('class_id', $request->input('class_id'));
        }
        if ($request->filled('subject_id')) {
            $sessionIds->where('subject_id', $request->input('subject_id'));
        }
        $sessionIds = $sessionIds->pluck('id');

        $data = Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject'])
            ->whereIn('attendance_session_id', $sessionIds)
            ->latest('scanned_at')
            ->get()
            ->map(fn ($a) => [
                'nama_siswa' => $a->student->user->name,
                'tanggal' => $a->attendanceSession->date->format('Y-m-d'),
                'kelas' => $a->attendanceSession->classRoom->name,
                'mata_pelajaran' => $a->attendanceSession->subject->name,
                'status' => $a->status,
                'waktu' => optional($a->scanned_at)->format('H:i') ?? '-',
            ]);

        $filename = 'laporan-absensi-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Nama Siswa', 'Tanggal', 'Kelas', 'Mata Pelajaran', 'Status', 'Waktu']);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row['nama_siswa'],
                    $row['tanggal'],
                    $row['kelas'],
                    $row['mata_pelajaran'],
                    $row['status'],
                    $row['waktu'],
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function exportPdf(Request $request)
    {
        $teacher = $request->user()->teacher;
        $sessionIds = AttendanceSession::where('teacher_id', $teacher->id);

        if ($request->filled('tanggal_mulai')) {
            $sessionIds->whereDate('date', '>=', $request->input('tanggal_mulai'));
        }
        if ($request->filled('tanggal_akhir')) {
            $sessionIds->whereDate('date', '<=', $request->input('tanggal_akhir'));
        }
        if ($request->filled('class_id')) {
            $sessionIds->where('class_id', $request->input('class_id'));
        }
        if ($request->filled('subject_id')) {
            $sessionIds->where('subject_id', $request->input('subject_id'));
        }
        $sessionIds = $sessionIds->pluck('id');

        $data = Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject'])
            ->whereIn('attendance_session_id', $sessionIds)
            ->latest('scanned_at')
            ->get()
            ->map(fn ($a) => [
                'nama_siswa' => $a->student->user->name,
                'tanggal' => $a->attendanceSession->date->format('Y-m-d'),
                'kelas' => $a->attendanceSession->classRoom->name,
                'mata_pelajaran' => $a->attendanceSession->subject->name,
                'status' => $a->status,
                'waktu' => optional($a->scanned_at)->format('H:i') ?? '-',
            ]);

        $filename = 'laporan-absensi-' . now()->format('Y-m-d-His') . '.pdf';
        $pdf = PDF::loadView('teacher.report-export', ['data' => $data]);

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request)
    {
        $teacher = $request->user()->teacher;
        $sessionIds = AttendanceSession::where('teacher_id', $teacher->id);

        if ($request->filled('tanggal_mulai')) {
            $sessionIds->whereDate('date', '>=', $request->input('tanggal_mulai'));
        }
        if ($request->filled('tanggal_akhir')) {
            $sessionIds->whereDate('date', '<=', $request->input('tanggal_akhir'));
        }
        if ($request->filled('class_id')) {
            $sessionIds->where('class_id', $request->input('class_id'));
        }
        if ($request->filled('subject_id')) {
            $sessionIds->where('subject_id', $request->input('subject_id'));
        }
        $sessionIds = $sessionIds->pluck('id');

        $data = Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject'])
            ->whereIn('attendance_session_id', $sessionIds)
            ->latest('scanned_at')
            ->get()
            ->map(fn ($a) => [
                'nama_siswa' => $a->student->user->name,
                'tanggal' => $a->attendanceSession->date->format('Y-m-d'),
                'kelas' => $a->attendanceSession->classRoom->name,
                'mata_pelajaran' => $a->attendanceSession->subject->name,
                'status' => $a->status,
                'waktu' => optional($a->scanned_at)->format('H:i') ?? '-',
            ]);

        $filename = 'laporan-absensi-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new TeacherAttendanceExport($data), $filename);
    }
}
