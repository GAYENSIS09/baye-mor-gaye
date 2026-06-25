<?php

namespace App\Services;

use App\Services\Contracts\VisionServiceInterface;
use Illuminate\Support\Facades\Http;

class OllamaVisionService implements VisionServiceInterface
{
    public function analyserEdt(string $cheminFichier): array
    {
        $mime = mime_content_type($cheminFichier);

        if ($mime === 'application/pdf') {
            $data = $this->pdfToImageBase64($cheminFichier);
        } else {
            $data = base64_encode(file_get_contents($cheminFichier));
        }

        $response = Http::timeout(120)
            ->post(config('services.ollama.url') . '/api/chat', [
                'model' => config('services.ollama.model', 'llava'),
                'stream' => false,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => 'You are analyzing a university timetable/schedule image. Extract ALL events from EVERY cell in the table. Return ONLY valid JSON (no markdown, no code blocks) with an array of events. Each event must have: titre (string, course name in French), jour (integer 1-7 where 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday), debut (HH:MM format), fin (HH:MM format). Extract every single time slot - do not skip any row or column.',
                        'images' => [$data],
                    ],
                ],
                'options' => [
                    'temperature' => 0.1,
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Ollama request failed: ' . $response->body());
        }

        $result = $response->json();
        $texte = $result['message']['content'] ?? '';

        $decoded = $this->parserReponse($texte);

        return [
            'model'      => config('services.ollama.model', 'llava'),
            'confiance'  => 0.8,
            'evenements' => $decoded,
        ];
    }

    private function pdfToImageBase64(string $chemin): string
    {
        $dir = dirname($chemin);
        $basename = pathinfo($chemin, PATHINFO_FILENAME);
        $output = $dir . '/' . $basename . '_page_%d.png';

        exec("pdftoppm -png -r 200 \"{$chemin}\" \"{$dir}/{$basename}_page\" 2>&1", $outputLines, $exitCode);

        if ($exitCode !== 0) {
            throw new \RuntimeException('Failed to convert PDF to images: ' . implode("\n", $outputLines));
        }

        $images = glob($dir . '/' . $basename . '_page-*.png');
        if (empty($images)) {
            throw new \RuntimeException('No images generated from PDF');
        }

        $combined = '';
        foreach ($images as $img) {
            $combined .= file_get_contents($img);
            unlink($img);
        }

        return base64_encode($combined);
    }

    private function parserReponse(string $texte): array
    {
        $texte = trim($texte);
        $texte = preg_replace('/^```(?:json)?\s*|\s*```$/', '', $texte);

        $decoded = json_decode($texte, true);

        if (!is_array($decoded)) {
            return [];
        }

        return $decoded;
    }
}
