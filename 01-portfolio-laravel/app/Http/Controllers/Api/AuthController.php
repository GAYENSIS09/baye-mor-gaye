<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAuthRequest;
use App\Http\Resources\UtilisateurResource;
use App\Models\Utilisateur;
use App\Models\Proprietaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(StoreAuthRequest $request)
    {
        $data = $request->validated();

        $utilisateur = Utilisateur::create([
            'nom' => $data['nom'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        if (!Proprietaire::exists()) {
            Proprietaire::create([
                'utilisateur_id' => $utilisateur->id,
            ]);
        }

        $utilisateur->load('proprietaire');

        $token = $utilisateur->createToken('auth-token')->plainTextToken;

        return response()->json([
            'utilisateur' => UtilisateurResource::make($utilisateur->load('proprietaire')),
            'token' => $token,
        ], 201);
    }

    public function login(StoreAuthRequest $request)
    {
        $data = $request->validated();

        $utilisateur = Utilisateur::where('email', $data['email'])->first();

        if (!$utilisateur || !Hash::check($data['password'], $utilisateur->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $utilisateur->update(['derniere_connexion_le' => now()]);

        $token = $utilisateur->createToken('auth-token')->plainTextToken;

        return response()->json([
            'utilisateur' => UtilisateurResource::make($utilisateur->load('proprietaire')),
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return UtilisateurResource::make($request->user()->load('proprietaire'));
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($personalAccessToken) {
                $personalAccessToken->delete();
            }
        }

        return response()->json(['message' => 'Déconnecté.']);
    }
}
