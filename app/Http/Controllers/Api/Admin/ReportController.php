<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $laporan = $this->filteredQuery($request)
            ->latest('scanned_at')
            ->get()
            ->map(fn ($attendance) => $this->formatRow($attendance));

        return response()->json(['data' => $laporan]);
    }

    public function export(Request $request)
    {
        $data = $this->filteredQuery($request)->latest('scanned_at')->get();
        $filename = 'laporan-absensi-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Nama Siswa', 'Tanggal', 'Kelas', 'Mata Pelajaran', 'Status', 'Waktu']);

            foreach ($data as $attendance) {
                $row = $this->formatRow($attendance);
                fputcsv($handle, [
                    $row['nama_siswa'],
                    $row['tanggal'],
                    $row['kelas'],
                    $row['mata_pelajaran'],
                    $row['status'],
                    $row['waktu'] ?? '-',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function filteredQuery(Request $request)
    {
        $query = Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject']);

        if ($request->filled('tanggal_mulai')) {
            $query->whereHas('attendanceSession', function ($q) use ($request) {
                $q->whereDate('date', '>=', $request->input('tanggal_mulai'));
            });
        }

        if ($request->filled('tanggal_akhir')) {
            $query->whereHas('attendanceSession', function ($q) use ($request) {
                $q->whereDate('date', '<=', $request->input('tanggal_akhir'));
            });
        }

        if ($request->filled('class_id')) {
            $query->whereHas('attendanceSession', function ($q) use ($request) {
                $q->where('class_id', $request->input('class_id'));
            });
        }

        if ($request->filled('subject_id')) {
            $query->whereHas('attendanceSession', function ($q) use ($request) {
                $q->where('subject_id', $request->input('subject_id'));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $query;
    }

    private function formatRow(Attendance $attendance): array
    {
        return [
            'id' => $attendance->id,
            'nama_siswa' => $attendance->student->user->name,
            'tanggal' => $attendance->attendanceSession->date->format('Y-m-d'),
            'kelas' => $attendance->attendanceSession->classRoom->name,
            'mata_pelajaran' => $attendance->attendanceSession->subject->name,
            'status' => $attendance->status,
            'waktu' => optional($attendance->scanned_at)->format('H:i'),
        ];
    }
}