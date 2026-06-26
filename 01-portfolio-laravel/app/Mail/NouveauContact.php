<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NouveauContact extends Mailable
{
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
