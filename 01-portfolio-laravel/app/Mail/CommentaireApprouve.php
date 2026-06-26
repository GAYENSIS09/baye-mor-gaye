<?php

namespace App\Mail;

use App\Models\Commentaire;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
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

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.commentaire.approuve',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
