<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

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
