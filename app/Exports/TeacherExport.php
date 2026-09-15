<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TeacherExport implements FromArray, WithHeadings, ShouldAutoSize
{
    public function __construct(
        protected array $rows = []
    ) {
    }

    public function headings(): array
    {
        return ['NIP', 'Nama', 'Email', 'Jabatan', 'Mata Pelajaran', 'Status'];
    }

    public function array(): array
    {
        return $this->rows;
    }
}
