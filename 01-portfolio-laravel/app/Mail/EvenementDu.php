<?php

namespace App\Mail;

use App\Models\Evenement;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class EvenementDu extends Mailable
{
    public function __construct(
        public Evenement $evenement
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Événement : {$this->evenement->titre}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.evenement.du',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
