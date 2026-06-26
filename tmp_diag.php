<?php
$basePath = '/var/www';
require $basePath . '/vendor/autoload.php';
$app = require $basePath . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;

echo "=== CONFIG ===" . PHP_EOL;
echo "MAIL_MAILER: " . config("mail.default") . PHP_EOL;
echo "MAIL_HOST: " . config("mail.mailers.smtp.host") . PHP_EOL;
echo "MAIL_PORT: " . config("mail.mailers.smtp.port") . PHP_EOL;
echo "MAIL_USERNAME: " . config("mail.mailers.smtp.username") . PHP_EOL;
$pw = config("mail.mailers.smtp.password") ?? "null";
echo "MAIL_PASSWORD: " . substr($pw, 0, 10) . "..." . PHP_EOL;
echo "APP_ENV: " . app()->environment() . PHP_EOL;
echo "QUEUE_CONNECTION: " . config("queue.default") . PHP_EOL;
echo "DB_DEFAULT: " . config("database.default") . PHP_EOL;
echo PHP_EOL;

echo "=== Sending test email ===" . PHP_EOL;
try {
    $start = microtime(true);
    Mail::raw("Test email at " . date("Y-m-d H:i:s"), function ($m) {
        $m->to("bayemor.gaye@ucad.edu.sn")
          ->subject("[DIAG] Test " . date("Ymd-His"));
    });
    $elapsed = round((microtime(true) - $start) * 1000);
    echo "OK in {$elapsed}ms" . PHP_EOL;
} catch (Throwable $e) {
    echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== Sending contact-form mailable ===" . PHP_EOL;
try {
    $contact = App\Models\Contact::find(6);
    if ($contact) {
        $mailable = new App\Mail\NouveauContact($contact);
        $start = microtime(true);
        Mail::to("bayemor.gaye@ucad.edu.sn")->send($mailable);
        $elapsed = round((microtime(true) - $start) * 1000);
        echo "NouveauContact OK in {$elapsed}ms" . PHP_EOL;
    } else {
        echo "No contact found" . PHP_EOL;
    }
} catch (Throwable $e) {
    echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== Checking log ===" . PHP_EOL;
$log = file_get_contents($basePath . '/storage/logs/laravel.log');
if ($log) {
    echo $log;
} else {
    echo "(no log)" . PHP_EOL;
}
