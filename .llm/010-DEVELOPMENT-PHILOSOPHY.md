# PHILOSOPHIE DE DÉVELOPPEMENT ET PRINCIPES ARCHITECTURAUX

## 1. VISION ARCHITECTURALE : CLEAN ARCHITECTURE & DDD

L'architecture de notre système est fondée sur la séparation stricte des préoccupations (Separation of Concerns). Nous combinons les principes de la **Clean Architecture** et du **Domain-Driven Design (DDD)** pour assurer la maintenabilité, l'extensibilité et l'indépendance de la logique métier vis-à-vis des frameworks et des détails d'infrastructure.

### 1.1 Bounded Contexts (Contextes Bornés)
Le système est divisé en contextes bornés. Chaque contexte possède son propre modèle de domaine, son propre langage omniprésent (Ubiquitous Language) et ses propres règles.
*   **Règle d'Or :** Aucun objet de domaine ne doit traverser la frontière d'un contexte borné sans être traduit en un DTO ou un événement de domaine.
*   **Interdiction :** Ne jamais créer un "Modèle Dieu" (God Object) unique pour tout le système (ex: un modèle `User` utilisé pour l'authentification, la facturation, le profil social et la gestion RH). Chaque contexte doit avoir sa propre représentation de l'utilisateur.

### 1.2 Tactical DDD (DDD Tactique)
Nous appliquons les patterns tactiques suivants :
*   **Entities :** Objets définis par leur identité unique et non par leurs attributs.
*   **Value Objects :** Objets définis uniquement par leurs attributs (ex: `Email`, `Money`, `Address`). Ils sont immuables.
*   **Aggregates :** Groupements d'entités et de Value Objects traités comme une seule unité pour garantir l'intégrité des invariants métier. L'Aggregate Root est le seul point d'entrée.
*   **Domain Services :** Logique métier qui ne peut être naturellement placée dans une Entité ou un Value Object.
*   **Domain Events :** Notifications de changements d'état critiques au sein du domaine, déclenchant des réactions dans d'autres contextes.


### 1.2 La Couche Application (Application Layer / Use Cases)
*   Orchestre le flux de données vers et depuis la couche domaine.
*   **Contenu :** Cas d'utilisation (Use Cases), Commandes (Commands), Requêtes (Queries), Services Applicatifs, Handlers, et DTOs d'entrée/sortie.
*   **Règle absolue :** Elle implémente la logique spécifique à l'application mais pas les détails de persistance ou de livraison d'interface.

### 1.3 La Couche Interface (Interface Adapters Layer)
*   Traduit les données de la forme la plus pratique pour l'utilisation et le domaine vers la forme la plus pratique pour les frameworks externes.
*   **Contenu :** Contrôleurs API, Présentateurs, Contrôleurs de Vue, Renseigneurs de DTOs, Middlewares, API Routes (Next.js), et Client API (Front-end).

### 1.4 La Couche Infrastructure (Infrastructure Layer)
*   Contient tous les détails technologiques et d'implémentation.
*   **Contenu :** Moteurs de bases de données (Eloquent Models, Schemas, Migrations), Services de Cache (Redis), File d'attente (Horizon), Services de messagerie, SDK tiers, Docker, Configurations serveurs.

---

## 2. LES COPILLONS ARCHITECTURAUX : SOLID, DRY, KISS, YAGNI

### 2.1 Principes SOLID
Chaque classe, composant ou module doit respecter scrupuleusement les 5 principes SOLID :

1.  **S - Single Responsibility Principle (SRP) :** Une classe ou un composant ne doit avoir qu'une seule et unique raison de changer. 
    *   *Exemple Laravel :* Un contrôleur ne valide pas les données et ne manipule pas la base de données. Il délègue à une `FormRequest` pour la validation et à un `UseCase` ou `Service` pour l'action.
    *   *Exemple Next.js :* Un composant UI (visualisation) ne doit pas gérer directement les appels réseau complexes. Il reçoit ses données via des propriétés ou délègue à un hook personnalisé.
2.  **O - Open/Closed Principle (OCP) :** Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.
    *   Utiliser l'injection d'interfaces plutôt que des classes concrètes pour permettre de modifier le comportement en fournissant une nouvelle implémentation.
3.  **L - Liskov Substitution Principle (LSP) :** Une classe dérivée doit pouvoir remplacer sa classe de base sans altérer le fonctionnement correct du programme.
4.  **I - Interface Segregation Principle (ISP) :** Préférer plusieurs interfaces spécifiques à une seule interface générale. Ne forcez pas une classe à dépendre de méthodes qu'elle n'utilise pas.
5.  **D - Dependency Inversion Principle (DIP) :** Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.
    *   *Exemple :* Le Use Case dépend d'une interface `UserRepositoryInterface` (définie dans le Domaine). L'implémentation concrète `EloquentUserRepository` (définie dans l'Infrastructure) est injectée via le Container de Services de Laravel.

### 2.2 DRY (Don't Repeat Yourself) & WET (Write Everything Twice)
*   Toute connaissance ou logique métier ne doit avoir qu'une représentation unique et non ambiguë au sein du système.
*   **Nuance importante :** Éviter l'abstraction prématurée. Si deux morceaux de code se ressemblent purement par coïncidence mais représentent des concepts métier différents, ils ne doivent pas être factorisés.

### 2.3 KISS (Keep It Simple, Stupid)
*   La simplicité est la sophistication suprême. Éviter la sur-ingénierie (over-engineering). 
*   Toujours préférer la solution la plus lisible et la plus directe, tant qu'elle ne viole pas les règles de sécurité, de performance ou d'architecture globale.

### 2.4 YAGNI (You Aren't Gonna Need It)
*   Ne développez pas de fonctionnalités ou de points d'extension "au cas où" on en aurait besoin dans le futur. Implémentez uniquement ce qui est requis par les spécifications et les diagrammes UML actuels.

---

## 3. PARADIGME CQRS (COMMAND QUERY RESPONSIBILITY SEGREGATION)

Pour optimiser les performances, l'évolutivité et la clarté du code, nous séparons les opérations de lecture et d'écriture :

*   **Commandes (Écritures) :** Modifient l'état du système (Création, Mise à jour, Suppression). Elles ne retournent aucune donnée en dehors des métadonnées de succès ou des IDs d'entités créées. Elles passent par des validateurs stricts et déclenchent des événements de domaine.
*   **Requêtes (Lectures) :** Récupèrent des données sans altérer l'état du système. Elles sont hautement optimisées pour la performance (utilisation de caches Redis, requêtes SQL directes ou de vues spécifiques si nécessaire, pas de traitements lourds d'écriture).

---

## 4. PARADIGME REST & CONTRATS D'API

Toute exposition d'API doit suivre une structure RESTful pure :

*   **Verbes HTTP sémantiques :** `GET` (Lecture), `POST` (Création), `PUT` (Remplacement complet), `PATCH` (Modification partielle), `DELETE` (Suppression).
*   **Statuts HTTP explicites :** `200 OK`, `201 Created`, `202 Accepted`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`, `500 Internal Server Error`.
*   **Noms au pluriel pour les ressources :** `/api/users`, `/api/articles`.
*   **Pas de verbe dans les URIs :** Interdiction d'écrire `/api/getUsers` ou `/api/createArticle`.
