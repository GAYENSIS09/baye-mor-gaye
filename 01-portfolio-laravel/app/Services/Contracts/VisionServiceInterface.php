<?php

namespace App\Services\Contracts;

interface VisionServiceInterface
{
    public function analyserEdt(string $cheminFichier): array;
}
