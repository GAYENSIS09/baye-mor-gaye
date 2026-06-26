<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mailer\Envelope as SmtpEnvelope;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;

// Build transport with debug
$dsn = 'smtp://gayensis09%40gmail.com:xdri%20zktj%20ovsi%20lzhl@smtp.gmail.com:587';
$transport = Transport::fromDsn($dsn);

// Get the actual transport and add logging
if ($transport instanceof \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport) {
    echo "Transport type: EsmtpTransport\n";
    echo "Host: " . $transport->getStream()->getTransports()[0]->getHost() . "\n";
    echo "Port: " . $transport->getStream()->getTransports()[0]->getPort() . "\n";
}

// Send with full response capture
$email = (new Email())
    ->from('gayensis09@gmail.com')
    ->to('bayemor.gaye@ucad.edu.sn')
    ->subject('[INSTRUMENTED] Test #1')
    ->text("Test SMTP instrumentation.\nTimestamp: " . date('Y-m-d H:i:s'));

try {
    $start = microtime(true);
    $transport->send($email, SmtpEnvelope::create($email));
    $elapsed = (microtime(true) - $start) * 1000;
    echo "Send OK in {$elapsed}ms\n";
} catch (\Throwable $e) {
    echo "EXCEPTION: " . get_class($e) . ": " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
}

// Send 3 emails rapidly to test throttling
echo "\n--- Rapid batch test (3 emails) ---\n";
for ($i = 0; $i < 3; $i++) {
    $e = (new Email())
        ->from('gayensis09@gmail.com')
        ->to('bayemor.gaye@ucad.edu.sn')
        ->subject("[INSTRUMENTED] Batch #{$i}")
        ->text("Test {$i} at " . date('Y-m-d H:i:s'));
    try {
        $start = microtime(true);
        $transport->send($e, SmtpEnvelope::create($e));
        $elapsed = (microtime(true) - $start) * 1000;
        echo "Batch {$i}: OK in {$elapsed}ms\n";
    } catch (\Throwable $ex) {
        echo "Batch {$i}: ERROR - " . $ex->getMessage() . "\n";
    }
    sleep(1);
}

// Test Laravel Mail::raw vs send mailable
echo "\n--- Laravel comparison ---\n";
use Illuminate\Support\Facades\Mail;
use App\Mail\NouveauContact;
use App\Models\Contact;

// Test 1: Mail::raw
$start = microtime(true);
Mail::raw("Mail::raw test at " . date('Y-m-d H:i:s'), function ($m) {
    $m->to('bayemor.gaye@ucad.edu.sn')->subject('[LARAVEL] Mail::raw');
});
echo "Mail::raw: " . ((microtime(true) - $start) * 1000) . "ms\n";

// Test 2: Mail::send with NouveauContact
$contact = Contact::find(6);
if ($contact) {
    $start = microtime(true);
    Mail::to('bayemor.gaye@ucad.edu.sn')->send(new NouveauContact($contact));
    echo "Mail::send(NouveauContact): " . ((microtime(true) - $start) * 1000) . "ms\n";
}
