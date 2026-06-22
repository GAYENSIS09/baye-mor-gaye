<?php

namespace Tests\Unit;

use App\Models\Publication;
use App\Models\Proprietaire;
use App\Models\Domaine;
use App\Models\Utilisateur;
use App\Models\Commentaire;
use App\Models\Like;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

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
