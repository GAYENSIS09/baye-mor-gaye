<?php

namespace Tests\Feature;

use App\Models\Commentaire;
use App\Models\Publication;
use App\Models\ProjetPortfolio;
use App\Models\Proprietaire;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentaireApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

    public function test_un_utilisateur_authentifie_peut_commenter_une_publication()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/commentaires', [
            'commentable_type' => 'publications',
            'commentable_id' => $publication->id,
            'contenu' => 'Excellent article !',
        ]);

        $response->assertStatus(201);
    }

    public function test_un_utilisateur_authentifie_peut_commenter_un_projet()
    {
        $utilisateur = Utilisateur::factory()->create();
        $projet = ProjetPortfolio::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/commentaires', [
            'commentable_type' => 'projets',
            'commentable_id' => $projet->id,
            'contenu' => 'Tres beau projet !',
        ]);

        $response->assertStatus(201);
    }

    public function test_visiteur_peut_lire_commentaires_publication_par_slug()
    {
        $publication = Publication::factory()->create();
        Commentaire::factory()->count(2)->create([
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
            'est_approuve' => true,
        ]);

        $this->getJson("/api/publications/{$publication->slug}/commentaires")
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_visiteur_peut_lire_commentaires_projet_par_slug()
    {
        $projet = ProjetPortfolio::factory()->create();
        Commentaire::factory()->count(2)->create([
            'commentable_type' => ProjetPortfolio::class,
            'commentable_id' => $projet->id,
            'est_approuve' => true,
        ]);

        $this->getJson("/api/projets/{$projet->slug}/commentaires")
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_proprietaire_peut_approuver_commentaire()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;
        $publication = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);
        $commentaire = Commentaire::factory()->create([
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
            'est_approuve' => false,
        ]);

        $this->withToken($token)->putJson("/api/commentaires/{$commentaire->id}/approuver")
            ->assertStatus(200);

        $this->assertTrue($commentaire->fresh()->est_approuve);
    }

    public function test_proprietaire_peut_rejeter_commentaire()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;
        $publication = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);
        $commentaire = Commentaire::factory()->create([
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
            'est_approuve' => false,
        ]);

        $this->withToken($token)->putJson("/api/commentaires/{$commentaire->id}/rejeter")
            ->assertStatus(200);

        $this->assertSoftDeleted($commentaire);
    }

    public function test_proprietaire_peut_voir_commentaires_en_attente()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;
        $publication = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);
        Commentaire::factory()->create([
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
            'est_approuve' => false,
        ]);

        $this->withToken($token)->getJson('/api/commentaires/en-attente')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_modifier_commentaire()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;
        $publication = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);
        $commentaire = Commentaire::factory()->create([
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
        ]);

        $this->withToken($token)->putJson("/api/commentaires/{$commentaire->id}", [
            'contenu' => 'Contenu modifie',
        ])->assertStatus(200);
    }

    public function test_supprimer_commentaire()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;
        $publication = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);
        $commentaire = Commentaire::factory()->create([
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
        ]);

        $this->withToken($token)->deleteJson("/api/commentaires/{$commentaire->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted($commentaire);
    }

    public function test_401_sans_token_sur_commentaire()
    {
        $this->postJson('/api/commentaires', ['contenu' => 'x', 'commentable_type' => 'publications', 'commentable_id' => 1])
            ->assertStatus(401);
    }
}
