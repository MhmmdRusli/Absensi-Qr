<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TemplateExport implements FromArray, WithHeadings, ShouldAutoSize
{
    public function __construct(
        protected array $headings,
        protected array $sampleRow = []
    ) {
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function array(): array
    {
        return $this->sampleRow === [] ? [] : [$this->sampleRow];
    }
}
