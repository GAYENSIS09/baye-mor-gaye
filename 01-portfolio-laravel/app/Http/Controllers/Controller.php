<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

abstract class Controller
{
    protected function tryAuthUser(Request $request): void
    {
        if (!$request->user() && $request->bearerToken()) {
            $accessToken = PersonalAccessToken::findToken($request->bearerToken());
            if ($accessToken) {
                $request->setUserResolver(fn() => $accessToken->tokenable);
            }
        }
    }

    protected function getProprietaireId(Request $request): ?int
    {
        return $request->user()?->proprietaire?->id;
    }

    protected function authorizeOwnership(Request $request, object $model, string $ownerKey = 'proprietaire_id'): bool
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId) return false;
        return ($model->{$ownerKey} ?? null) === $proprietaireId;
    }

    protected function authorizeOwnershipOrFail(Request $request, object $model, string $ownerKey = 'proprietaire_id'): void
    {
        if (!$this->authorizeOwnership($request, $model, $ownerKey)) {
            abort(403, 'Action non autorisée.');
        }
    }
}
