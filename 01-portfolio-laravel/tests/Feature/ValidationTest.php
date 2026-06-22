<?php

namespace Tests\Feature;

use App\Models\Publication;
use App\Models\Proprietaire;
use App\Models\Utilisateur;
use App\Models\EmploiDuTemps;
use App\Models\Evenement;
use App\Models\Domaine;
use App\Models\Conversion;
use App\Models\Rappel;
use App\Models\Ressource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidationTest extends TestCase
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

    // ─── Publication Validation ───

    public function test_422_publication_sans_titre()
    {
        $this->auth()->postJson('/api/publications', [
            'contenu' => 'Contenu valide',
            'type' => 'article',
        ])->assertStatus(422);
    }

    public function test_422_publication_type_invalide()
    {
        $this->auth()->postJson('/api/publications', [
            'titre' => 'Mon super article',
            'contenu' => 'Contenu valide',
            'type' => 'type-inexistant',
        ])->assertStatus(422);
    }

    public function test_422_publication_domaine_inexistant()
    {
        $this->auth()->postJson('/api/publications', [
            'titre' => 'Mon super article',
            'contenu' => 'Contenu valide',
            'type' => 'article',
            'domaines' => [99999],
        ])->assertStatus(422);
    }

    // ─── Auth Validation ───

    public function test_422_register_email_invalide()
    {
        $this->postJson('/api/register', [
            'nom' => 'Test',
            'email' => 'pas-un-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422);
    }

    public function test_422_register_password_trop_court()
    {
        $this->postJson('/api/register', [
            'nom' => 'Test',
            'email' => 'test@test.com',
            'password' => 'abc',
            'password_confirmation' => 'abc',
        ])->assertStatus(422);
    }

    public function test_422_register_password_confirmation_differe()
    {
        $this->postJson('/api/register', [
            'nom' => 'Test',
            'email' => 'test@test.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ])->assertStatus(422);
    }

    public function test_422_login_mauvaises_identifiants()
    {
        $this->postJson('/api/login', [
            'email' => 'inexistant@test.com',
            'password' => 'wrongpassword',
        ])->assertStatus(422);
    }

    // ─── Competence Validation ───

    public function test_422_competence_sans_nom()
    {
        $this->auth()->postJson('/api/competences', ['categorie' => 'Framework'])
            ->assertStatus(422);
    }

    // ─── Domaine Validation ───

    public function test_422_domaine_sans_nom()
    {
        $this->auth()->postJson('/api/domaines', ['couleur' => '#ff0000'])
            ->assertStatus(422);
    }

    // ─── Contact Validation ───

    public function test_422_contact_email_invalide()
    {
        $this->postJson('/api/contact', [
            'nom' => 'Jean',
            'email' => 'pas-un-email',
            'message' => 'Bonjour',
        ])->assertStatus(422);
    }

    // ─── Commentaire Validation ───

    public function test_422_commentaire_type_invalide()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/commentaires', [
            'commentable_type' => 'type-inexistant',
            'commentable_id' => $publication->id,
            'contenu' => 'Excellent article !',
        ])->assertStatus(422);
    }

    // ─── EDT Validation ───

    public function test_422_edt_sans_titre()
    {
        $this->auth()->postJson('/api/edt', ['type' => 'professionnel'])
            ->assertStatus(422);
    }

    public function test_422_edt_type_invalide()
    {
        $this->auth()->postJson('/api/edt', [
            'titre' => 'Test',
            'type' => 'type-inexistant',
        ])->assertStatus(422);
    }

    // ─── Evenement Validation ───

    public function test_422_evenement_sans_titre()
    {
        $edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->postJson('/api/evenements', [
            'emploi_du_temps_id' => $edt->id,
            'date_debut' => '2025-01-01',
        ])->assertStatus(422);
    }

    public function test_422_evenement_date_fin_avant_date_debut()
    {
        $edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->postJson('/api/evenements', [
            'emploi_du_temps_id' => $edt->id,
            'titre' => 'Test',
            'date_debut' => '2025-06-01 10:00:00',
            'date_fin' => '2025-06-01 08:00:00',
        ])->assertStatus(422);
    }

    // ─── Conversion Validation ───

    public function test_422_conversion_sans_titre()
    {
        $this->auth()->postJson('/api/conversions', ['evenement_id' => 1])
            ->assertStatus(422);
    }

    public function test_422_conversion_evenement_inexistant()
    {
        $this->auth()->postJson('/api/conversions', [
            'titre' => 'Test',
            'evenement_id' => 99999,
        ])->assertStatus(422);
    }

    // ─── Rappel Validation ───

    public function test_422_rappel_sans_titre()
    {
        $this->auth()->postJson('/api/rappels', [])
            ->assertStatus(422);
    }

    // ─── Ressource Validation ───

    public function test_422_ressource_sans_titre()
    {
        $this->auth()->postJson('/api/ressources', [])
            ->assertStatus(422);
    }

    // ─── Like Validation ───

    public function test_422_like_sans_parametres()
    {
        $utilisateur = Utilisateur::factory()->create();
        $token = $utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/likes/toggle', [])
            ->assertStatus(422);
    }
}
