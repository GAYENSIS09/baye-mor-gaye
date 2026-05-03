<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NouveauContact extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contact $contact
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Nouveau message de {$this->contact->nom}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact.nouveau',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
