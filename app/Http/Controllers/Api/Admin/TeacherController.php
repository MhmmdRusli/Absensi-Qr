<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TeacherExport;
use App\Exports\TemplateExport;
use App\Imports\TeacherImport;
use Throwable;

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
            'position' => ['required', 'in:kepala_sekolah,wakil_kepala,kepala_tata_usaha,kepala_kk,koordinator_khusus,guru,laboran,staff'],
            'teaching_subject' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
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
                'position' => $validated['position'],
                'teaching_subject' => $validated['teaching_subject'] ?? null,
                'status' => $validated['status'] ?? 'aktif',
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
            'position' => ['required', 'in:kepala_sekolah,wakil_kepala,kepala_tata_usaha,kepala_kk,koordinator_khusus,guru,laboran,staff'],
            'teaching_subject' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        DB::transaction(function () use ($validated, $teacher) {
            $teacher->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $teacher->update([
                'nip' => $validated['nip'],
                'position' => $validated['position'],
                'teaching_subject' => $validated['teaching_subject'] ?? null,
                'status' => $validated['status'] ?? $teacher->status,
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

    public function export()
    {
        $teachers = Teacher::with('user')
            ->get()
            ->map(fn ($t) => [
                'nip' => $t->nip,
                'nama' => $t->user->name,
                'email' => $t->user->email,
                'jabatan' => $this->positionLabel($t->position),
                'mata_pelajaran' => $t->teaching_subject ?? '-',
                'status' => $t->status ?? 'aktif',
            ])
            ->toArray();

        $filename = 'data-guru-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new TeacherExport($teachers), $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv|max:5120']);

        try {
            $import = new TeacherImport();
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
            'message' => "Berhasil mengimpor {$import->imported} data guru.",
            'imported' => $import->imported,
        ]);
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplateExport(
            ['NIP', 'Nama', 'Email', 'Jabatan', 'Mata Pelajaran', 'Status'],
            ['1234567890', 'Contoh Nama Guru', 'guru@example.com', 'guru', 'Bahasa Inggris', 'aktif']
        ), 'template-import-guru.xlsx');
    }

    private function positionLabel($position)
    {
        $labels = [
            'kepala_sekolah' => 'Kepala Sekolah',
            'wakil_kepala' => 'Wakil Kepala Sekolah',
            'kepala_tata_usaha' => 'Kepala Tata Usaha',
            'kepala_kk' => 'Kepala Kompetensi Keahlian',
            'koordinator_khusus' => 'Koordinator Khusus',
            'guru' => 'Guru Mata Pelajaran/Produktif',
            'laboran' => 'Laboran',
            'staff' => 'Staf Pendukung',
        ];

        return $labels[$position] ?? $position ?? '-';
    }

    private function formatTeacher(Teacher $teacher): array
    {
        return [
            'id' => $teacher->id,
            'name' => $teacher->user->name,
            'email' => $teacher->user->email,
            'nip' => $teacher->nip,
            'position' => $teacher->position,
            'position_label' => $this->positionLabel($teacher->position),
            'teaching_subject' => $teacher->teaching_subject,
            'status' => $teacher->status ?? 'aktif',
        ];
    }
}
