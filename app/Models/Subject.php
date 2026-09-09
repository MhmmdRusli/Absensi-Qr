<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tingkat',
        'guru_pengampu',
        'status',
    ];

    public function attendanceSessions()
    {
        return $this->hasMany(AttendanceSession::class);
    }
}