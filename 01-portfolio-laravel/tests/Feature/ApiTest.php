<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use App\Models\Proprietaire;
use App\Models\Competence;
use App\Models\Domaine;
use App\Models\Publication;
use App\Models\Commentaire;
use App\Models\Contact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

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
            ->assertJson(['id' => $utilisateur->id, 'nom' => $utilisateur->nom]);
    }

    public function test_un_utilisateur_peut_se_deconnecter()
    {
        $utilisateur = Utilisateur::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertStatus(200);
    }
}

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
            ->assertJson(['id' => $publication->id]);
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
            ->assertJson(['titre' => 'Mon article de test']);
    }
}

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_visiteur_peut_envoyer_un_message_de_contact()
    {
        $response = $this->postJson('/api/contact', [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'sujet' => 'Demande de collaboration',
            'message' => 'Bonjour, je souhaite collaborer avec vous.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('contacts', 1);
    }

    public function test_le_message_de_contact_est_valide()
    {
        $response = $this->postJson('/api/contact', [
            'nom' => '',
            'email' => 'pas-un-email',
            'message' => '',
        ]);

        $response->assertStatus(422);
    }
}

class LikeApiTest extends TestCase
{
    use RefreshDatabase;

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
}

class CommentaireApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_utilisateur_authentifie_peut_commenter()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/commentaires', [
            'commentable_type' => 'publication',
            'commentable_id' => $publication->id,
            'contenu' => 'Excellent article !',
        ]);

        $response->assertStatus(201);
    }
}

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
        $this->assertEquals('Nouvelle biographie', $response['proprietaire']['bio']);
    }
}
