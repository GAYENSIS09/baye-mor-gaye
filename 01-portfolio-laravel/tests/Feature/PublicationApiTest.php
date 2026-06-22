<?php

namespace Tests\Feature;

use App\Models\Publication;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_tout_le_monde_peut_consulter_les_publications()
    {
        Publication::factory()->count(3)->create();

        $response = $this->getJson('/api/publications');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_un_visiteur_peut_consulter_une_publication_par_slug()
    {
        $publication = Publication::factory()->create();

        $response = $this->getJson("/api/publications/{$publication->slug}");

        $response->assertStatus(200)
            ->assertJson(['data' => ['id' => $publication->id]]);
    }

    public function test_un_utilisateur_authentifie_peut_creer_une_publication()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/publications', [
            'titre' => 'Mon article de test',
            'contenu' => 'Contenu de test avec assez de caracteres',
            'type' => 'article',
        ]);

        $response->assertStatus(201)
            ->assertJson(['data' => ['titre' => 'Mon article de test']]);
    }
}
