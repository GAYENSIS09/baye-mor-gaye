# CONTRAT ET DIAGNOSTIC DES PERFORMANCES SYSTEME

## 1. VISION ET MÉTRIQUES CIBLES DE PERFORMANCE

Les performances d'une application ne sont pas une considération de fin de projet. Elles font partie intégrante de l'architecture logicielle et doivent être prises en compte dès la première ligne de code. 

Le système complet (Next.js 16 + Laravel 11 + Docker) doit répondre à des critères d'efficacité stricts (temps de chargement initiaux minimaux, fluidité des transitions d'écrans, réactivité des APIs sous charge).

### Métriques Clés Cibles (SLA) :
*   **Temps de réponse de l'API Laravel :** < 150 ms (pour les requêtes GET standards).
*   **Largest Contentful Paint (LCP) :** < 1.5 s.
*   **Cumulative Layout Shift (CLS) :** < 0.1 (Aucun décalage visuel lors du chargement).
*   **First Input Delay (FID) ou Interaction to Next Paint (INP) :** < 100 ms.
*   **Time to First Byte (TTFB) :** < 400 ms.

---

## 2. DÉPISTAGE PROACTIF DES LENTEURS (GUIDE DE DIAGNOSTIC)

Face à un écran ou un endpoint d'API présentant des temps de réponse non satisfaisants, le modèle de langage doit analyser de manière méthodique les différentes causes de latence :

```
                               ┌────────────────────────────────┐
                               │   Analyse d'un écran lent      │
                               └────────────────────────────────┘
                                                │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
[ Base de Données ]             [ Backend / Réseau ]            [ Frontend / Client ]
- Requêtes N+1 ?                - Cache Redis absent ?          - Bundle size excessif ?
- Index manquants ?             - Traitement synchrone ?        - Hydratation bloquante ?
- Jointures lourdes ?           - Volume bind E/S Docker ?      - Waterfall d'appels API ?
```

### 2.1 Latence au niveau Base de Données (SQL)
*   **Requêtes N+1 :** La cause majeure d'effondrement des bases de données. Se produit lorsqu'une relation d'un modèle Eloquent est lue dans une boucle sans chargement hâtif (eager loading). 
    *   *Correction :* Utiliser systématiquement `with(['relation'])` et vérifier l'apparition de l'erreur via l'activation obligatoire du mode Eloquent Strict (voir `060-LARAVEL-11.md`).
*   **Indexation Absente :** Analyse des plans d'exécution SQL (`EXPLAIN`) pour s'assurer que les requêtes ne font pas de scans complets de tables (`Full Table Scan`).
    *   *Correction :* Indexer les champs clés de filtrage, tri et jointures (voir `090-DATABASE.md`).

### 2.2 Latence au niveau du Backend & Infrastructure
*   **Absence de mise en cache :** Les requêtes d'agrégation, les listes statiques de configuration, ou les données récurrentes ne doivent pas interroger SQL à chaque requête.
    *   *Correction :* Utiliser le cache Redis (`Cache::remember()`) et définir une politique d'invalidation lors des mises à jour.
*   **Traitements lourds en mode synchrone :** Les actions de génération de PDF, OCR (PaliGemma), envoi d'emails, ou communications tierces ralentissent inutilement le thread d'exécution HTTP principal.
    *   *Correction :* Déporter systématiquement ces tâches dans la file d'attente de Laravel en utilisant des `Jobs` asynchrones monitorés par Laravel Horizon.
*   **E/S disques lentes dans l'environnement Docker (Sail) :** Ralentissement sur macOS ou Windows lors de l'utilisation de volumes bind.
    *   *Correction :* Configurer l'utilisation d'une infrastructure WSL2 (sur Windows) ou de disques virtuels optimisés (gRPC FUSE / VirtioFS sur macOS) pour accélérer le montage des répertoires de développement.

### 2.3 Latence au niveau du Frontend (Next.js 16)
*   **Rendu bloquant (Waterfalls de fetches) :** Se produit lorsque des appels à l'API Laravel sont imbriqués séquentiellement dans des composants parents puis enfants côté client, provoquant des temps d'attente cumulatifs.
    *   *Correction :* Lancer les fetches réseau en parallèle (`Promise.all()`) ou utiliser des Server Components (RSC) qui s'exécutent sur le même réseau d'infrastructure que l'API Laravel, ou encore utiliser React Suspense pour diffuser progressivement le HTML (`Streaming`).
*   **Bundle Size excessif (Poids JavaScript) :** Trop de bibliothèques lourdes importées au démarrage ralentissent le chargement initial.
    *   *Correction :* Analyser la taille des lots (via `@next/bundle-analyzer`), découper les composants complexes avec `dynamic` (dynamic imports), et supprimer les imports inutilisés ou doublons (ex: lodash complet au lieu de méthodes isolées).
*   **Problème d'Hydratation bloquante :** L'arbre DOM est trop lourd ou comporte trop d'erreurs d'hydratation, forçant React à reconstruire intégralement le DOM au runtime côté client.
    *   *Correction :* Minimiser le nombre d'éléments HTML générés, isoler les interactions lourdes au sein de composants clients feuilles, et utiliser le composant `<Image>` de Next.js pour éviter les décalages de mise en page.
