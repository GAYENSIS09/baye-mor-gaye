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
    protected $description = 'Notifie le propriétaire des événements à venir dans les 24h';

    public function handle(): int
    {
        $evenements = Evenement::with('emploiDuTemps')
            ->whereBetween('date_debut', [now(), now()->addDay()])
            ->where('statut', '!=', 'annule')
            ->get();

        if ($evenements->isEmpty()) {
            $this->info('Aucun événement à venir.');
            return Command::SUCCESS;
        }

        $proprietaire = Proprietaire::with('utilisateur')->first();
        $email = $proprietaire?->utilisateur?->email ?? config('proprietaire.email');

        foreach ($evenements as $evenement) {
            Mail::to($email)->queue(new EvenementDu($evenement));
            $this->info("Notification envoyée : {$evenement->titre}");
        }

        return Command::SUCCESS;
    }
}
