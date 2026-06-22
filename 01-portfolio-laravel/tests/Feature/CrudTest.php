<?php

namespace Tests\Feature;

use App\Models\Publication;
use App\Models\Proprietaire;
use App\Models\Competence;
use App\Models\NiveauCompetence;
use App\Models\Domaine;
use App\Models\Experience;
use App\Models\Formation;
use App\Models\Certification;
use App\Models\ProjetPortfolio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrudTest extends TestCase
{
    use RefreshDatabase;

    private Proprietaire $proprietaire;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->proprietaire = Proprietaire::factory()->create();
        $this->token = $this->proprietaire->utilisateur->createToken('test')->plainTextToken;
    }

    private function auth(): self
    {
        return $this->withToken($this->token);
    }

    // ─── PUBLICATION CRUD ───

    public function test_creer_publication()
    {
        $this->auth()->postJson('/api/publications', [
            'titre' => 'Nouvel article',
            'contenu' => 'Contenu de test assez long pour passer la validation',
            'type' => 'article',
        ])->assertStatus(201)
          ->assertJson(['data' => ['titre' => 'Nouvel article']]);
    }

    public function test_lister_publications()
    {
        Publication::factory()->count(3)->create();

        $response = $this->getJson('/api/publications');
        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
        $this->assertCount(3, $response['data']);
    }

    public function test_voir_publication_par_slug()
    {
        $pub = Publication::factory()->create();

        $this->getJson("/api/publications/{$pub->slug}")
            ->assertStatus(200)
            ->assertJson(['data' => ['id' => $pub->id]]);
    }

    public function test_modifier_publication()
    {
        $pub = Publication::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/publications/{$pub->id}", [
            'titre' => 'Titre modifie',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'Titre modifie']]);
    }

    public function test_supprimer_publication()
    {
        $pub = Publication::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/publications/{$pub->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('publications', ['id' => $pub->id]);
    }

    // ─── COMPETENCE CRUD ───

    public function test_creer_competence()
    {
        $this->auth()->postJson('/api/competences', [
            'nom' => 'Laravel',
            'categorie' => 'Framework',
        ])->assertStatus(201)
          ->assertJson(['nom' => 'Laravel']);
    }

    public function test_lister_competences()
    {
        Competence::factory()->count(2)->create();

        $this->getJson('/api/competences')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_voir_competence()
    {
        $comp = Competence::factory()->create();

        $this->getJson("/api/competences/{$comp->id}")
            ->assertStatus(200)
            ->assertJson(['data' => ['id' => $comp->id]]);
    }

    public function test_modifier_competence()
    {
        $competence = Competence::factory()->create();
        NiveauCompetence::create([
            'proprietaire_id' => $this->proprietaire->id,
            'competence_id' => $competence->id,
            'niveau' => 'expert',
        ]);

        $this->auth()->putJson("/api/competences/{$competence->id}", [
            'nom' => 'PHP 8.3',
        ])->assertStatus(200)
          ->assertJson(['data' => ['nom' => 'PHP 8.3']]);
    }

    public function test_supprimer_competence()
    {
        $competence = Competence::factory()->create();
        NiveauCompetence::create([
            'proprietaire_id' => $this->proprietaire->id,
            'competence_id' => $competence->id,
            'niveau' => 'expert',
        ]);

        $this->auth()->deleteJson("/api/competences/{$competence->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('competences', ['id' => $competence->id]);
    }

    // ─── DOMAINE CRUD ───

    public function test_creer_domaine()
    {
        $this->auth()->postJson('/api/domaines', [
            'nom' => 'Web Development',
        ])->assertStatus(201)
          ->assertJson(['data' => ['nom' => 'Web Development']]);
    }

    public function test_lister_domaines()
    {
        Domaine::factory()->count(2)->create();

        $this->getJson('/api/domaines')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_modifier_domaine()
    {
        $domaine = Domaine::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/domaines/{$domaine->id}", [
            'nom' => 'Mobile Dev',
        ])->assertStatus(200)
          ->assertJson(['data' => ['nom' => 'Mobile Dev']]);
    }

    public function test_supprimer_domaine()
    {
        $domaine = Domaine::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/domaines/{$domaine->id}")
            ->assertStatus(200)
            ->assertJson(['message' => 'Domaine supprimé, publications dissociées']);
    }

    // ─── EXPERIENCE CRUD ───

    public function test_creer_experience()
    {
        $this->auth()->postJson('/api/experiences', [
            'titre' => 'Developpeur Fullstack',
            'entreprise' => 'Acme Corp',
            'description' => 'Developpement d applications web',
            'date_debut' => '2024-01-01',
            'date_fin' => '2025-01-01',
            'type' => 'emploi',
        ])->assertStatus(201);
    }

    public function test_lister_experiences()
    {
        Experience::factory()->count(2)->create();

        $this->getJson('/api/experiences')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_modifier_experience()
    {
        $exp = Experience::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/experiences/{$exp->id}", [
            'titre' => 'Lead Developer',
        ])->assertStatus(200);
    }

    public function test_supprimer_experience()
    {
        $exp = Experience::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/experiences/{$exp->id}")
            ->assertStatus(204);
    }

    public function test_modifier_formation()
    {
        $formation = Formation::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/formations/{$formation->id}", [
            'diplome' => 'Doctorat en IA',
        ])->assertStatus(200)
          ->assertJson(['data' => ['diplome' => 'Doctorat en IA']]);
    }

    // ─── FORMATION CRUD ───

    public function test_creer_formation()
    {
        $this->auth()->postJson('/api/formations', [
            'diplome' => 'Master en Informatique',
            'etablissement' => 'Universite de Dakar',
            'description' => 'Formation approfondie en developpement logiciel',
            'date_debut' => '2022-01-01',
            'date_fin' => '2024-01-01',
            'domaine_etude' => 'Informatique',
        ])->assertStatus(201);
    }

    public function test_lister_formations()
    {
        Formation::factory()->count(2)->create();

        $this->getJson('/api/formations')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_supprimer_formation()
    {
        $formation = Formation::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/formations/{$formation->id}")
            ->assertStatus(204);
    }

    public function test_modifier_certification()
    {
        $cert = Certification::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/certifications/{$cert->id}", [
            'titre' => 'AWS Certified Solutions Architect',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'AWS Certified Solutions Architect']]);
    }

    // ─── CERTIFICATION CRUD ───

    public function test_creer_certification()
    {
        $this->auth()->postJson('/api/certifications', [
            'titre' => 'AWS Certified Developer',
            'organisme' => 'Amazon Web Services',
            'date_obtention' => '2024-06-15',
        ])->assertStatus(201);
    }

    public function test_lister_certifications()
    {
        Certification::factory()->count(2)->create();

        $this->getJson('/api/certifications')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_supprimer_certification()
    {
        $cert = Certification::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/certifications/{$cert->id}")
            ->assertStatus(204);
    }

    // ─── PROJET CRUD ───

    public function test_creer_projet()
    {
        $this->auth()->postJson('/api/projets', [
            'titre' => 'Portfolio QA',
            'description' => 'Projet de test',
            'technologies' => ['Laravel', 'Next.js'],
            'date_realisation' => '2025-01-01',
        ])->assertStatus(201);
    }

    public function test_lister_projets()
    {
        ProjetPortfolio::factory()->count(2)->create();

        $this->getJson('/api/projets')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_modifier_projet()
    {
        $projet = ProjetPortfolio::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->putJson("/api/projets/{$projet->id}", [
            'titre' => 'Projet modifie',
        ])->assertStatus(200)
          ->assertJson(['data' => ['titre' => 'Projet modifie']]);
    }

    public function test_supprimer_projet()
    {
        $projet = ProjetPortfolio::factory()->create(['proprietaire_id' => $this->proprietaire->id]);

        $this->auth()->deleteJson("/api/projets/{$projet->id}")
            ->assertStatus(204);
    }
}
