<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\Proprietaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

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
            'utilisateur' => $utilisateur,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $utilisateur = Utilisateur::where('email', $data['email'])->first();

        if (!$utilisateur || !Hash::check($data['password'], $utilisateur->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $utilisateur->update(['derniere_connexion_le' => now()]);

        $token = $utilisateur->createToken('auth-token')->plainTextToken;

        return response()->json([
            'utilisateur' => $utilisateur->load('proprietaire'),
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return $request->user()->load('proprietaire');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Deconnecte.']);
    }
}
