<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LikeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'auteur_id' => $this->auteur_id,
            'likeable_id' => $this->likeable_id,
            'likeable_type' => $this->likeable_type,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
