<?php

namespace Tests\Feature;

use App\Models\Rappel;
use App\Models\Proprietaire;
use App\Models\Evenement;
use App\Models\EmploiDuTemps;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RappelApiTest extends TestCase
{
    use RefreshDatabase;

    private Proprietaire $proprietaire;
    private string $token;
    private Evenement $evenement;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
        $this->proprietaire = Proprietaire::factory()->create();
        $this->token = $this->proprietaire->utilisateur->createToken('test')->plainTextToken;
        $edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $this->proprietaire->id]);
        $this->evenement = Evenement::factory()->create(['emploi_du_temps_id' => $edt->id]);
    }

    private function auth(): self
    {
        return $this->withToken($this->token);
    }

    public function test_creer_rappel()
    {
        $this->auth()->postJson('/api/rappels', [
            'titre' => 'Rappel reunion',
            'message' => 'Ne pas oublier la reunion',
            'evenement_id' => $this->evenement->id,
        ])->assertStatus(201)
          ->assertJson(['data' => ['titre' => 'Rappel reunion']]);
    }

    public function test_lister_rappels()
    {
        Rappel::factory()->count(2)->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->getJson('/api/rappels')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_modifier_rappel()
    {
        $rappel = Rappel::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/rappels/{$rappel->id}", [
            'titre' => 'Rappel modifie',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'Rappel modifie']]);
    }

    public function test_supprimer_rappel()
    {
        $rappel = Rappel::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/rappels/{$rappel->id}")
            ->assertStatus(204);

        $this->assertModelMissing($rappel);
    }

    public function test_401_sans_token_sur_rappels()
    {
        $this->postJson('/api/rappels', ['titre' => 'x'])->assertStatus(401);
        $this->putJson('/api/rappels/1')->assertStatus(401);
        $this->deleteJson('/api/rappels/1')->assertStatus(401);
    }

    public function test_403_ne_peut_pas_modifier_rappel_autrui()
    {
        $other = Proprietaire::factory()->create();
        $rappel = Rappel::factory()->create(['proprietaire_id' => $other->id]);

        $this->auth()->putJson("/api/rappels/{$rappel->id}", ['titre' => 'Hack'])->assertStatus(403);
    }
}
