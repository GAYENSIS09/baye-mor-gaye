<?php

namespace Tests\Feature;

use App\Models\Like;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LikeApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

    public function test_un_utilisateur_peut_liker_une_publication()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/likes/toggle', [
            'likeable_type' => 'publication',
            'likeable_id' => $publication->id,
        ]);

        $response->assertStatus(200)
            ->assertJson(['liked' => true]);
    }

    public function test_un_utilisateur_peut_unlike_une_publication()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/likes/toggle', [
            'likeable_type' => 'publication',
            'likeable_id' => $publication->id,
        ]);

        $response = $this->withToken($token)->postJson('/api/likes/toggle', [
            'likeable_type' => 'publication',
            'likeable_id' => $publication->id,
        ]);

        $response->assertStatus(200)
            ->assertJson(['liked' => false]);
    }

    public function test_un_utilisateur_peut_liker_un_projet()
    {
        $utilisateur = Utilisateur::factory()->create();
        $projet = ProjetPortfolio::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/likes/toggle', [
            'likeable_type' => 'projet_portfolio',
            'likeable_id' => $projet->id,
        ])->assertStatus(200)
          ->assertJson(['liked' => true]);
    }

    public function test_retourne_le_nombre_de_likes()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/likes/toggle', [
            'likeable_type' => 'publication',
            'likeable_id' => $publication->id,
        ]);

        $response->assertJson(['count' => 1]);
    }

    public function test_401_sans_token_sur_like()
    {
        $publication = Publication::factory()->create();
        $this->postJson('/api/likes/toggle', [
            'likeable_type' => 'publication',
            'likeable_id' => $publication->id,
        ])->assertStatus(401);
    }
}
