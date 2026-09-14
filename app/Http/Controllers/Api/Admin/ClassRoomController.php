<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClassRoomController extends Controller
{
    public function index()
    {
        $classes = ClassRoom::withCount('students')
            ->orderBy('name')
            ->get()
            ->map(fn ($classRoom) => [
                'id' => $classRoom->id,
                'name' => $classRoom->name,
                'tingkat' => $classRoom->tingkat,
                'jurusan' => $classRoom->jurusan,
                'wali_kelas' => $classRoom->wali_kelas,
                'status' => $classRoom->status,
                'total_siswa' => $classRoom->students_count,
            ]);

        return response()->json(['data' => $classes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('classes', 'name')],
            'tingkat' => ['nullable', 'string', 'max:255'],
            'jurusan' => ['nullable', 'string', 'max:255'],
            'wali_kelas' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        $classRoom = ClassRoom::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan.',
            'data' => [
                'id' => $classRoom->id,
                'name' => $classRoom->name,
                'tingkat' => $classRoom->tingkat,
                'jurusan' => $classRoom->jurusan,
                'wali_kelas' => $classRoom->wali_kelas,
                'status' => $classRoom->status,
                'total_siswa' => 0,
            ],
        ], 201);
    }

    public function update(Request $request, ClassRoom $classRoom)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('classes', 'name')->ignore($classRoom->id)],
            'tingkat' => ['nullable', 'string', 'max:255'],
            'jurusan' => ['nullable', 'string', 'max:255'],
            'wali_kelas' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ]);

        $classRoom->update($validated);

        return response()->json([
            'message' => 'Kelas berhasil diperbarui.',
            'data' => [
                'id' => $classRoom->id,
                'name' => $classRoom->name,
                'tingkat' => $classRoom->tingkat,
                'jurusan' => $classRoom->jurusan,
                'wali_kelas' => $classRoom->wali_kelas,
                'status' => $classRoom->status,
                'total_siswa' => $classRoom->students()->count(),
            ],
        ]);
    }

    public function destroy(ClassRoom $classRoom)
    {
        if ($classRoom->students()->exists()) {
            return response()->json([
                'message' => 'Kelas tidak bisa dihapus karena masih memiliki siswa.',
            ], 422);
        }

        $classRoom->delete();

        return response()->json([
            'message' => 'Kelas berhasil dihapus.',
        ]);
    }

    public function classesList()
    {
        return response()->json([
            'data' => ClassRoom::select('id', 'name', 'tingkat', 'jurusan', 'wali_kelas', 'status')->orderBy('name')->get(),
        ]);
    }

    public function export()
    {
        $classes = ClassRoom::withCount('students')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'nama_kelas' => $c->name,
                'tingkat' => $c->tingkat,
                'jurusan' => $c->jurusan,
                'wali_kelas' => $c->wali_kelas,
                'status' => $c->status,
                'total_siswa' => $c->students_count,
            ]);

        $filename = 'data-kelas-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($classes) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Nama Kelas', 'Tingkat', 'Jurusan', 'Wali Kelas', 'Status', 'Total Siswa']);

            foreach ($classes as $c) {
                fputcsv($handle, [
                    $c['nama_kelas'],
                    $c['tingkat'],
                    $c['jurusan'],
                    $c['wali_kelas'],
                    $c['status'],
                    $c['total_siswa'],
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}