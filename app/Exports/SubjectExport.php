<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SubjectExport implements FromArray, WithHeadings, ShouldAutoSize
{
    public function __construct(
        protected array $rows = []
    ) {
    }

    public function headings(): array
    {
        return ['Nama Mata Pelajaran', 'Tingkat', 'Guru Pengampu', 'Status'];
    }

    public function array(): array
    {
        return $this->rows;
    }
}
