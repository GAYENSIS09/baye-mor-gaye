<?php

namespace App\Providers;

use App\Models\Competence;
use App\Models\Domaine;
use App\Policies\CompetencePolicy;
use App\Policies\DomainePolicy;
use App\Services\Contracts\VisionServiceInterface;
use App\Services\PaliGemmaStub;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Gate::policy(Competence::class, CompetencePolicy::class);
        Gate::policy(Domaine::class, DomainePolicy::class);
    }
}
