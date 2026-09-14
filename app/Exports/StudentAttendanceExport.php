<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class StudentAttendanceExport implements FromView, WithEvents
{
    private array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function view(): View
    {
        $query = \App\Models\Attendance::with(['student.user', 'attendanceSession.classRoom', 'attendanceSession.subject'])
            ->where('student_id', auth()->user()->student->id);

        if (isset($this->filters['bulan']) && $this->filters['bulan']) {
            $query->whereHas('attendanceSession', function ($q) {
                $q->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$this->filters['bulan']]);
            });
        }

        if (isset($this->filters['status']) && $this->filters['status']) {
            $query->where('status', $this->filters['status']);
        }

        if (isset($this->filters['subject_id']) && $this->filters['subject_id']) {
            $query->whereHas('attendanceSession', function ($q) {
                $q->where('subject_id', $this->filters['subject_id']);
            });
        }

        $data = $query->latest('scanned_at')->get()->map(function ($attendance) {
            return [
                'Tanggal' => $attendance->attendanceSession->date->format('Y-m-d'),
                'Mata Pelajaran' => $attendance->attendanceSession->subject->name,
                'Kelas' => $attendance->attendanceSession->classRoom->name,
                'Status' => $attendance->status,
                'Waktu' => optional($attendance->scanned_at)->format('H:i') ?? '-',
            ];
        });

        return view('student.history-export', ['data' => $data]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet()->getDelegate()->getStyle('A1:E1')->getFont()->setBold(true);
            },
        ];
    }
}