<?php

namespace App\Mail;

use App\Models\Evenement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EvenementDu extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

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
