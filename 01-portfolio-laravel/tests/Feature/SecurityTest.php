<?php

namespace Tests\Feature;

use App\Models\Publication;
use App\Models\Proprietaire;
use App\Models\NiveauCompetence;
use App\Models\Competence;
use App\Models\Evenement;
use App\Models\EmploiDuTemps;
use App\Models\Conversion;
use App\Models\Notification;
use App\Models\Rappel;
use App\Models\Ressource;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    // ─── 401: unauthenticated access ───

    public function test_401_sans_token_sur_me()
    {
        $this->getJson('/api/me')->assertStatus(401);
    }

    public function test_401_sans_token_sur_logout()
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    public function test_401_sans_token_sur_creation_publication()
    {
        $this->postJson('/api/publications', ['titre' => 'x', 'contenu' => 'x', 'type' => 'article'])
            ->assertStatus(401);
    }

    public function test_401_sans_token_sur_modification_publication()
    {
        $pub = Publication::factory()->create();
        $this->putJson("/api/publications/{$pub->id}", ['titre' => 'x'])
            ->assertStatus(401);
    }

    public function test_401_sans_token_sur_suppression_publication()
    {
        $pub = Publication::factory()->create();
        $this->deleteJson("/api/publications/{$pub->id}")
            ->assertStatus(401);
    }

    // ─── 403: forbidden — wrong Proprietaire ───

    public function test_403_utilisateur_sans_proprietaire_ne_peut_pas_creer_publication()
    {
        $user = Utilisateur::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/publications', [
            'titre' => 'Test', 'contenu' => 'Contenu valide assez long pour passer', 'type' => 'article',
        ])->assertStatus(403);
    }

    public function test_403_ne_peut_pas_modifier_publication_appartenant_a_autrui()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $pub = Publication::factory()->create(['proprietaire_id' => $owner->id]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson("/api/publications/{$pub->id}", ['titre' => 'Hack'])
            ->assertStatus(403);
    }

    public function test_403_ne_peut_pas_supprimer_publication_appartenant_a_autrui()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $pub = Publication::factory()->create(['proprietaire_id' => $owner->id]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->deleteJson("/api/publications/{$pub->id}")
            ->assertStatus(403);
    }

    public function test_403_ne_peut_pas_modifier_competence_sans_niveau()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $competence = Competence::factory()->create();
        NiveauCompetence::create([
            'proprietaire_id' => $owner->id,
            'competence_id' => $competence->id,
            'niveau' => 'expert',
        ]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson("/api/competences/{$competence->id}", ['nom' => 'Hack'])
            ->assertStatus(403);
    }

    // ─── 404: not found ───

    public function test_404_sur_slug_publication_inexistant()
    {
        $this->getJson('/api/publications/slug-inexistant')->assertStatus(404);
    }

    public function test_404_sur_id_competence_inexistant()
    {
        $this->getJson('/api/competences/99999')->assertStatus(404);
    }

    public function test_404_sur_id_domaine_inexistant()
    {
        $this->getJson('/api/domaines/99999')->assertStatus(404);
    }

    public function test_404_sur_id_experience_inexistant()
    {
        $this->getJson('/api/experiences/99999')->assertStatus(404);
    }

    public function test_404_sur_id_formation_inexistant()
    {
        $this->getJson('/api/formations/99999')->assertStatus(404);
    }

    public function test_404_sur_id_certification_inexistant()
    {
        $this->getJson('/api/certifications/99999')->assertStatus(404);
    }

    public function test_404_sur_id_ressource_inexistant()
    {
        $this->getJson('/api/ressources/99999')->assertStatus(404);
    }

    public function test_404_sur_route_api_inexistante()
    {
        $this->getJson('/api/route-qui-nexiste-pas')->assertStatus(404);
    }

    // ─── 401 for Conversion ───

    public function test_401_sans_token_sur_conversion()
    {
        $this->postJson('/api/conversions', ['titre' => 'x', 'evenement_id' => 1])->assertStatus(401);
        $this->putJson('/api/conversions/1')->assertStatus(401);
        $this->deleteJson('/api/conversions/1')->assertStatus(401);
    }

    // ─── 401/403 for EDT ───

    public function test_401_sans_token_sur_edt()
    {
        $this->postJson('/api/edt', ['titre' => 'x', 'type' => 'professionnel'])->assertStatus(401);
        $this->putJson('/api/edt/1')->assertStatus(401);
        $this->deleteJson('/api/edt/1')->assertStatus(401);
    }

    public function test_403_ne_peut_pas_modifier_edt_autrui()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $edt = EmploiDuTemps::factory()->create(['proprietaire_id' => $owner->id]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson("/api/edt/{$edt->id}", ['titre' => 'Hack'])
            ->assertStatus(403);
    }

    // ─── 401/403 for Evenement ───

    public function test_401_sans_token_sur_evenement()
    {
        $this->postJson('/api/evenements', ['titre' => 'x', 'date_debut' => '2025-01-01'])->assertStatus(401);
    }

    // ─── 401/403 for Notification ───

    public function test_401_sans_token_sur_notification()
    {
        $this->patchJson('/api/notifications/1/read')->assertStatus(401);
        $this->deleteJson('/api/notifications/1')->assertStatus(401);
    }

    public function test_403_ne_peut_pas_lire_notification_autrui()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $notif = Notification::factory()->create(['proprietaire_id' => $owner->id]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->patchJson("/api/notifications/{$notif->id}/read")->assertStatus(403);
    }

    // ─── 401/403 for Rappel ───

    public function test_401_sans_token_sur_rappel()
    {
        $this->postJson('/api/rappels', ['titre' => 'x'])->assertStatus(401);
    }

    public function test_403_ne_peut_pas_modifier_rappel_autrui()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $rappel = Rappel::factory()->create(['proprietaire_id' => $owner->id]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson("/api/rappels/{$rappel->id}", ['titre' => 'Hack'])
            ->assertStatus(403);
    }

    // ─── 401/403 for Ressource ───

    public function test_401_sans_token_sur_ressource()
    {
        $this->postJson('/api/ressources', ['titre' => 'x'])->assertStatus(401);
    }

    public function test_403_ne_peut_pas_modifier_ressource_autrui()
    {
        $owner = Proprietaire::factory()->create();
        $intruder = Proprietaire::factory()->create();
        $ressource = Ressource::factory()->create(['proprietaire_id' => $owner->id]);

        $token = $intruder->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson("/api/ressources/{$ressource->id}", ['titre' => 'Hack'])
            ->assertStatus(403);
    }

    // ─── 404 for new entities ───

    public function test_404_sur_modification_conversion_inexistante()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson('/api/conversions/99999', ['titre' => 'x'])
            ->assertStatus(404);
    }

    public function test_404_sur_modification_rappel_inexistant()
    {
        $proprietaire = Proprietaire::factory()->create();
        $token = $proprietaire->utilisateur->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson('/api/rappels/99999', ['titre' => 'x'])
            ->assertStatus(404);
    }
}
