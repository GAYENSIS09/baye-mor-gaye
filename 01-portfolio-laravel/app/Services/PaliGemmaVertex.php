<?php

namespace App\Services;

use App\Services\Contracts\VisionServiceInterface;
use Illuminate\Support\Facades\Http;

class PaliGemmaVertex implements VisionServiceInterface
{
    public function analyserEdt(string $cheminFichier): array
    {
        $imageData = base64_encode(file_get_contents($cheminFichier));

        $response = Http::withToken(config('services.vertex.api_key'))
            ->post(config('services.vertex.endpoint') . '/predict', [
                'instances' => [
                    [
                        'image' => ['bytesBase64Encoded' => $imageData],
                        'prompt' => 'Extract the schedule from this timetable image. Return JSON with events: each has titre, jour (1-7), debut (HH:MM), fin (HH:MM).',
                    ],
                ],
                'parameters' => [
                    'confidenceThreshold' => 0.5,
                    'maxOutputTokens'     => 1024,
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Vertex AI request failed: ' . $response->body());
        }

        $result = $response->json();
        $evenements = $this->parserReponse($result);

        return [
            'model'      => 'paligemma-2-10b',
            'confiance'  => $result['predictions'][0]['confidence'] ?? 0.0,
            'evenements' => $evenements,
        ];
    }

    private function parserReponse(array $result): array
    {
        $texte = $result['predictions'][0]['text'] ?? '[]';

        $texte = trim($texte);
        $texte = preg_replace('/^```(?:json)?\s*|\s*```$/', '', $texte);

        $decoded = json_decode($texte, true);

        if (!is_array($decoded)) {
            return [];
        }

        return $decoded;
    }
}
