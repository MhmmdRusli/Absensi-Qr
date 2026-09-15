<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StudentExport;
use App\Exports\TemplateExport;
use App\Imports\StudentImport;
use Throwable;

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
            'gender' => ['required', 'in:laki-laki,perempuan'],
            'nis' => ['required', 'string', Rule::unique('students', 'nis')],
            'class_id' => ['required', 'exists:classes,id'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        $student = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'gender' => $validated['gender'],
                'password' => Hash::make($validated['nis']),
                'role' => 'student',
            ]);

            return Student::create([
                'user_id' => $user->id,
                'nis' => $validated['nis'],
                'class_id' => $validated['class_id'],
                'status' => $validated['status'] ?? 'aktif',
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
            'gender' => ['required', 'in:laki-laki,perempuan'],
            'nis' => ['required', 'string', Rule::unique('students', 'nis')->ignore($student->id)],
            'class_id' => ['required', 'exists:classes,id'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        DB::transaction(function () use ($validated, $student) {
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'gender' => $validated['gender'],
            ]);

            $student->update([
                'nis' => $validated['nis'],
                'class_id' => $validated['class_id'],
                'status' => $validated['status'] ?? 'aktif',
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

    public function export()
    {
        $students = Student::with(['user', 'classRoom'])
            ->get()
            ->map(fn ($s) => [
                'nis' => $s->nis,
                'nama' => $s->user->name,
                'email' => $s->user->email,
                'jenis_kelamin' => $s->user->gender ?? '-',
                'kelas' => $s->classRoom->name,
                'status' => $s->status ?? 'aktif',
            ]);

        $filename = 'data-siswa-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new StudentExport($students->toArray()), $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv|max:5120']);

        try {
            $import = new StudentImport();
            Excel::import($import, $request->file('file')->getRealPath());
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal membaca file: ' . $e->getMessage()], 422);
        }

        if ($import->failures()->isNotEmpty()) {
            return response()->json([
                'message' => 'Import selesai dengan beberapa kesalahan.',
                'imported' => $import->imported,
                'errors' => $import->failures()->map(fn ($f) => [
                    'row' => $f->row(),
                    'attribute' => $f->attribute(),
                    'errors' => $f->errors(),
                ])->values()->toArray(),
            ], 422);
        }

        return response()->json([
            'message' => "Berhasil mengimpor {$import->imported} data siswa.",
            'imported' => $import->imported,
        ]);
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplateExport(
            ['NIS', 'Nama', 'Email', 'Jenis Kelamin', 'Kelas', 'Status'],
            ['12345', 'Contoh Nama Siswa', 'siswa@example.com', 'laki-laki', 'XII PPLG 1', 'aktif']
        ), 'template-import-siswa.xlsx');
    }

    private function formatStudent(Student $student): array
    {
        return [
            'id' => $student->id,
            'name' => $student->user->name,
            'email' => $student->user->email,
            'gender' => $student->user->gender,
            'nis' => $student->nis,
            'class_id' => $student->class_id,
            'class_name' => $student->classRoom->name,
            'status' => $student->status,
        ];
    }
}