<?php

namespace App\Services;

use App\Services\Contracts\VisionServiceInterface;

class PaliGemmaStub implements VisionServiceInterface
{
    public function analyserEdt(string $cheminFichier): array
    {
        return [
            'model'      => 'stub-v1',
            'confiance'  => 0.95,
            'evenements' => [
                [
                    'titre' => 'Cours ML',
                    'jour'  => 1,
                    'debut' => '08:00',
                    'fin'   => '10:00',
                ],
                [
                    'titre' => 'TD Python',
                    'jour'  => 1,
                    'debut' => '10:30',
                    'fin'   => '12:00',
                ],
                [
                    'titre' => 'Projet Web',
                    'jour'  => 2,
                    'debut' => '14:00',
                    'fin'   => '17:00',
                ],
            ],
        ];
    }
}
