<?php

namespace Tests\Feature;

use App\Models\Conversion;
use App\Models\Evenement;
use App\Models\EmploiDuTemps;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversionApiTest extends TestCase
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

    public function test_creer_conversion()
    {
        $this->auth()->postJson('/api/conversions', [
            'evenement_id' => $this->evenement->id,
            'titre' => 'Conversion test',
            'url_externe' => 'https://example.com',
            'type' => 'document',
        ])->assertStatus(201)
          ->assertJson(['data' => ['titre' => 'Conversion test']]);
    }

    public function test_lister_conversions()
    {
        Conversion::factory()->count(2)->create();

        $this->auth()->getJson('/api/conversions')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_modifier_conversion()
    {
        $conversion = Conversion::factory()->create(['evenement_id' => $this->evenement->id]);

        $this->auth()->putJson("/api/conversions/{$conversion->id}", [
            'titre' => 'Titre modifie',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'Titre modifie']]);
    }

    public function test_supprimer_conversion()
    {
        $conversion = Conversion::factory()->create(['evenement_id' => $this->evenement->id]);

        $this->auth()->deleteJson("/api/conversions/{$conversion->id}")
            ->assertStatus(204);

        $this->assertModelMissing($conversion);
    }

    public function test_401_sans_token_sur_conversions()
    {
        $this->postJson('/api/conversions', ['titre' => 'x', 'evenement_id' => 1])->assertStatus(401);
        $this->putJson('/api/conversions/1')->assertStatus(401);
        $this->deleteJson('/api/conversions/1')->assertStatus(401);
    }
}
