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
                'total_siswa' => $classRoom->students_count,
            ]);

        return response()->json(['data' => $classes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('classes', 'name')],
        ]);

        $classRoom = ClassRoom::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan.',
            'data' => ['id' => $classRoom->id, 'name' => $classRoom->name, 'total_siswa' => 0],
        ], 201);
    }

    public function update(Request $request, ClassRoom $classRoom)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('classes', 'name')->ignore($classRoom->id)],
        ]);

        $classRoom->update($validated);

        return response()->json([
            'message' => 'Kelas berhasil diperbarui.',
            'data' => [
                'id' => $classRoom->id,
                'name' => $classRoom->name,
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
            'data' => ClassRoom::select('id', 'name')->orderBy('name')->get(),
        ]);
    }
}