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
        $c = $this->contact;
        $body = "Nouveau message de {$c->nom} ({$c->email})\n\n{$c->message}\n\nReçu le {$c->created_at->format('d/m/Y à H:i')}";
        return new Content(
            text: 'emails.plain',
            with: ['body' => $body],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
