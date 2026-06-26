<?php
require '/var/www/vendor/autoload.php';
$app = require_once '/var/www/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$all = App\Models\Ressource::all();
foreach ($all as $r) {
    echo "ID: {$r->id} | Titre: {$r->titre} | est_publique: " . ($r->est_publique ? 'true' : 'false') . " | deleted_at: {$r->deleted_at}\n";
}
