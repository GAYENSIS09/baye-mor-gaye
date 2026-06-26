<?php

namespace App\Mail;

use App\Models\Commentaire;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;

class CommentaireApprouve extends Mailable
{
    public function __construct(
        public Commentaire $commentaire
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre commentaire a été approuvé',
        );
    }

    public function build(): self
    {
        $author = $this->commentaire->auteur?->nom ?? 'Visiteur';
        $body = "Bonjour {$author},\n\n"
              . "Votre commentaire a été approuvé et est désormais visible publiquement.\n\n"
              . "Votre commentaire :\n"
              . "> {$this->commentaire->contenu}\n\n"
              . "Merci pour votre contribution !";
        return $this->text('emails.plain', ['body' => $body]);
    }

    public function attachments(): array
    {
        return [];
    }
}
