# NORMES DE QUALITÉ DE CODE ET STRATÉGIE DE TEST

## 1. VISION DE LA QUALITÉ DU CODE

La qualité du code n'est pas un concept subjectif ou esthétique. C'est une discipline d'ingénierie rigoureuse qui garantit la maintenabilité, la lisibilité, la robustesse et l'évolution sans régression de notre système. Un code de qualité supérieure est un code facile à comprendre pour un nouvel ingénieur, simple à tester et résistant aux pannes.

---

## 2. STANDARDS DE STYLE DE CODE ET OUTILS D'ANALYSE STATIQUE

L'application doit respecter scrupuleusement les conventions de style établies pour chaque technologie. Aucun code ne doit être fusionné sans être validé par les linters et formateurs de code automatisés.

### 2.1 Backend (PHP/Laravel 11)
*   **Style de Code :** Respect strict des standards **PSR-12** et des conventions Laravel.
*   **Formateur automatique :** Utilisation obligatoire de **Laravel Pint** (`vendor/bin/pint`) avant chaque commit pour uniformiser la mise en forme du code.
*   **Analyse Statique :** Utilisation de **PHPStan** ou **Larastan** au niveau de sévérité maximal possible (au moins niveau 5) pour détecter les incohérences de types, les variables indéfinies et les méthodes inexistantes au runtime.

### 2.2 Frontend (TypeScript/Next.js 16)
*   **Style et Formatage :** Utilisation combinée d'**ESLint** et de **Prettier**.
*   **Configuration ESLint :** Doit inclure les règles recommandées pour TypeScript (`@typescript-eslint/recommended`) et Next.js (`eslint-config-next`).
*   **Règle d'or :** Tout avertissement (warning) de linter doit être traité comme une erreur bloquante. L'utilisation d'annotations de désactivation (`/* eslint-disable */` ou `// @ts-ignore`) doit être justifiée de manière exceptionnelle et documentée.

---

## 3. STRATÉGIE DE COUVERTURE DES TESTS

La confiance dans la stabilité de notre code repose sur une pyramide de tests automatisés exhaustive et performante.

```
                    ┌───────────────────────────┐
                    │      Tests de Bout en     │   <-- Playwright / Cypress
                    │         Bout (E2E)        │       (Parcours utilisateur complets)
                    └───────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │    Tests d'Intégration /  │   <-- Pest (Feature Tests)
                    │    Fonctionnels (APIs)    │       (Endpoints, Validations, SQL)
                    └───────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │     Tests Unitaires       │   <-- Pest / PHPUnit / Jest
                    │   (Services, Use Cases)   │       (Logique métier pure)
                    └───────────────────────────┘
```

### 3.1 Tests d'Intégration API (Backend - Pest / PHPUnit)
*   Chaque endpoint de l'API Laravel doit être testé sous toutes ses coutures (Feature Tests).
*   **Couverture obligatoire :**
    *   Le cas nominal de succès (statut 200/201, structure JSON conforme).
    *   Les cas d'erreurs de validation des données d'entrée (statut 422, structure d'erreur standardisée).
    *   Les cas d'erreurs d'autorisation (statut 401 si non authentifié, statut 403 si les règles de la Policy échouent).
    *   Les cas d'erreurs de ressource introuvable (statut 404).

### 3.2 Tests Unitaires de Logique Métier (Pest / Jest)
*   Toute fonction ou classe pure (contenant du calcul ou de la logique métier dans le domaine ou les services, sans appel réseau ni base de données directe) doit être isolée et testée de manière unitaire.
*   Utiliser des mocks ou doublons pour isoler les dépendances externes (repositories de base de données, services tiers).

### 3.3 Tests de Bout en Bout (E2E) (Playwright)
*   Les parcours critiques de l'application (inscription, authentification, processus de commande, configuration utilisateur principale) doivent être couverts par des tests de bout en bout simulant un navigateur réel avec Playwright ou Cypress.
*   Ces tests garantissent que l'intégration finale entre Next.js et Laravel fonctionne parfaitement en conditions réelles.

---

## 4. PROCESSUS DE SÉCURISATION DU CODE ET DU CYCLE CI/CD

Chaque commit et pull request doit être automatiquement validé par un pipeline d'Intégration Continue (CI/CD) contenant les étapes obligatoires suivantes :

1.  **Étape de Peluchage (Linting) & Formatage :** Exécuter `eslint` et `prettier --check` sur le front, `pint --test` sur le back.
2.  **Étape d'Analyse Statique :** Exécuter `phpstan` ou `larastan` pour le backend, `tsc --noEmit` pour valider le typage strict du frontend.
3.  **Étape de Tests :** Lancer l'intégralité de la suite de tests (`pest` pour Laravel, `npm run test` pour Next.js). Le pipeline doit échouer si le moindre test échoue ou si le seuil de couverture minimale requis (généralement 80%) n'est pas atteint.
4.  **Étape d'Audit de Sécurité :** Lancer `composer audit` et `npm audit` pour vérifier l'absence de failles connues dans les dépendances de production.
