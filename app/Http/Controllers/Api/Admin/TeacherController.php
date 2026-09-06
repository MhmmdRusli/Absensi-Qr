<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = Teacher::with('user')
            ->get()
            ->map(fn ($teacher) => $this->formatTeacher($teacher));

        return response()->json(['data' => $teachers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'nip' => ['required', 'string', Rule::unique('teachers', 'nip')],
        ]);

        $teacher = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['nip']),
                'role' => 'teacher',
            ]);

            return Teacher::create([
                'user_id' => $user->id,
                'nip' => $validated['nip'],
            ]);
        });

        $teacher->load('user');

        return response()->json([
            'message' => 'Guru berhasil ditambahkan. Password default adalah NIP guru.',
            'data' => $this->formatTeacher($teacher),
        ], 201);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($teacher->user_id)],
            'nip' => ['required', 'string', Rule::unique('teachers', 'nip')->ignore($teacher->id)],
        ]);

        DB::transaction(function () use ($validated, $teacher) {
            $teacher->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $teacher->update([
                'nip' => $validated['nip'],
            ]);
        });

        $teacher->load('user');

        return response()->json([
            'message' => 'Data guru berhasil diperbarui.',
            'data' => $this->formatTeacher($teacher),
        ]);
    }

    public function destroy(Teacher $teacher)
    {
        $teacher->user->delete();

        return response()->json([
            'message' => 'Guru berhasil dihapus.',
        ]);
    }

    private function formatTeacher(Teacher $teacher): array
    {
        return [
            'id' => $teacher->id,
            'name' => $teacher->user->name,
            'email' => $teacher->user->email,
            'nip' => $teacher->nip,
        ];
    }
}