# CONTRAT SÉCURISÉ DU FRONTEND (NEXT.JS 16)

## 1. STRATÉGIE ET PRINCIPES SOUVERAINS DU FRONTEND

Le frontend, développé avec **Next.js 16 (App Router)** et **TypeScript**, est l'interface d'interaction utilisateur directe. Il doit offrir une expérience utilisateur (UX) fluide, rapide, accessible et résiliente. 

Le frontend doit respecter scrupuleusement le contrat d'API défini par le backend, implémenter une validation locale des formulaires pour un feedback instantané, et être capable de gérer gracieusement les erreurs de réseau, les coupures de connexion (mode offline) et les mises à jour en temps réel.

```
┌────────────────────────────────────────────────────────┐
│                      NEXT.JS 16                        │
│                                                        │
│  [Server Components (RSC)] ──> Fetch (API Laravel)     │
│             │                                          │
│             ▼ (Hydration / Props)                      │
│  [Client Components] ──> React Context / State         │
│             │                                          │
│             ▼ (Interactions)                           │
│     Formulaires (Zod) ──> Fetch Mutation (Optimistic)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. INTÉGRATION STRICTE DU CONTRAT D'API

Le frontend ne doit jamais deviner la forme des réponses du backend. Toutes les requêtes HTTP vers l'API Laravel doivent s'appuyer sur des types TypeScript auto-générés ou définis en stricte synchronisation avec le backend (voir `070-TYPESCRIPT.md` et `080-API-CONTRACT.md`).

*   **Client d'API Unifié :** Utilisation d'une instance Axios ou Fetch configurée avec des intercepteurs pour injecter automatiquement le jeton Sanctum (`Bearer Token`) et intercepter globalement les erreurs HTTP (401, 403, 500).
*   **Gestion des Sessions :** Persistance du token Sanctum dans un cookie sécurisé, HttpOnly si possible ou via une configuration de session NextAuth/Cookies gérée de manière étanche.

---

## 3. COMPOSANTS SERVEUR (RSC) VS COMPOSANTS CLIENT

*   **React Server Components (RSC) par défaut :** Toutes les pages et mises en page (Layouts) doivent être des RSC. Ils récupèrent les données directement depuis l'API Laravel au niveau du serveur, réduisant le javascript envoyé au client et éliminant les "waterfalls" d'appels réseau côté client.
*   **Composants Client (`"use client"`) restrictifs :** À n'utiliser que pour les parties d'interfaces interactives (Formulaires, boutons cliquables complexes, abonnements WebSockets, gestion d'états d'animation).

---

## 4. LISTE DE CONTRÔLE ABSOLUE POUR LES FORMULAIRES

Chaque formulaire développé doit valider et implémenter les 20 critères d'expérience utilisateur et de sécurité suivants :

### 4.1 Spécifications techniques d'accessibilité et d'ergonomie
1.  **Champs Typés :** Utilisation systématique des types HTML5 appropriés (`email`, `password`, `tel`, `number`, `date`, `url`).
2.  **Labels Explicites :** Chaque champ possède un `<label>` lié de manière unique par l'attribut `htmlFor` (ou `id`).
3.  **Placeholders Pertinents :** Indiquent un exemple de saisie attendue (ne remplace pas le label).
4.  **Helper Texts :** Informations contextuelles d'aide à la saisie positionnées sous le champ.
5.  **Tooltips Contextuels :** Pour les explications d'aide longues ou techniques.
6.  **Champs Requis/Optionnels :** Marquage visuel clair (ex: `*`) et programmatique (`required`, `aria-required="true"`).
7.  **Saisie Auto-complète :** Attribut `autoComplete` correctement renseigné (`email`, `current-password`, `new-password`, `username`).
8.  **Navigation au Clavier :** Ordre de tabulation logique (`tabIndex`), activation par la touche `Entrée` ou `Espace`.
9.  **Gestion du Focus :** Focus visuel fort (bordure visible), focus automatique sur le premier champ en erreur lors de la soumission.

### 4.2 Validation des Données (Double Barrière)
10. **Validation Frontend Instantanée :** Utilisation d'une bibliothèque de validation de schéma (comme **Zod** combiné avec **React Hook Form**).
11. **Contraintes de Saisie :** Validation du format (Regex), de la longueur minimale/maximale (`min`, `max`, `maxLength`), du caractère requis ou nullable.
12. **Traduction des Messages d'Erreur :** Messages clairs et conviviaux en français (pas de messages d'erreur système bruts).
13. **Rendu d'Erreurs Accessible :** Erreurs affichées sous chaque champ concerné avec l'attribut `aria-invalid="true"` et reliées par `aria-describedby` à l'élément contenant le message d'erreur.
14. **Validation Backend (Fallback) :** Capture des erreurs `422 Unprocessable Entity` du backend et association dynamique des messages d'erreur retournés par Laravel aux champs correspondants du formulaire.

### 4.3 Sécurisation et Nettoyage
15. **Protection CSRF :** Inclusion automatique des cookies et jetons de session requis par Laravel Sanctum.
16. **Sanitisation et Échappement :** Échappement de toutes les saisies pour prévenir les failles Cross-Site Scripting (XSS).
17. **Limitation de Soumission (Debouncing / Throttling) :** Désactivation du bouton de soumission dès le clic pour éviter les doubles requêtes d'écriture.

### 4.4 Adaptabilité et États de chargement
18. **Rendu Mobile vs Desktop :** Saisie optimisée pour mobile (types de claviers adaptés comme `inputMode="numeric"` pour les nombres), boutons larges, espacement suffisant.
19. **État de Soumission (Loading/Submitting) :** Bouton de soumission désactivé affichant un indicateur de chargement (spinner) et un libellé adapté ("Envoi en cours...").
20. **Réinitialisation & États Vides :** Comportement propre après succès (champs vidés ou redirection, affichage d'un état de confirmation).

## 6. GESTION D'ÉTAT ET CACHE SERVEUR (NEXT.JS 16)

### 6.1 Stratégie de Gestion d'État (State Management)
L'état doit être géré au niveau le plus bas possible pour éviter des re-rendus inutiles de l'arborescence :
*   **État Local :** `useState` et `useReducer` pour les interactions isolées.
*   **État Partagé (Léger) :** React Context pour les données globales comme le thème ou la session utilisateur.
*   **État Global (Complexe) :** Zustand ou Redux Toolkit pour les états applicatifs complexes (ex: panier d'achat, filtres de recherche globaux).
*   **État Serveur :** Utilisation de `SWR` ou `React Query` pour la synchronisation et le cache des données d'API côté client.

### 6.2 Cache et Revalidation Serveur (RSC)
Pour garantir la fraîcheur des données tout en maintenant les performances du serveur :
*   **Revalidation par Tag :** Utilisation de `revalidateTag('tag-name')` pour invalider des segments de cache spécifiques lors d'une mutation de donnée.
*   **Revalidation par Chemin :** Utilisation de `revalidatePath('/path')` pour forcer la mise à jour d'une page spécifique après une Server Action.
*   **Interdiction :** Ne jamais utiliser de cache global non invalidé pour des données utilisateur privées.
