<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('tingkat')->nullable()->after('name');
            $table->string('jurusan')->nullable()->after('tingkat');
            $table->string('wali_kelas')->nullable()->after('jurusan');
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn(['wali_kelas', 'jurusan', 'tingkat']);
        });
    }
};
