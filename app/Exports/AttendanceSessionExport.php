<?php

namespace App\Exports;

use App\Models\AttendanceSession;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class AttendanceSessionExport implements FromView, WithEvents
{
    private AttendanceSession $session;

    public function __construct(AttendanceSession $session)
    {
        $this->session = $session;
    }

    public function view(): View
    {
        $this->session->load(['classRoom', 'subject']);
        $students = $this->session->classRoom->students()->with('user')->get();
        $attendances = $this->session->attendances()->get()->keyBy('student_id');

        $data = $students->map(function ($student) use ($attendances) {
            $attendance = $attendances->get($student->id);
            return [
                'No' => $students->search($student) + 1,
                'Nama' => $student->user->name,
                'Status' => $attendance?->status ?? 'belum',
                'Waktu Scan' => optional($attendance?->scanned_at)->format('H:i') ?? '-',
            ];
        });

        return view('teacher.session-export', [
            'data' => $data,
            'session' => $this->session,
            'total_siswa' => $students->count(),
            'total_hadir' => $attendances->where('status', 'hadir')->count(),
        ]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet()->getDelegate()->getStyle('A1:D1')->getFont()->setBold(true);
            },
        ];
    }
}