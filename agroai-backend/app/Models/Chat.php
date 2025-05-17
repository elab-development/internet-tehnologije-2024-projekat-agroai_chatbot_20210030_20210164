<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',    
    ];

    /**
     * Vlasnik konverzacije
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Sve korisničke poruke u ovoj konverzaciji
     */
    public function messages()
    {
        return $this->hasMany(Message::class)
                    ->orderBy('created_at', 'asc');
    }

    /**
     * Parovi poruka i odgovora:
     * vraća kolekciju gde je svaki element ['message' => Message, 'response' => Response]
     */
    public function getPairsAttribute()
    {
        return $this->messages->map(function (Message $msg) {
            return [
                'message'  => $msg,
                'response' => $msg->response,
            ];
        });
    }
}
