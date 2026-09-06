<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['user', 'classRoom'])
            ->get()
            ->map(fn ($student) => $this->formatStudent($student));

        return response()->json(['data' => $students]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'nis' => ['required', 'string', Rule::unique('students', 'nis')],
            'class_id' => ['required', 'exists:classes,id'],
        ]);

        $student = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['nis']),
                'role' => 'student',
            ]);

            return Student::create([
                'user_id' => $user->id,
                'nis' => $validated['nis'],
                'class_id' => $validated['class_id'],
            ]);
        });

        $student->load(['user', 'classRoom']);

        return response()->json([
            'message' => 'Siswa berhasil ditambahkan. Password default adalah NIS siswa.',
            'data' => $this->formatStudent($student),
        ], 201);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($student->user_id)],
            'nis' => ['required', 'string', Rule::unique('students', 'nis')->ignore($student->id)],
            'class_id' => ['required', 'exists:classes,id'],
        ]);

        DB::transaction(function () use ($validated, $student) {
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $student->update([
                'nis' => $validated['nis'],
                'class_id' => $validated['class_id'],
            ]);
        });

        $student->load(['user', 'classRoom']);

        return response()->json([
            'message' => 'Data siswa berhasil diperbarui.',
            'data' => $this->formatStudent($student),
        ]);
    }

    public function destroy(Student $student)
    {
        $student->user->delete();

        return response()->json([
            'message' => 'Siswa berhasil dihapus.',
        ]);
    }

    public function classesList()
    {
        return response()->json([
            'data' => ClassRoom::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    private function formatStudent(Student $student): array
    {
        return [
            'id' => $student->id,
            'name' => $student->user->name,
            'email' => $student->user->email,
            'nis' => $student->nis,
            'class_id' => $student->class_id,
            'class_name' => $student->classRoom->name,
        ];
    }
}