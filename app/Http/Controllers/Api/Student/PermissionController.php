<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;

        $permissions = Permission::where('student_id', $student->id)
            ->latest()
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'tanggal' => $p->date->format('Y-m-d'),
                'jenis' => $p->type,
                'alasan' => $p->reason ?? '-',
                'status' => $p->status,
                'dibuat' => $p->created_at->format('d F Y H:i'),
            ]);

        return response()->json(['data' => $permissions]);
    }

    public function store(Request $request)
    {
        $student = $request->user()->student;

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'type' => ['required', 'in:izin,sakit'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $permission = Permission::create([
            'student_id' => $student->id,
            'date' => $validated['date'],
            'type' => $validated['type'],
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Permintaan izin berhasil diajukan. Menunggu persetujuan.',
            'data' => [
                'id' => $permission->id,
                'tanggal' => $permission->date->format('Y-m-d'),
                'jenis' => $permission->type,
                'alasan' => $permission->reason ?? '-',
                'status' => $permission->status,
            ],
        ], 201);
    }
}