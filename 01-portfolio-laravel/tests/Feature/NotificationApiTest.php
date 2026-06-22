<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Proprietaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationApiTest extends TestCase
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

    public function test_lister_notifications_non_lues()
    {
        Notification::factory()->count(3)->create([
            'proprietaire_id' => $this->proprietaire->id,
            'est_lue' => false,
        ]);

        $this->auth()->getJson('/api/notifications')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_lister_toutes_les_notifications()
    {
        Notification::factory()->count(2)->create([
            'proprietaire_id' => $this->proprietaire->id,
            'est_lue' => true,
        ]);

        $this->auth()->getJson('/api/notifications?toutes=true')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_marquer_comme_lue()
    {
        $notification = Notification::factory()->create([
            'proprietaire_id' => $this->proprietaire->id,
            'est_lue' => false,
        ]);

        $this->auth()->patchJson("/api/notifications/{$notification->id}/read")
            ->assertStatus(200)
            ->assertJson(['data' => ['est_lue' => true]]);
    }

    public function test_marquer_tout_comme_lu()
    {
        Notification::factory()->count(3)->create([
            'proprietaire_id' => $this->proprietaire->id,
            'est_lue' => false,
        ]);

        $this->auth()->patchJson('/api/notifications/read-all')
            ->assertStatus(200)
            ->assertJson(['message' => 'Toutes les notifications ont ete marquees comme lues.']);

        $this->assertEquals(0, Notification::where('est_lue', false)->count());
    }

    public function test_supprimer_notification()
    {
        $notification = Notification::factory()->create([
            'proprietaire_id' => $this->proprietaire->id,
        ]);

        $this->auth()->deleteJson("/api/notifications/{$notification->id}")
            ->assertStatus(204);

        $this->assertModelMissing($notification);
    }

    public function test_401_sans_token_sur_notifications()
    {
        $this->getJson('/api/notifications')->assertStatus(401);
        $this->patchJson('/api/notifications/1/read')->assertStatus(401);
        $this->patchJson('/api/notifications/read-all')->assertStatus(401);
        $this->deleteJson('/api/notifications/1')->assertStatus(401);
    }

    public function test_403_ne_peut_pas_lire_notification_autrui()
    {
        $other = Proprietaire::factory()->create();
        $notif = Notification::factory()->create(['proprietaire_id' => $other->id]);

        $this->auth()->patchJson("/api/notifications/{$notif->id}/read")->assertStatus(403);
        $this->auth()->deleteJson("/api/notifications/{$notif->id}")->assertStatus(403);
    }
}
