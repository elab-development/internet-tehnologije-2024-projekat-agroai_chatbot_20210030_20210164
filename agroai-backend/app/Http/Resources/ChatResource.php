<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChatResource extends JsonResource
{
    /**
     * Transform the Chat model into an API-friendly array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),

            // pairs of user message + AI response
            'pairs' => $this->pairs->map(function ($pair) {
                $msg = $pair['message'];
                $res = $pair['response'];

                return [
                    'message'  => [
                        'id'         => $msg->id,
                        'content'    => $msg->content,
                        'created_at' => $msg->created_at->toDateTimeString(),
                    ],
                    'response' => $res ? [
                        'id'         => $res->id,
                        'content'    => $res->content,
                        'created_at' => $res->created_at->toDateTimeString(),
                    ] : null,
                ];
            }),
        ];
    }
}
