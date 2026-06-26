<?php

namespace App\Console\Commands;

use App\Mail\RappelDu;
use App\Models\Proprietaire;
use App\Models\Rappel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class EnvoyerRappels extends Command
{
    protected $signature = 'rappels:envoyer';
    protected $description = 'Notifie des rappels confirmés dont la date est dans le délai configuré, puis les marque comme notifiés';

    public function handle(): int
    {
        $proprietaire = Proprietaire::with('utilisateur')->first();
        $delay = $proprietaire->notification_delay_minutes ?? 15;

        $rappels = Rappel::where('est_notifie', false)
            ->whereNotNull('notifie_le')
            ->whereBetween('notifie_le', [now(), now()->addMinutes($delay)])
            ->get();

        if ($rappels->isEmpty()) {
            $this->info('Aucun rappel à envoyer.');
            return Command::SUCCESS;
        }

        $email = $proprietaire?->utilisateur?->email ?? 'bayemor.gaye@ucad.edu.sn';

        foreach ($rappels as $rappel) {
            $updated = Rappel::where('id', $rappel->id)
                ->where('est_notifie', false)
                ->update([
                    'est_notifie' => true,
                    'notifie_le'  => now(),
                ]);

            if ($updated === 0) {
                $this->warn("Rappel déjà traité : {$rappel->titre}");
                continue;
            }

            Mail::to($email)->send(new RappelDu($rappel));

            $this->info("Rappel envoyé : {$rappel->titre}");

            sleep(3);
        }

        return Command::SUCCESS;
    }
}
