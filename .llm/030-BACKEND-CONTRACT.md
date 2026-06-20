# CONTRAT SÉCURISÉ DU BACKEND (LARAVEL 11)

## 1. STRATÉGIE ET PRINCIPES SOUVERAINS DU BACKEND

Le backend, propulsé par **Laravel 11**, est l'unique garant de l'intégrité des données, des règles métier et de la sécurité du système. Il ne doit **jamais** faire confiance aux données envoyées par le frontend. Toute requête entrante doit subir un processus de filtrage, de validation, de vérification d'autorisation et d'audit strict.

```
Request ──> Middleware (Sanctum) ──> FormRequest (Validation) ──> Policy (Autorisation) 
                                                                         │
Response <── JsonResource <── UseCase / Service (Métier) <── DTO <───────┘
```

---

## 2. EXIGENCES STRICTES PAR ENDPOINT d'API

Pour chaque endpoint exposé par l'API, les 20 critères suivants doivent être formellement implémentés et documentés :

### 2.1 Route & Méthode HTTP (Sémantique REST)
*   Définition claire dans `routes/api.php` avec les verbes REST standardisés.
*   Utilisation de noms de ressources au pluriel.

### 2.2 Authentification (Auth Sanctum)
*   Tous les endpoints (sauf enregistrement et connexion) doivent être protégés par le middleware `auth:sanctum`.
*   Gestion propre de la durée de vie des tokens d'accès.

### 2.3 Autorisation & Policies (Abstractions fines)
*   Interdiction d'utiliser des vérifications de rôle génériques dans les contrôleurs.
*   Chaque action doit être soumise à une Policy Laravel (`php artisan make:policy`).
*   Appel systématique de `$this->authorize('view', $resource)` ou de la méthode équivalente dans le contrôleur.

### 2.4 Validation Stricte (FormRequest)
*   Chaque requête d'écriture (`POST`, `PUT`, `PATCH`) doit posséder sa classe `FormRequest` dédiée.
*   La méthode `rules()` de la requête doit typée et sécuriser chaque paramètre (types, regex, existence en base de données, min/max, unicité).
*   La méthode `authorize()` de la requête peut déléguer à la Policy correspondante.

### 2.5 Objets de Transfert de Données (DTO)
*   Le contrôleur doit instancier un DTO typé à partir des données validées de la `FormRequest`.
*   Le DTO isole la couche métier (Service/UseCase) des spécificités de la requête HTTP Laravel.

### 2.6 Logique Métier (Services / Use Cases)
*   Le contrôleur ne contient aucune logique métier ni requête SQL directe. Il appelle un service métier ou un handler de commande.
*   Tous les effets de bord (créations de logs, notifications, appels d'API externes) doivent être orchestrés ici.

### 2.7 API Resources (JsonResource de Laravel)
*   Toutes les réponses de l'API doivent être formatées via des classes héritant de `Illuminate\Http\Resources\Json\JsonResource` ou `ResourceCollection`.
*   Interdiction absolue de retourner directement des modèles Eloquent (`return User::all()`). Cela évite de divulguer accidentellement des colonnes sensibles (mots de passe, tokens, données d'audit).

### 2.8 Format de Réponse JSON Standardisé
Toutes les réponses de l'API (succès et erreurs) doivent suivre ce format :

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com"
  },
  "meta": {
    "timestamp": "2026-06-13T12:00:00Z"
  }
}
```

En cas d'erreur (ex: validation 422) :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Les données fournies sont invalides.",
    "details": {
      "email": ["L'adresse email est déjà utilisée."]
    }
  }
}
```

### 2.9 Codes de Statut HTTP Explicites
*   `200 OK` : Succès d'une lecture ou d'une mise à jour simple.
*   `201 Created` : Succès d'une création de ressource.
*   `204 No Content` : Succès d'une suppression.
*   `400 Bad Request` : Erreur de syntaxe ou logique métier invalide côté client.
*   `401 Unauthorized` : Utilisateur non authentifié.
*   `403 Forbidden` : Utilisateur authentifié mais non autorisé (Policy rejetée).
*   `404 Not Found` : Ressource inexistante.
*   `422 Unprocessable Entity` : Échec de validation des données d'entrée.
*   `500 Internal Server Error` : Erreur interne non gérée (à éviter au maximum, catchée globalement).

