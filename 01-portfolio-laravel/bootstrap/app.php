<?php

return Illuminate\Foundation\Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withSchedule(function (Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('rappels:envoyer')->everyMinute();
    })
    ->withMiddleware(function (Illuminate\Foundation\Configuration\Middleware $middleware) {
        $middleware->validateCsrfTokens(except: ['api/*']);
        $middleware->append(\App\Http\Middleware\ContentSecurityPolicy::class);
    })
    ->withExceptions(function (Illuminate\Foundation\Configuration\Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Illuminate\Http\Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        });

        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            return response()->json(['message' => 'Ressource introuvable.'], 404);
        });

        $exceptions->renderable(function (\Illuminate\Validation\ValidationException $e, $request) {
            return response()->json([
                'message' => 'Erreur de validation.',
                'errors' => $e->errors(),
            ], 422);
        });
    })
    ->create();
