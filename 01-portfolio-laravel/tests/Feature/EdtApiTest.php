<?php

namespace Tests\Feature;

use App\Models\EmploiDuTemps;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EdtApiTest extends TestCase
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

    public function test_creer_edt()
    {
        $this->auth()->postJson('/api/edt', [
            'titre' => 'Emploi du temps test',
            'type' => 'professionnel',
            'description' => 'Description test',
        ])->assertStatus(201)
          ->assertJson(['data' => ['titre' => 'Emploi du temps test']]);
    }

    public function test_lister_edt()
    {
        EmploiDuTemps::factory()->count(2)->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->getJson('/api/edt')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_modifier_edt()
    {
        $edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/edt/{$edt->id}", [
            'titre' => 'EDT modifie',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'EDT modifie']]);
    }

    public function test_supprimer_edt()
    {
        $edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/edt/{$edt->id}")
            ->assertStatus(204);

        $this->assertModelMissing($edt);
    }

    public function test_401_sans_token_sur_edt()
    {
        $this->postJson('/api/edt', ['titre' => 'x', 'type' => 'professionnel'])->assertStatus(401);
        $this->putJson('/api/edt/1')->assertStatus(401);
        $this->deleteJson('/api/edt/1')->assertStatus(401);
    }
}
