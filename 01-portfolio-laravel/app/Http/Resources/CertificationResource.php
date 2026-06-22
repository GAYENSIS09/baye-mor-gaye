<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'organisme' => $this->organisme,
            'description' => $this->description,
            'url_credential' => $this->url_credential,
            'date_obtention' => $this->date_obtention?->toIso8601String(),
            'date_expiration' => $this->date_expiration?->toIso8601String(),
            'medias' => MediaResource::collection($this->whenLoaded('medias')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
