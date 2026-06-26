<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Mail\Mailable;
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

    public function build(): self
    {
        $c = $this->contact;
        $body = "Nouveau message de {$c->nom} ({$c->email})\n\n{$c->message}\n\nReçu le {$c->created_at->format('d/m/Y à H:i')}";
        return $this->text('emails.plain', ['body' => $body]);
    }

    public function attachments(): array
    {
        return [];
    }
}
