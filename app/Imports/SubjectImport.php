<?php

namespace App\Imports;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class SubjectImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;
    use RemembersRowNumber;

    public int $imported = 0;

    public function rules(): array
    {
        return [
            'nama_mata_pelajaran' => 'required|string|max:255|unique:subjects,name',
            'tingkat'             => 'nullable|string|max:255',
            'guru_pengampu'       => 'nullable|string|max:255',
            'status'              => 'nullable|string|max:255',
        ];
    }

    public function model(array $row): ?Model
    {
        try {
            Subject::create([
                'name'          => $row['nama_mata_pelajaran'],
                'tingkat'       => $row['tingkat'],
                'guru_pengampu' => $row['guru_pengampu'],
                'status'        => $row['status'] ?? 'aktif',
            ]);

            $this->imported++;
        } catch (Throwable $e) {
            $this->onFailure(new Failure($this->rowNumber ?? 0, 'row', [$e->getMessage()]));
        }

        return null;
    }
}
