<?php

namespace App\Mail;

use App\Models\Commentaire;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;

class CommentaireRejete extends Mailable
{
    public function __construct(
        public Commentaire $commentaire
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre commentaire n'a pas été retenu",
        );
    }

    public function build(): self
    {
        $author = $this->commentaire->auteur?->nom ?? 'Visiteur';
        $body = "Bonjour {$author},\n\n"
              . "Nous vous informons que votre commentaire n'a pas été approuvé sur notre site.\n\n"
              . "Cela peut être dû à son contenu ou à la politique de modération.\n\n"
              . "Votre commentaire :\n"
              . "> {$this->commentaire->contenu}\n\n"
              . "Nous vous remercions de votre compréhension.";
        return $this->text('emails.plain', ['body' => $body]);
    }

    public function attachments(): array
    {
        return [];
    }
}
