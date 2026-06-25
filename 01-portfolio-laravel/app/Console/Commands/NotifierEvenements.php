<?php

namespace App\Console\Commands;

use App\Mail\EvenementDu;
use App\Models\Evenement;
use App\Models\Proprietaire;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class NotifierEvenements extends Command
{
    protected $signature = 'evenements:notifier';
    protected $description = 'Notifie le propriétaire des événements confirmés à venir, puis les marque comme terminés';

    public function handle(): int
    {
        $proprietaire = Proprietaire::with('utilisateur')->first();
        if (!$proprietaire) {
            $this->error('Aucun propriétaire trouvé.');
            return Command::FAILURE;
        }

        $delay = $proprietaire->notification_delay_minutes ?? 15;
        $email = $proprietaire->utilisateur?->email ?? config('proprietaire.email');

        $evenements = Evenement::with('emploiDuTemps')
            ->where('statut', 'confirme')
            ->whereBetween('date_debut', [now(), now()->addDay()])
            ->whereRaw('DATE_SUB(date_debut, INTERVAL ? MINUTE) <= NOW()', [$delay])
            ->get();

        if ($evenements->isEmpty()) {
            $this->info('Aucun événement à notifier pour le moment.');
            return Command::SUCCESS;
        }

        foreach ($evenements as $evenement) {
            Mail::to($email)->queue(new EvenementDu($evenement));
            $evenement->update(['statut' => 'termine']);
            $this->info("Notification envoyée et événement marqué terminé : {$evenement->titre}");
        }

        return Command::SUCCESS;
    }
}
