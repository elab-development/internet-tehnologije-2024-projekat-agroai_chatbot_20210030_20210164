<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Response extends Model
{
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
