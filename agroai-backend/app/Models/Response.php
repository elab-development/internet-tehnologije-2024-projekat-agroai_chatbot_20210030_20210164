<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Response extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'content',
    ];

    /**
     * The user message this AI response belongs to.
     */
    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
