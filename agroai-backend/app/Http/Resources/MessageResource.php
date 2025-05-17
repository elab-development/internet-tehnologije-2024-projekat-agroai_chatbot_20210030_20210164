<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the Message (and its Response) into an API-friendly array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'content'    => $this->content,
            'created_at' => $this->created_at->toDateTimeString(),

            // Embed the AI response, if loaded
            'response'   => $this->whenLoaded('response', 
                new ResponseResource($this->response)
            ),
        ];
    }
}
