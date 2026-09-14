<?php

namespace App\Http\Controllers\Api\Student;

use App\Exports\StudentAttendanceExport;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use PDF;

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

    public function export(Request $request)
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

        $data = $query->latest('scanned_at')->get()->map(fn ($a) => [
            'Tanggal' => $a->attendanceSession->date->format('Y-m-d'),
            'Mata Pelajaran' => $a->attendanceSession->subject->name,
            'Kelas' => $a->attendanceSession->classRoom->name,
            'Status' => $a->status,
            'Waktu' => optional($a->scanned_at)->format('H:i') ?? '-',
        ]);

        $filename = 'riwayat-absensi-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($data) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Mata Pelajaran', 'Kelas', 'Status', 'Waktu']);
            foreach ($data as $row) {
                fputcsv($handle, [
                    $row['Tanggal'],
                    $row['Mata Pelajaran'],
                    $row['Kelas'],
                    $row['Status'],
                    $row['Waktu'],
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function exportPdf(Request $request)
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

        $data = $query->latest('scanned_at')->get()->map(fn ($a) => [
            'Tanggal' => $a->attendanceSession->date->format('Y-m-d'),
            'Mata Pelajaran' => $a->attendanceSession->subject->name,
            'Kelas' => $a->attendanceSession->classRoom->name,
            'Status' => $a->status,
            'Waktu' => optional($a->scanned_at)->format('H:i') ?? '-',
        ]);

        $filename = 'riwayat-absensi-' . now()->format('Y-m-d-His') . '.pdf';
        $pdf = PDF::loadView('student.history-pdf', ['data' => $data]);

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request)
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

        $filename = 'riwayat-absensi-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new StudentAttendanceExport($request->only(['bulan', 'status', 'subject_id'])), $filename);
    }
}