## 0. INTERDICTIONS ABSOLUES (RED LINES)

Il est strictement interdit d'introduire les pratiques suivantes dans le backend :
*   **Logique dans les Contrôleurs :** Interdiction d'écrire des calculs métier, des validations complexes ou des requêtes SQL directement dans un contrôleur. Le contrôleur est un orchestrateur, pas un cerveau.
*   **Requêtes SQL Brutes sans Binding :** L'utilisation de `DB::raw()` avec concaténation de variables est un motif de rejet immédiat du code.
*   **Appels API Externes Synchrones :** Aucun appel réseau externe ne doit être effectué durant le cycle de vie d'une requête HTTP. Tout appel externe doit être encapsulé dans un `Job` asynchrone.
*   **Modification Directe d'Attributs de Modèle sans Validation :** Ne jamais modifier un modèle sans passer par un DTO ou un service validant les invariants métier.
*   **Utilisation de `any` ou `mixed` sans typage strict :** Le code doit être typé pour éviter les erreurs de runtime.

## 1. LARAVEL 11 : EXIGENCES ET ARCHITECTURE APPLICATIVE


Laravel 11 introduit une structure de projet simplifiée (suppression de plusieurs fichiers de configuration par défaut, regroupement des configurations dans `bootstrap/app.php` et `bootstrap/providers.php`). 

Pour maintenir la clarté et l'extensibilité du projet dans ce nouvel environnement, nous imposons des patrons d'architecture stricts.

---

## 2. DÉCOUPLAGE DES COUCHES ET FLUX DE REQUÊTES

Le flux d'exécution d'une requête HTTP d'écriture au sein de Laravel 11 doit impérativement respecter l'arborescence suivante :

```
             ┌──────────────────────────────────────────┐
             │            Requête HTTP API              │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │       FormRequest (Validation d'Entrée)  │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │    Policy Laravel (Autorisation Fine)    │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │       Contrôleur API (Orchestrateur)     │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │  DTO (Extraction & Typage des données)   │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │     Service / UseCase (Logique Métier)   │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │      Modèle Eloquent (Persistance)       │
             └──────────────────────────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │    JsonResource (Formatage de Réponse)    │
             └──────────────────────────────────────────┘
```

### 2.1 Les Modèles Eloquent : Sécurisation Absolue
Pour éviter les failles de sécurité de type affectation de masse (Mass Assignment) et optimiser les performances des requêtes SQL de manière automatique, les règles suivantes s'appliquent à tous les modèles :
*   **Interdiction d'utiliser `$guarded = []` :** Définir explicitement les attributs modifiables via la propriété `protected $fillable = [...]`.
*   **Activation du Mode Strict :** Activé dans la méthode `boot()` d'un fournisseur de services (ex: `AppServiceProvider.php`) :
    ```php
    use Illuminate\Database\Eloquent\Model;

    Model::preventLazyLoading(! app()->isProduction());
    Model::preventSilentlyDiscardingAttributes(! app()->isProduction());
    Model::preventAccessingMissingAttributes(! app()->isProduction());
    ```
    *   `preventLazyLoading` : Lève une exception si une relation est chargée de manière différée (N+1), forçant l'utilisation du chargement hâtif (`Eager Loading` via `with()`).
    *   `preventSilentlyDiscardingAttributes` : Lève une exception si on tente de sauvegarder une colonne non déclarée dans `$fillable`.
    *   `preventAccessingMissingAttributes` : Lève une exception si on tente de lire une colonne absente du résultat de la requête SQL (utile pour éviter les bogues lors de l'utilisation de `select()`).

---

## 3. AUTORISATIONS ET POLICIES (POLITIQUES)

Chaque action sur un modèle Eloquent doit posséder son pendant d'autorisation.
*   **Création d'une Policy :** Liée à un modèle (ex: `php artisan make:policy PostPolicy --model=Post`).
*   **Vérification Programmatique :** Toujours vérifier les habilitations de l'utilisateur dans le contrôleur ou dans la FormRequest :
    ```php
    $this->authorize('update', $post);
    ```
*   **Abstractions de Rôles :** Ne jamais vérifier directement le rôle dans la logique applicative (ex: `if ($user->role === 'admin')`). Préférer la définition de permissions fines rattachées à l'utilisateur et évaluées au travers des Policies.

---

## 4. GESTION DES JOBS ET FILES D'ATTENTE (LARAVEL HORIZON)

Les opérations bloquantes doivent être déportées dans des files d'attente asynchrones.
*   **Configuration du pilote :** Utiliser exclusivement le pilote Redis en production (`QUEUE_CONNECTION=redis`).
*   **Structure des Jobs :** Implémenter l'interface `ShouldQueue`, utiliser le trait `Queueable`, définir le nombre maximal d'essais (`public $tries = 3`) et gérer gracieusement l'échec de traitement avec la méthode `failed(Throwable $exception)`.
*   **Monitoring avec Horizon :**
    *   La configuration de `config/horizon.php` doit définir des files d'attente prioritaires (ex: `high`, `default`, `low`).
    *   Le tableau de bord d'Horizon doit être protégé en production via une authentification stricte dans `HorizonServiceProvider.php`.

---

## 5. TRANSMISSION EN TEMPS RÉEL (LARAVEL ECHO / REVERB)

Pour les fonctionnalités nécessitant du temps réel (notamment les notifications instantanées ou la synchronisation d'interfaces) :
*   **Laravel Reverb :** Préféré comme serveur de WebSockets natif de Laravel 11.
*   **Événements Diffusables :** Implémenter l'interface `ShouldBroadcastNow` ou `ShouldBroadcast` sur les classes d'événements.
*   **Sécurisation des Canaux :** Les canaux de diffusion privés (`PrivateChannel`) doivent être déclarés et authentifiés dans `routes/channels.php` à l'aide de fermetures (closures) ou de classes de canal validant les permissions des utilisateurs abonnés.

---

## 6. OPTIMISATION DE LA COUCHE BASE DE DONNÉES

*   **Pas de requêtes N+1 :** Utiliser systématiquement `with()` lors de la récupération de modèles pour inclure leurs relations.
*   **Indexation :** Toutes les colonnes servant de filtre dans les clauses `where()`, de clé de tri (`orderBy`) ou de clé étrangère doivent être indexées au niveau des migrations de base de données.
*   **Transactions de Base de Données :** Pour toute écriture modifiant plusieurs tables liées, envelopper l'exécution dans une transaction SQL pour garantir l'atomicité et la cohérence de la base en cas de panne :
    ```php
    DB::transaction(function () use ($dto) {
        // Opérations d'écriture multiples
    });
    ```
