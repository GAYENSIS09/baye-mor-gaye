<?php

namespace App\Console\Commands;

use App\Models\Proprietaire;
use App\Models\Rappel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class EnvoyerRappels extends Command
{
    protected $signature = 'rappels:envoyer';
    protected $description = 'Envoie les rappels dont la date est passée et qui ne sont pas encore notifiés';

    public function handle(): int
    {
        $rappels = Rappel::where('est_notifie', false)
            ->where(function ($q) {
                $q->where('notifie_le', '<=', now())
                  ->orWhereNull('notifie_le');
            })
            ->get();

        if ($rappels->isEmpty()) {
            $this->info('Aucun rappel à envoyer.');
            return Command::SUCCESS;
        }

        $proprietaire = Proprietaire::with('utilisateur')->first();
        $email = $proprietaire?->utilisateur?->email ?? 'bayemor.gaye@ucad.edu.sn';

        foreach ($rappels as $rappel) {
            $titre = $rappel->titre;
            $desc = $rappel->message ?? $rappel->description ?? '';
            $date = $rappel->notifie_le?->format('d/m/Y H:i') ?? '—';

            $body = "Rappel : {$titre}\n\n{$desc}\n\nDate : {$date}";

            Mail::raw($body, function ($message) use ($email, $titre) {
                $message->to($email)
                        ->subject("Rappel : {$titre}")
                        ->from(
                            config('mail.from.address', 'gayensis09@gmail.com'),
                            config('mail.from.name', 'Baye Mor Gaye')
                        );
            });

            $rappel->update([
                'est_notifie' => true,
                'notifie_le'  => now(),
            ]);

            $this->info("Rappel envoyé : {$titre}");
        }

        return Command::SUCCESS;
    }
}
