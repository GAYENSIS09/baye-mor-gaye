<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VuePageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'page' => $this->page,
            'page_id' => $this->page_id,
            'visite_le' => $this->visite_le?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
