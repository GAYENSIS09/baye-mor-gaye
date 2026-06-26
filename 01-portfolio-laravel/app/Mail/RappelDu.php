<?php

namespace App\Mail;

use App\Models\Rappel;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class RappelDu extends Mailable
{

    public function __construct(
        public Rappel $rappel
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Rappel : {$this->rappel->titre}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rappel.du',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
