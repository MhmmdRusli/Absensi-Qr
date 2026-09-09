<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user()->teacher;

        $schedules = Schedule::where('teacher_id', $teacher->id)
            ->with(['classRoom', 'subject'])
            ->orderByRaw("FIELD(day_of_week, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')")
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time->format('H:i'),
                    'end_time' => $schedule->end_time->format('H:i'),
                    'room' => $schedule->room,
                    'class' => $schedule->classRoom->name,
                    'subject' => $schedule->subject->name,
                ];
            });

        return response()->json(['data' => $schedules]);
    }

    public function store(Request $request)
    {
        $teacher = $request->user()->teacher;

        $validated = $request->validate([
            'class_id' => ['required', 'exists:classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'day_of_week' => ['required', 'string', 'max:20'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room' => ['nullable', 'string', 'max:100'],
        ]);

        $schedule = Schedule::create([
            'teacher_id' => $teacher->id,
            ...$validated,
        ]);

        $schedule->load(['classRoom', 'subject']);

        return response()->json([
            'message' => 'Jadwal pelajaran berhasil ditambahkan.',
            'data' => [
                'id' => $schedule->id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time->format('H:i'),
                'end_time' => $schedule->end_time->format('H:i'),
                'room' => $schedule->room,
                'class' => $schedule->classRoom->name,
                'subject' => $schedule->subject->name,
            ],
        ], 201);
    }

    public function destroy(Request $request, Schedule $schedule)
    {
        $this->authorizeOwnership($request, $schedule);

        $schedule->delete();

        return response()->json(['message' => 'Jadwal pelajaran berhasil dihapus.']);
    }

    private function authorizeOwnership(Request $request, Schedule $schedule): void
    {
        abort_unless(
            $schedule->teacher_id === $request->user()->teacher->id,
            403,
            'Anda tidak memiliki akses ke jadwal ini.'
        );
    }
}
