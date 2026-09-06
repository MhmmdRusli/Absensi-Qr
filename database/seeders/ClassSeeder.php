<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            'X PPLG 1',
            'XI PPLG 3',
            'XII PPLG 2',
        ];

        foreach ($classes as $className) {
            ClassRoom::create(['name' => $className]);
        }
    }
}