### 2.10 Pagination Standardisée
*   Toutes les listes de ressources doivent être paginées en utilisant la pagination de Laravel (`paginate()`).
*   Le format de retour doit inclure les clés de métadonnées de pagination standard de Laravel (`current_page`, `last_page`, `per_page`, `total`, `links`).

### 2.11 Tri (Sorting)
*   Les listes d'API doivent accepter un paramètre `sort` sous la forme `?sort=created_at` ou `?sort=-created_at` (pour un tri décroissant).
*   Seuls les champs explicitement indexés et autorisés peuvent servir de critère de tri.

### 2.12 Filtrage (Filtering)
*   Les filtres doivent être passés en paramètres de requête (ex: `?filter[status]=active`).
*   Utiliser des Scopes locaux dans les modèles Eloquent pour encapsuler la logique de filtrage SQL.

### 2.13 Recherche textuelle (Search)
*   Implémenter un paramètre `search` pour la recherche plein texte (ex: `?search=dupont`).
*   Optimiser ces requêtes avec des index appropriés ou utiliser Laravel Scout si le volume est important.

### 2.14 Mise en Cache (Redis Cache)
*   Les requêtes de lecture lourdes ou fréquentes doivent être mises en cache à l'aide de Redis (`Cache::remember`).
*   Mettre en place des stratégies d'invalidation rigoureuses lors des écritures (utilisation d'observateurs de modèles Eloquent).

### 2.15 Files d'attente & Jobs en arrière-plan (Laravel Horizon)
*   Tout traitement lourd ou asynchrone (envoi de mails, appels API tiers, traitement IA avec PaliGemma, génération de PDF) doit être dispatché dans une file d'attente (`Dispatchable Job`).
*   Suivi obligatoire via l'interface **Laravel Horizon** pour monitorer le taux d'erreur et le temps d'exécution.

### 2.16 WebSockets & Temps Réel (Laravel Echo / Reverb)
*   Les changements d'états critiques doivent être diffusés via des événements temps réel (`ShouldBroadcast`).
*   Utiliser des canaux privés sécurisés (`PrivateChannel`) nécessitant une autorisation dans `routes/channels.php`.

### 2.17 Intégration IA / Traitement d'images (PaliGemma)
*   Les appels aux modèles de vision (comme PaliGemma pour l'OCR, l'étiquetage d'images, etc.) doivent être isolés dans des services dédiés.
*   Ils doivent être exécutés de manière asynchrone (Job Queue) pour ne pas bloquer le thread HTTP principal.
*   Gestion stricte des timeouts et des cas de défaillance du conteneur de service IA.

### 2.18 Dockerisation & Environnement de Dev (Sail)
*   Toute la configuration système doit être définie dans le `docker-compose.yml` (Services : app, mysql, redis, mailpit, paligemma).
*   Les volumes bind doivent être optimisés pour éviter les ralentissements d'E/S (surtout sur Windows/macOS).

### 2.19 Tests unitaires et d'intégration (Pest / PHPUnit)
*   Chaque endpoint doit être couvert à 100% par des tests d'intégration.
*   Vérifier les cas nominaux (200/201), les cas d'erreur de validation (422) et les cas de non-autorisation (401/403).
*   Utilisation de factories d'usines pour générer des données de test réalistes.

---

## 3. PROTECTION STRICTE CONTRE LES EFFETS DE BORD INCONNUS

Le backend doit interdire l'utilisation d'appels à des méthodes magiques ou à des raccourcis non typés. L'utilisation du mode strict d'Eloquent est obligatoire dans `AppServiceProvider.php` :

```php
Model::preventLazyLoading(! app()->isProduction());
Model::preventSilentlyDiscardingAttributes(! app()->isProduction());
Model::preventAccessingMissingAttributes(! app()->isProduction());
```
Cela permet de détecter les requêtes N+1 et les affectations de masse non autorisées dès l'environnement de développement.
