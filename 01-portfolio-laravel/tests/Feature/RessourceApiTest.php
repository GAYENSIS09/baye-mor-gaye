<?php

namespace Tests\Feature;

use App\Models\Ressource;
use App\Models\Proprietaire;
use App\Models\Domaine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RessourceApiTest extends TestCase
{
    use RefreshDatabase;

    private Proprietaire $proprietaire;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
        $this->proprietaire = Proprietaire::factory()->create();
        $this->token = $this->proprietaire->utilisateur->createToken('test')->plainTextToken;
    }

    private function auth(): self
    {
        return $this->withToken($this->token);
    }

    public function test_tout_le_monde_peut_lister_ressources()
    {
        Ressource::factory()->count(3)->create();

        $this->getJson('/api/ressources')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_tout_le_monde_peut_voir_ressource()
    {
        $ressource = Ressource::factory()->create();

        $this->getJson("/api/ressources/{$ressource->id}")
            ->assertStatus(200)
            ->assertJson(['data' => ['id' => $ressource->id]]);
    }

    public function test_creer_ressource()
    {
        $domaine = Domaine::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->postJson('/api/ressources', [
            'titre' => 'Guide Laravel',
            'description' => 'Description du guide',
            'domaine_id' => $domaine->id,
            'est_publique' => true,
        ])->assertStatus(201)
          ->assertJson(['data' => ['titre' => 'Guide Laravel']]);
    }

    public function test_modifier_ressource()
    {
        $ressource = Ressource::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/ressources/{$ressource->id}", [
            'titre' => 'Ressource modifiee',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'Ressource modifiee']]);
    }

    public function test_supprimer_ressource()
    {
        $ressource = Ressource::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/ressources/{$ressource->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted($ressource);
    }

    public function test_401_sans_token_sur_gestion_ressource()
    {
        $this->postJson('/api/ressources', ['titre' => 'x'])->assertStatus(401);
        $this->putJson('/api/ressources/1')->assertStatus(401);
        $this->deleteJson('/api/ressources/1')->assertStatus(401);
    }

    public function test_403_ne_peut_pas_modifier_ressource_autrui()
    {
        $other = Proprietaire::factory()->create();
        $ressource = Ressource::factory()->create(['proprietaire_id' => $other->id]);

        $this->auth()->putJson("/api/ressources/{$ressource->id}", ['titre' => 'Hack'])->assertStatus(403);
        $this->auth()->deleteJson("/api/ressources/{$ressource->id}")->assertStatus(403);
    }
}
