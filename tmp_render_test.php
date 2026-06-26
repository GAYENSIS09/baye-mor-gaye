<?php
$basePath = '/var/www';
require $basePath . '/vendor/autoload.php';
$app = require $basePath . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Mail\NouveauContact;

$contact = App\Models\Contact::find(6);
if (!$contact) {
    $contact = App\Models\Contact::latest()->first();
}

$mailable = new NouveauContact($contact);

$prepareRef = new ReflectionMethod($mailable, "prepareMailableForDelivery");
$prepareRef->setAccessible(true);
$prepareRef->invoke($mailable);

// Try to get the rendered content
try {
    $rendered = $mailable->render();
    echo "Rendered HTML: " . strlen($rendered) . " chars\n";
    echo "Body preview: " . substr($rendered, 0, 500) . "\n";
} catch (Throwable $e) {
    echo "Render error: " . get_class($e) . ": " . $e->getMessage() . "\n";
}

// Check if there's a text body
$symfonyMessage = $mailable->toSymfonyMessage();
$textBody = $symfonyMessage->getTextBody();
$htmlBody = $symfonyMessage->getHtmlBody();

echo "\n--- Text body ---\n";
echo $textBody ? substr($textBody, 0, 500) : "(none)";
echo "\n\n--- HTML body ---\n";
echo $htmlBody ? substr($htmlBody, 0, 500) : "(none)";
echo "\n";
