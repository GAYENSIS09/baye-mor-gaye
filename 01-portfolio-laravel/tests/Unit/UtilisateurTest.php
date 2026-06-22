<?php

namespace Tests\Unit;

use App\Models\Utilisateur;
use App\Models\Proprietaire;
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
