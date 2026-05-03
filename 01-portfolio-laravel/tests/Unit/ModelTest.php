<?php

namespace Tests\Unit;

use App\Models\Utilisateur;
use App\Models\Proprietaire;
use App\Models\Competence;
use App\Models\NiveauCompetence;
use App\Models\Domaine;
use App\Models\Publication;
use App\Models\Commentaire;
use App\Models\Like;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UtilisateurTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_utilisateur_peut_avoir_un_proprietaire()
    {
        $utilisateur = Utilisateur::factory()->proprietaire()->create();
        Proprietaire::factory()->create(['utilisateur_id' => $utilisateur->id]);

        $this->assertNotNull($utilisateur->proprietaire);
        $this->assertInstanceOf(Proprietaire::class, $utilisateur->proprietaire);
    }

    public function test_un_utilisateur_peut_avoir_plusieurs_commentaires()
    {
        $utilisateur = Utilisateur::factory()->create();
        $publication = Publication::factory()->create();

        Commentaire::create([
            'auteur_id' => $utilisateur->id,
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
            'contenu' => 'Super article !',
        ]);

        $this->assertCount(1, $utilisateur->commentaires);
    }

    public function test_un_utilisateur_peut_liker_plusieurs_publications()
    {
        $utilisateur = Utilisateur::factory()->create();
        $pub1 = Publication::factory()->create();
        $pub2 = Publication::factory()->create();

        Like::create(['auteur_id' => $utilisateur->id, 'likeable_type' => Publication::class, 'likeable_id' => $pub1->id]);
        Like::create(['auteur_id' => $utilisateur->id, 'likeable_type' => Publication::class, 'likeable_id' => $pub2->id]);

        $this->assertCount(2, $utilisateur->likes);
    }
}

class PublicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_une_publication_appartient_a_un_proprietaire()
    {
        $proprietaire = Proprietaire::factory()->create();
        $publication = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);

        $this->assertInstanceOf(Proprietaire::class, $publication->proprietaire);
    }

    public function test_une_publication_peut_avoir_plusieurs_domaines()
    {
        $publication = Publication::factory()->create();
        $domaines = Domaine::factory()->count(2)->create(['proprietaire_id' => $publication->proprietaire_id]);

        $publication->domaines()->attach($domaines->pluck('id'));

        $this->assertCount(2, $publication->domaines);
    }

    public function test_une_publication_peut_avoir_des_commentaires()
    {
        $publication = Publication::factory()->create();
        $auteur = Utilisateur::factory()->create();

        Commentaire::create([
            'auteur_id' => $auteur->id,
            'commentable_type' => Publication::class,
            'commentable_id' => $publication->id,
            'contenu' => 'Merci pour cet article !',
        ]);

        $this->assertCount(1, $publication->commentaires);
    }

    public function test_une_publication_peut_avoir_des_likes()
    {
        $publication = Publication::factory()->create();
        $auteur = Utilisateur::factory()->create();

        Like::create([
            'auteur_id' => $auteur->id,
            'likeable_type' => Publication::class,
            'likeable_id' => $publication->id,
        ]);

        $this->assertCount(1, $publication->likes);
    }
}

class CompetenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_une_competence_peut_avoir_plusieurs_niveaux()
    {
        $competence = Competence::factory()->create();
        $proprietaire = Proprietaire::factory()->create();

        NiveauCompetence::create([
            'proprietaire_id' => $proprietaire->id,
            'competence_id' => $competence->id,
            'niveau' => 'expert',
        ]);

        $this->assertCount(1, $competence->niveaux);
    }

    public function test_niveau_competence_est_dans_enum()
    {
        $this->assertContains('debutant', NiveauCompetence::NIVEAUX);
        $this->assertContains('intermediaire', NiveauCompetence::NIVEAUX);
        $this->assertContains('avance', NiveauCompetence::NIVEAUX);
        $this->assertContains('expert', NiveauCompetence::NIVEAUX);
    }
}
