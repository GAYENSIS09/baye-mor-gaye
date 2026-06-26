<?php

namespace App\Console\Commands;

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
        $email = $proprietaire->utilisateur?->email ?? 'bayemor.gaye@ucad.edu.sn';

        $evenements = Evenement::with('emploiDuTemps')
            ->where('statut', 'confirme')
            ->whereBetween('date_debut', [now(), now()->addMinutes($delay)])
            ->get();

        if ($evenements->isEmpty()) {
            $this->info('Aucun événement à notifier pour le moment.');
            return Command::SUCCESS;
        }

        foreach ($evenements as $evenement) {
            $titre = $evenement->titre;
            $desc = $evenement->description ?? '';
            $debut = $evenement->date_debut?->format('d/m/Y H:i') ?? '—';
            $fin = $evenement->date_fin?->format('d/m/Y H:i') ?? '—';
            $lieu = $evenement->lieu ?? '—';
            $edt = $evenement->emploiDuTemps?->titre ?? '—';

            $body = "Événement : {$titre}\n\n{$desc}\n\nDébut : {$debut}\nFin : {$fin}\nLieu : {$lieu}\nEmploi du temps : {$edt}";

            Mail::raw($body, function ($message) use ($email, $titre) {
                $message->to($email)
                        ->subject("Événement : {$titre}")
                        ->from(
                            config('mail.from.address', 'gayensis09@gmail.com'),
                            config('mail.from.name', 'Baye Mor Gaye')
                        );
            });

            $evenement->update(['statut' => 'termine']);
            $this->info("Notification envoyée et événement marqué terminé : {$titre}");
        }

        return Command::SUCCESS;
    }
}
