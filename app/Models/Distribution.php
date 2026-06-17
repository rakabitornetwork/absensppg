<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Distribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'menu_data',
        'points_data',
        'total_target',
        'total_delivered',
        'status',
    ];

    protected $casts = [
        'menu_data' => 'array',
        'points_data' => 'array',
    ];
}
