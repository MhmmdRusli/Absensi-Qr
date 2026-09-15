<?php

namespace App\Imports;

use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class StudentImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;
    use RemembersRowNumber;

    public int $imported = 0;

    public function rules(): array
    {
        return [
            'nis'             => 'required|string|max:255|unique:students,nis',
            'nama'            => 'required|string|max:255',
            'email'           => 'required|email|max:255|unique:users,email',
            'jenis_kelamin'   => 'required|in:laki-laki,perempuan',
            'kelas'           => 'required|string|exists:classes,name',
            'status'          => 'nullable|in:aktif,nonaktif',
        ];
    }

    public function model(array $row): ?Model
    {
        try {
            DB::transaction(function () use ($row) {
                $classId = ClassRoom::where('name', trim($row['kelas']))->value('id');

                $user = User::create([
                    'name'      => $row['nama'],
                    'email'     => $row['email'],
                    'gender'    => $row['jenis_kelamin'],
                    'password'  => Hash::make($row['nis']),
                    'role'      => 'student',
                ]);

                Student::create([
                    'user_id'  => $user->id,
                    'nis'      => $row['nis'],
                    'class_id' => $classId,
                    'status'   => $row['status'] ?? 'aktif',
                ]);
            });

            $this->imported++;
        } catch (Throwable $e) {
            $this->onFailure(new Failure($this->rowNumber ?? 0, 'row', [$e->getMessage()]));
        }

        return null;
    }
}
