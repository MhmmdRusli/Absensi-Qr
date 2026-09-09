<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Subject::orderBy('name')->get(['id', 'name', 'tingkat', 'guru_pengampu']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')],
            'tingkat' => ['nullable', 'string', 'max:255'],
            'guru_pengampu' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        $subject = Subject::create($validated);

        return response()->json([
            'message' => 'Mata pelajaran berhasil ditambahkan.',
            'data' => $subject,
        ], 201);
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects', 'name')->ignore($subject->id)],
            'tingkat' => ['nullable', 'string', 'max:255'],
            'guru_pengampu' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        $subject->update($validated);

        return response()->json([
            'message' => 'Mata pelajaran berhasil diperbarui.',
            'data' => $subject,
        ]);
    }

    public function destroy(Subject $subject)
    {
        if ($subject->attendanceSessions()->exists()) {
            return response()->json([
                'message' => 'Mata pelajaran tidak bisa dihapus karena sudah dipakai di sesi absensi.',
            ], 422);
        }

        $subject->delete();

        return response()->json([
            'message' => 'Mata pelajaran berhasil dihapus.',
        ]);
    }

    public function subjectsList()
    {
        return response()->json([
            'data' => Subject::select('id', 'name', 'tingkat', 'guru_pengampu', 'status')->orderBy('name')->get(),
        ]);
    }
}