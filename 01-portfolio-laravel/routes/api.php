<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CompetenceController;
use App\Http\Controllers\Api\DomaineController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\CommentaireController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\ProjetPortfolioController;
use App\Http\Controllers\Api\EdtController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\ConversionController;
use App\Http\Controllers\Api\RappelController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RessourceController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\FormationController;
use App\Http\Controllers\Api\CertificationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\VuePageController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\MediaController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:15,60');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:30,60');

// Public — enregistrement de vue (visiteur)
Route::post('/vues', [VuePageController::class, 'enregistrer'])->middleware('throttle:30,60');

Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{slug}', [PublicationController::class, 'show']);

Route::get('/profile/public', [ProfileController::class, 'publicProfile']);

Route::get('/projets', [ProjetPortfolioController::class, 'index']);
Route::get('/projets/{slug}', [ProjetPortfolioController::class, 'show']);

Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);

Route::get('/ressources', [RessourceController::class, 'index']);
Route::get('/ressources/{ressource}', [RessourceController::class, 'show']);

Route::get('/experiences', [ExperienceController::class, 'index']);
Route::get('/experiences/{experience}', [ExperienceController::class, 'show']);
Route::get('/formations', [FormationController::class, 'index']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::get('/certifications', [CertificationController::class, 'index']);
Route::get('/certifications/{certification}', [CertificationController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,60');

// Logout — must handle expired tokens, so avoid auth:sanctum
Route::post('/logout', [AuthController::class, 'logout']);

// Public read routes for competences and domaines
Route::get('/competences', [CompetenceController::class, 'index']);
Route::get('/competences/{competence}', [CompetenceController::class, 'show']);
Route::get('/domaines', [DomaineController::class, 'index']);
Route::get('/domaines/{domaine}', [DomaineController::class, 'show']);

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/password', [AuthController::class, 'changePassword']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::apiResource('competences', CompetenceController::class)->except(['index', 'show']);
    Route::apiResource('domaines', DomaineController::class)->except(['index', 'show']);

    Route::apiResource('publications', PublicationController::class)
        ->except(['index', 'show'])
        ->parameters(['publications' => 'publication']);

    Route::get('/commentaires/mes-commentaires', [CommentaireController::class, 'mesCommentaires']);
    Route::get('/commentaires/en-attente', [CommentaireController::class, 'enAttente']);
    Route::post('/commentaires', [CommentaireController::class, 'store']);
    Route::put('/commentaires/{commentaire}/approuver', [CommentaireController::class, 'approuver']);
    Route::put('/commentaires/{commentaire}/rejeter', [CommentaireController::class, 'rejeter']);
    Route::put('/commentaires/{commentaire}', [CommentaireController::class, 'update']);
    Route::patch('/commentaires/{commentaire}', [CommentaireController::class, 'update']);
    Route::delete('/commentaires/{commentaire}', [CommentaireController::class, 'destroy']);

    Route::get('/statistiques', [StatistiqueController::class, 'index']);

    Route::post('/likes/toggle', [LikeController::class, 'toggle']);

    Route::apiResource('projets', ProjetPortfolioController::class)
        ->except(['index', 'show'])
        ->parameters(['projets' => 'projetPortfolio']);

    Route::apiResource('edt', EdtController::class)
        ->except(['show'])
        ->parameters(['edt' => 'emploiDuTemp']);

    Route::apiResource('evenements', EvenementController::class)
        ->except(['index', 'show']);

    Route::post('/edt/import', [EdtController::class, 'import']);
    Route::post('/conversions/import', [ConversionController::class, 'importedt']);
    Route::apiResource('conversions', ConversionController::class)
        ->except(['show']);

    Route::apiResource('rappels', RappelController::class)
        ->parameters(['rappels' => 'rappel']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    Route::apiResource('experiences', ExperienceController::class)
        ->except(['index', 'show']);
    Route::apiResource('formations', FormationController::class)
        ->except(['index', 'show']);
    Route::apiResource('certifications', CertificationController::class)
        ->except(['index', 'show']);

    Route::post('/upload', [UploadController::class, 'store']);
    Route::post('/upload/image', [UploadController::class, 'uploadImage']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::put('/media/{media}', [MediaController::class, 'update']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);

    Route::apiResource('ressources', RessourceController::class)
        ->except(['index', 'show']);

    Route::get('/contacts', [ContactController::class, 'index']);
    Route::get('/contacts/{contact}', [ContactController::class, 'show']);
    Route::patch('/contacts/{contact}/read', [ContactController::class, 'markAsRead']);
    Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);
});
