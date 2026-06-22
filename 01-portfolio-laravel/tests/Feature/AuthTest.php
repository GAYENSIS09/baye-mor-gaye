<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

    public function test_un_visiteur_peut_sinscrire()
    {
        $response = $this->postJson('/api/register', [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['utilisateur' => ['id', 'nom', 'email'], 'token']);
    }

    public function test_un_utilisateur_peut_se_connecter()
    {
        $utilisateur = Utilisateur::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['utilisateur', 'token']);
    }

    public function test_un_utilisateur_peut_consulter_son_profil()
    {
        $utilisateur = Utilisateur::factory()->proprietaire()->create();
        Proprietaire::factory()->create(['utilisateur_id' => $utilisateur->id]);

        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson(['data' => ['id' => $utilisateur->id, 'nom' => $utilisateur->nom]]);
    }

    public function test_un_utilisateur_peut_se_deconnecter()
    {
        $utilisateur = Utilisateur::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertStatus(200);
    }
}
