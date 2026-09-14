<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Http\Controllers\Api\Admin\ReportController;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class AttendanceExport implements FromView, WithEvents
{
    private array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function view(): View
    {
        $query = Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject']);

        if (isset($this->filters['tanggal_mulai']) && $this->filters['tanggal_mulai']) {
            $query->whereHas('attendanceSession', function ($q) {
                $q->whereDate('date', '>=', $this->filters['tanggal_mulai']);
            });
        }

        if (isset($this->filters['tanggal_akhir']) && $this->filters['tanggal_akhir']) {
            $query->whereHas('attendanceSession', function ($q) {
                $q->whereDate('date', '<=', $this->filters['tanggal_akhir']);
            });
        }

        if (isset($this->filters['class_id']) && $this->filters['class_id']) {
            $query->whereHas('attendanceSession', function ($q) {
                $q->where('class_id', $this->filters['class_id']);
            });
        }

        if (isset($this->filters['subject_id']) && $this->filters['subject_id']) {
            $query->whereHas('attendanceSession', function ($q) {
                $q->where('subject_id', $this->filters['subject_id']);
            });
        }

        if (isset($this->filters['status']) && $this->filters['status']) {
            $query->where('status', $this->filters['status']);
        }

        $data = $query->latest('scanned_at')->get()->map(function ($attendance) {
            return [
                'Nama Siswa' => $attendance->student->user->name,
                'Tanggal' => $attendance->attendanceSession->date->format('Y-m-d'),
                'Kelas' => $attendance->attendanceSession->classRoom->name,
                'Mata Pelajaran' => $attendance->attendanceSession->subject->name,
                'Status' => $attendance->status,
                'Waktu' => optional($attendance->scanned_at)->format('H:i') ?? '-',
            ];
        });

        return view('report.export-excel', ['data' => $data]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet()->getDelegate()->getStyle('A1:F1')->getFont()->setBold(true);
            },
        ];
    }
}