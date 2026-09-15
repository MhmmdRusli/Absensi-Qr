<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SubjectExport;
use App\Exports\TemplateExport;
use App\Imports\SubjectImport;
use Throwable;

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

    public function export()
    {
        $rows = Subject::orderBy('name')->get(['name', 'tingkat', 'guru_pengampu', 'status'])
            ->map(fn ($s) => [
                'nama_mata_pelajaran' => $s->name,
                'tingkat'             => $s->tingkat,
                'guru_pengampu'       => $s->guru_pengampu,
                'status'              => $s->status,
            ])
            ->toArray();

        $filename = 'data-mata-pelajaran-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new SubjectExport($rows), $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv|max:5120']);

        try {
            $import = new SubjectImport();
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
            'message' => "Berhasil mengimpor {$import->imported} data mata pelajaran.",
            'imported' => $import->imported,
        ]);
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplateExport(
            ['Nama Mata Pelajaran', 'Tingkat', 'Guru Pengampu', 'Status'],
            ['Fisika', 'XII', 'Pak Ahmad', 'aktif']
        ), 'template-import-mata-pelajaran.xlsx');
    }
}