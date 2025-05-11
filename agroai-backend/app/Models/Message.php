<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'chat_id',
        'content',
    ];

    /**
     * The chat this message belongs to.
     */
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * The AI response associated with this user message.
     */
    public function response()
    {
        return $this->hasOne(Response::class);
    }
}

