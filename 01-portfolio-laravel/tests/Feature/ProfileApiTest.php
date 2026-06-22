<?php

namespace Tests\Feature;

use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_utilisateur_peut_mettre_a_jour_son_profil()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/profile', [
            'bio' => 'Nouvelle biographie',
            'titre_professionnel' => 'Senior Developer',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Nouvelle biographie', $response['data']['proprietaire']['bio']);
    }
}
