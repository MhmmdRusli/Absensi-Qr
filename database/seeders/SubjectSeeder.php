<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            'PPLG',
            'Matematika',
            'Bahasa Indonesia',
            'Bahasa Inggris',
        ];

        foreach ($subjects as $subjectName) {
            Subject::create(['name' => $subjectName]);
        }
    }
}