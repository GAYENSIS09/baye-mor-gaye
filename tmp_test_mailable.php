<?php
$basePath = '/var/www';
require $basePath . '/vendor/autoload.php';
$app = require $basePath . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Mail\NouveauContact;

$contact = App\Models\Contact::find(6);
if (!$contact) {
    echo "Contact 6 not found, trying latest...\n";
    $contact = App\Models\Contact::latest()->first();
}
if (!$contact) {
    echo "No contacts found\n";
    exit(1);
}

echo "Testing NouveauContact (id={$contact->id}): {$contact->nom}\n";

$mailable = new NouveauContact($contact);
echo "Mailable: " . get_class($mailable) . "\n";

$ref = new ReflectionClass($mailable);
$textViewProp = $ref->getProperty("textView");
$textViewProp->setAccessible(true);
$viewProp = $ref->getProperty("view");
$viewProp->setAccessible(true);

echo "textView before: " . var_export($textViewProp->getValue($mailable), true) . "\n";
echo "view before: " . var_export($viewProp->getValue($mailable), true) . "\n";

$prepareRef = new ReflectionMethod($mailable, "prepareMailableForDelivery");
$prepareRef->setAccessible(true);
$prepareRef->invoke($mailable);

echo "textView after: " . var_export($textViewProp->getValue($mailable), true) . "\n";
echo "view after: " . var_export($viewProp->getValue($mailable), true) . "\n";

echo "Sending...\n";
$start = microtime(true);
Mail::to("bayemor.gaye@ucad.edu.sn")->send($mailable);
$elapsed = round((microtime(true) - $start) * 1000);
echo "Sent in {$elapsed}ms\n";
