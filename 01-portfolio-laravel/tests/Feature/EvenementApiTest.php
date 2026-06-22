<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\EmploiDuTemps;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvenementApiTest extends TestCase
{
    use RefreshDatabase;

    private Proprietaire $proprietaire;
    private string $token;
    private EmploiDuTemps $edt;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
        $this->proprietaire = Proprietaire::factory()->create();
        $this->token = $this->proprietaire->utilisateur->createToken('test')->plainTextToken;
        $this->edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $this->proprietaire->id]);
    }

    private function auth(): self
    {
        return $this->withToken($this->token);
    }

    public function test_tout_le_monde_peut_lister_evenements()
    {
        Evenement::factory()->count(3)->create();

        $this->getJson('/api/evenements')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_tout_le_monde_peut_voir_evenement()
    {
        $evenement = Evenement::factory()->create();

        $this->getJson("/api/evenements/{$evenement->id}")
            ->assertStatus(200)
            ->assertJson(['data' => ['id' => $evenement->id]]);
    }

    public function test_creer_evenement()
    {
        $this->auth()->postJson('/api/evenements', [
            'emploi_du_temps_id' => $this->edt->id,
            'titre' => 'Evenement test',
            'date_debut' => '2025-06-01 10:00:00',
            'date_fin' => '2025-06-01 12:00:00',
            'lieu' => 'Dakar',
            'statut' => 'planifie',
        ])->assertStatus(201)
          ->assertJson(['data' => ['titre' => 'Evenement test']]);
    }

    public function test_modifier_evenement()
    {
        $evenement = Evenement::factory()->create(['emploi_du_temps_id' => $this->edt->id]);

        $this->auth()->putJson("/api/evenements/{$evenement->id}", [
            'titre' => 'Evenement modifie',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'Evenement modifie']]);
    }

    public function test_supprimer_evenement()
    {
        $evenement = Evenement::factory()->create(['emploi_du_temps_id' => $this->edt->id]);

        $this->auth()->deleteJson("/api/evenements/{$evenement->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted($evenement);
    }

    public function test_401_sans_token_sur_creation_evenement()
    {
        $this->postJson('/api/evenements', ['titre' => 'x', 'date_debut' => '2025-01-01'])->assertStatus(401);
    }

    public function test_401_sans_token_sur_modification_evenement()
    {
        $e = Evenement::factory()->create();
        $this->putJson("/api/evenements/{$e->id}")->assertStatus(401);
    }

    public function test_401_sans_token_sur_suppression_evenement()
    {
        $e = Evenement::factory()->create();
        $this->deleteJson("/api/evenements/{$e->id}")->assertStatus(401);
    }
}
