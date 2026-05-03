<?php

namespace App\Mail;

use App\Models\Commentaire;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommentaireApprouve extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

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
