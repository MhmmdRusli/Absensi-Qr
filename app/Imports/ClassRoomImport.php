<?php

namespace App\Imports;

use App\Models\ClassRoom;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class ClassRoomImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;
    use RemembersRowNumber;

    public int $imported = 0;

    public function rules(): array
    {
        return [
            'nama_kelas'  => 'required|string|max:255|unique:classes,name',
            'tingkat'    => 'nullable|string|max:255',
            'jurusan'    => 'nullable|string|max:255',
            'wali_kelas' => 'nullable|string|max:255',
            'status'     => 'nullable|string|max:255',
        ];
    }

    public function model(array $row): ?Model
    {
        try {
            ClassRoom::create([
                'name'      => $row['nama_kelas'],
                'tingkat'   => $row['tingkat'],
                'jurusan'   => $row['jurusan'],
                'wali_kelas' => $row['wali_kelas'],
                'status'    => $row['status'] ?? 'aktif',
            ]);

            $this->imported++;
        } catch (Throwable $e) {
            $this->onFailure(new Failure($this->rowNumber ?? 0, 'row', [$e->getMessage()]));
        }

        return null;
    }
}
