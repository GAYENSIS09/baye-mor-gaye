<?php

namespace Tests\Unit;

use App\Models\Competence;
use App\Models\NiveauCompetence;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

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
