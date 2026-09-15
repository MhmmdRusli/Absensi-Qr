<?php

namespace App\Imports;

use App\Models\Teacher;
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

class TeacherImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;
    use RemembersRowNumber;

    public int $imported = 0;

    public function rules(): array
    {
        return [
            'nip'              => 'required|string|max:255|unique:teachers,nip',
            'nama'             => 'required|string|max:255',
            'email'            => 'required|email|max:255|unique:users,email',
            'jabatan'          => 'required|in:kepala_sekolah,wakil_kepala,kepala_tata_usaha,kepala_kk,koordinator_khusus,guru,laboran,staff',
            'mata_pelajaran'   => 'nullable|string|max:255',
            'status'           => 'nullable|in:aktif,nonaktif',
        ];
    }

    public function model(array $row): ?Model
    {
        try {
            DB::transaction(function () use ($row) {
                $user = User::create([
                    'name'     => $row['nama'],
                    'email'    => $row['email'],
                    'password' => Hash::make($row['nip']),
                    'role'     => 'teacher',
                ]);

                Teacher::create([
                    'user_id'          => $user->id,
                    'nip'              => $row['nip'],
                    'position'         => $row['jabatan'],
                    'teaching_subject' => $row['mata_pelajaran'],
                    'status'           => $row['status'] ?? 'aktif',
                ]);
            });

            $this->imported++;
        } catch (Throwable $e) {
            $this->onFailure(new Failure($this->rowNumber ?? 0, 'row', [$e->getMessage()]));
        }

        return null;
    }
}
