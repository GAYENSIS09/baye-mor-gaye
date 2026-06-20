<?php

namespace App\Providers;

use App\Models\Certification;
use App\Models\Commentaire;
use App\Models\Competence;
use App\Models\Contact;
use App\Models\Conversion;
use App\Models\Domaine;
use App\Models\EmploiDuTemps;
use App\Models\Evenement;
use App\Models\Experience;
use App\Models\Formation;
use App\Models\Notification;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\Rappel;
use App\Models\Ressource;
use App\Policies\CertificationPolicy;
use App\Policies\CommentairePolicy;
use App\Policies\CompetencePolicy;
use App\Policies\ContactPolicy;
use App\Policies\ConversionPolicy;
use App\Policies\DomainePolicy;
use App\Policies\EmploiDuTempsPolicy;
use App\Policies\EvenementPolicy;
use App\Policies\ExperiencePolicy;
use App\Policies\FormationPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\ProjetPortfolioPolicy;
use App\Policies\PublicationPolicy;
use App\Policies\RappelPolicy;
use App\Policies\RessourcePolicy;
use App\Services\Contracts\VisionServiceInterface;
use App\Services\PaliGemmaStub;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(VisionServiceInterface::class, function () {
            if (config('services.paligemma.enabled', false)) {
                return $this->app->make(\App\Services\PaliGemmaVertex::class);
            }
            return new PaliGemmaStub;
        });
    }

    public function boot(): void
    {
        Model::preventLazyLoading(! app()->isProduction());
        Model::preventSilentlyDiscardingAttributes(! app()->isProduction());
        Model::preventAccessingMissingAttributes(! app()->isProduction());

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Gate::policy(Competence::class, CompetencePolicy::class);
        Gate::policy(Domaine::class, DomainePolicy::class);
        Gate::policy(Publication::class, PublicationPolicy::class);
        Gate::policy(ProjetPortfolio::class, ProjetPortfolioPolicy::class);
        Gate::policy(Experience::class, ExperiencePolicy::class);
        Gate::policy(Formation::class, FormationPolicy::class);
        Gate::policy(Certification::class, CertificationPolicy::class);
        Gate::policy(EmploiDuTemps::class, EmploiDuTempsPolicy::class);
        Gate::policy(Evenement::class, EvenementPolicy::class);
        Gate::policy(Rappel::class, RappelPolicy::class);
        Gate::policy(Ressource::class, RessourcePolicy::class);
        Gate::policy(Commentaire::class, CommentairePolicy::class);
        Gate::policy(Conversion::class, ConversionPolicy::class);
        Gate::policy(Contact::class, ContactPolicy::class);
        Gate::policy(Notification::class, NotificationPolicy::class);
    }
}
