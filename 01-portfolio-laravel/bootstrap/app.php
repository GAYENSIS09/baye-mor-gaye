<?php

return Illuminate\Foundation\Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withProviders([
        \App\Providers\AppServiceProvider::class,
    ])
    ->withSchedule(function (Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('rappels:envoyer')->everyMinute();
        $schedule->command('evenements:notifier')->hourly();
    })
    ->withMiddleware(function (Illuminate\Foundation\Configuration\Middleware $middleware) {
        $middleware->validateCsrfTokens(except: ['api/*']);
        $middleware->append(\App\Http\Middleware\ContentSecurityPolicy::class);
        $middleware->redirectGuestsTo(fn () => null);

        if (env('APP_DEBUG', false)) {
            $middleware->append(\App\Http\Middleware\LogQueries::class);
        }
    })
    ->withExceptions(function (Illuminate\Foundation\Configuration\Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Illuminate\Http\Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->reportable(function (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[Exception] ' . get_class($e) . ': ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
        });

        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            \Illuminate\Support\Facades\Log::info('[Auth] Non authentifié depuis ' . $request->ip());
            return response()->json(['message' => 'Non authentifié.'], 401);
        });

        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            \Illuminate\Support\Facades\Log::info('[404] ' . $request->method() . ' ' . $request->path());
            return response()->json(['message' => 'Ressource introuvable.'], 404);
        });

        $exceptions->renderable(function (\Illuminate\Validation\ValidationException $e, $request) {
            \Illuminate\Support\Facades\Log::info('[Validation] ' . $request->method() . ' ' . $request->path());
            return response()->json([
                'message' => 'Erreur de validation.',
                'errors' => $e->errors(),
            ], 422);
        });
    })
    ->create();
