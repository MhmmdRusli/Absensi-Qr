<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun Admin
        User::create([
            'name' => 'Admin Sekolah',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Akun Guru
        $guruUser = User::create([
            'name' => 'Budi Santoso',
            'email' => 'guru@example.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        Teacher::create([
            'user_id' => $guruUser->id,
            'nip' => '198501012010011001',
        ]);

        // Guru tambahan (contoh data lebih dari 1)
        $guruUser2 = User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti.guru@example.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        Teacher::create([
            'user_id' => $guruUser2->id,
            'nip' => '198703152011012002',
        ]);

        // Akun Siswa utama
        $kelasXIPPLG3 = ClassRoom::where('name', 'XI PPLG 3')->first();

        $siswaUser = User::create([
            'name' => 'Muhammad Rusli',
            'email' => 'siswa@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        Student::create([
            'user_id' => $siswaUser->id,
            'nis' => '2024001',
            'class_id' => $kelasXIPPLG3->id,
        ]);

        // Siswa tambahan (contoh data lebih dari 1, di kelas yang sama)
        $namaSiswaLain = [
            ['name' => 'Andi Wijaya', 'nis' => '2024002'],
            ['name' => 'Citra Lestari', 'nis' => '2024003'],
        ];

        foreach ($namaSiswaLain as $index => $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => 'siswa' . ($index + 2) . '@example.com',
                'password' => Hash::make('password'),
                'role' => 'student',
            ]);

            Student::create([
                'user_id' => $user->id,
                'nis' => $data['nis'],
                'class_id' => $kelasXIPPLG3->id,
            ]);
        }
    }
}