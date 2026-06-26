<?php
$basePath = '/var/www';
require $basePath . '/vendor/autoload.php';
$app = require $basePath . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;

echo "=== CONFIG ===" . PHP_EOL;
echo "MAIL_MAILER: " . config("mail.default") . PHP_EOL;
echo "MAIL_HOST: " . config("mail.mailers.smtp.host") . PHP_EOL;
echo "MAIL_PORT: " . config("mail.mailers.smtp.port") . PHP_EOL;
echo "MAIL_USERNAME: " . config("mail.mailers.smtp.username") . PHP_EOL;
$pw = config("mail.mailers.smtp.password") ?? "null";
echo "MAIL_PASSWORD: " . substr($pw, 0, 10) . "..." . PHP_EOL;
echo "APP_ENV: " . app()->environment() . PHP_EOL;
echo "QUEUE_CONNECTION: " . config("queue.default") . PHP_EOL;

$mailer = Mail::mailer();
$ref = new ReflectionClass($mailer);
$transportProp = $ref->getProperty("transport");
$transportProp->setAccessible(true);
$transport = $transportProp->getValue($mailer);

echo "Transport: " . get_class($transport) . PHP_EOL;
echo PHP_EOL;

echo "=== TEST 1: Single Mail::raw ===" . PHP_EOL;
try {
    $start = microtime(true);
    Mail::raw("Test 1 - single raw at " . date("Y-m-d H:i:s"), function($m) {
        $m->to("bayemor.gaye@ucad.edu.sn")->subject("[FORENSIC-1] Single raw " . date("Ymd-His"));
    });
    echo "OK in " . round((microtime(true) - $start) * 1000) . "ms" . PHP_EOL;
} catch (Throwable $e) {
    echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: 3 rapid Mail::raw (no sleep) ===" . PHP_EOL;
for ($i = 0; $i < 3; $i++) {
    try {
        $start = microtime(true);
        Mail::raw("Test 2 - rapid #$i at " . date("Y-m-d H:i:s"), function($m) use ($i) {
            $m->to("bayemor.gaye@ucad.edu.sn")->subject("[FORENSIC-2] Rapid #$i " . date("Ymd-His"));
        });
        echo "OK in " . round((microtime(true) - $start) * 1000) . "ms" . PHP_EOL;
    } catch (Throwable $e) {
        echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== TEST 3: HTML email ===" . PHP_EOL;
try {
    $start = microtime(true);
    Mail::html("<html><body><h1>Test HTML</h1><p>Hello at " . date("Y-m-d H:i:s") . "</p></body></html>", function($m) {
        $m->to("bayemor.gaye@ucad.edu.sn")->subject("[FORENSIC-3] HTML test " . date("Ymd-His"));
    });
    echo "OK in " . round((microtime(true) - $start) * 1000) . "ms" . PHP_EOL;
} catch (Throwable $e) {
    echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 4: Big HTML email (spammy) ===" . PHP_EOL;
$bigHtml = "<html><head><style>body{font-family:Arial}h1{color:blue}p{font-size:14px}</style></head><body>";
$bigHtml .= str_repeat("<p>Line " . date("Y-m-d H:i:s") . " - spammy content test. Please ignore.</p>", 50);
$bigHtml .= "</body></html>";
try {
    $start = microtime(true);
    Mail::html($bigHtml, function($m) {
        $m->to("bayemor.gaye@ucad.edu.sn")->subject("[FORENSIC-4] Big HTML " . date("Ymd-His"));
    });
    echo "OK in " . round((microtime(true) - $start) * 1000) . "ms, size: " . strlen($bigHtml) . " chars" . PHP_EOL;
} catch (Throwable $e) {
    echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 5: HTML with external image ===" . PHP_EOL;
try {
    $start = microtime(true);
    Mail::html("<html><body><h1>With image</h1><img src=\"https://baye-mor-gaye.duckdns.org/images/logo.png\" alt=\"logo\"><p>Test at " . date("Y-m-d H:i:s") . "</p></body></html>", function($m) {
        $m->to("bayemor.gaye@ucad.edu.sn")->subject("[FORENSIC-5] With image " . date("Ymd-His"));
    });
    echo "OK in " . round((microtime(true) - $start) * 1000) . "ms" . PHP_EOL;
} catch (Throwable $e) {
    echo "FAILED: " . get_class($e) . ": " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== ALL DONE ===" . PHP_EOL;
