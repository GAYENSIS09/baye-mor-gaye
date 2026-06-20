<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RappelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'message' => $this->message,
            'est_notifie' => $this->est_notifie,
            'notifie_le' => $this->notifie_le?->toIso8601String(),
            'evenement' => EvenementResource::make($this->whenLoaded('evenement')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
