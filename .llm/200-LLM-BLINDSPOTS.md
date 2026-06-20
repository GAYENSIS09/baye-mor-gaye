# CATALOGUE DES ANGLES MORTS ET ERREURS INCONSCIENTES DU LLM

## 1. NATURE DU DOCUMENT

Ce document recense les erreurs "classiques" que les modèles de langage commettent systématiquement en raison d'une vision trop théorique du code. Ce catalogue sert de **liste de vérification anti-hallucination comportementale**.

---

## 2. MATRICE DES ERREURS : PROBLÈME $\rightarrow$ CAUSE $\rightarrow$ CORRECTION

### 2.1 Gestion de la Session et Persistance (The "Refresh" Bug)
*   **Problème :** L'utilisateur est déconnecté ou perd ses données après un rafraîchissement de page (F5).
*   **Cause LLM :** Stockage de l'état d'authentification ou des données critiques uniquement dans un state React (`useState`) ou un store volatil (Zustand/Redux sans middleware de persistance).
*   **Correction Obligatoire :** 
    *   Utiliser des cookies `HttpOnly` pour le token.
    *   Implémenter un mécanisme de "Re-hydration" au montage de l'app (`useEffect` initial qui vérifie la session auprès de l'API).
    *   Utiliser `persist` pour les stores Zustand.

### 2.2 Cycle de Vie et Hydratation (The "Hydration" Bug)
*   **Problème :** Erreurs de type "Text content did not match" ou "Hydration failed".
*   **Cause LLM :** Génération de contenu dynamique (dates, nombres aléatoires, accès à `localStorage`) directement dans le corps du composant serveur.
*   **Correction Obligatoire :** 
    *   Isoler tout code dépendant du client dans un `useEffect`.
    *   Utiliser un état `isClient` pour ne rendre le contenu dynamique qu'après le montage.

### 2.3 Asynchronisme et Course de Données (The "Race Condition" Bug)
*   **Problème :** Affichage de données provenant d'une requête précédente après un changement de page ou de filtre.
*   **Cause LLM :** Lancement de requêtes asynchrones sans gestion de l'annulation.
*   **Correction Obligatoire :** 
    *   Implémenter `AbortController` pour annuler les fetchs en cours lors du démontage du composant.
    *   Utiliser des clés de requête uniques avec `React Query` ou `SWR`.

### 2.4 Gestion des Tokens et Auth (The "Silent Fail" Bug)
*   **Problème :** L'interface ne réagit plus (boutons inactifs) car le token a expiré sans que le frontend ne le sache.
*   **Cause LLM :** Absence d'intercepteur global pour traiter les réponses HTTP `401 Unauthorized`.
*   **Correction Obligatoire :** 
    *   Créer un intercepteur Axios/Fetch qui capture toutes les `401`.
    *   Déclencher une redirection automatique vers `/login` ou un flux de rafraîchissement de token.

### 2.5 Fuites de Mémoire (The "Memory Leak" Bug)
*   **Problème :** Ralentissement progressif de l'application et crashs du navigateur.
*   **Cause LLM :** Création de timers (`setInterval`), d'écouteurs d'événements (`window.addEventListener`) ou d'abonnements WebSocket sans fonction de nettoyage.
*   **Correction Obligatoire :** 
    *   Systématiser le `return () => { ... }` dans les `useEffect` pour supprimer tout effet secondaire.

### 2.6 Logique de Base de Données (The "N+1" Blindspot)
*   **Problème :** L'application est rapide en dev (10 lignes) mais s'effondre en prod (1000 lignes).
*   **Cause LLM :** Accès aux relations Eloquent dans une boucle `foreach` sans chargement hâtif.
*   **Correction Obligatoire :** 
    *   Audit systématique des boucles $\rightarrow$ Ajout de `with(['relation'])`.

---

## 3. INTÉGRATION AU PROCESSUS DE GOUVERNANCE

L'utilisation de ce catalogue est obligatoire lors des deux phases suivantes :

1.  **L'Auto-Audit (`160-AUTO-AUDIT.md`) :** Le modèle doit se demander : *"Est-ce que mon implémentation tombe dans l'un des pièges du catalogue 200 ?"*
2.  **L'Auto-Critique (`180-SELF-CRITIQUE.md`) :** Le modèle doit explicitement valider : *"J'ai vérifié la persistance au refresh et l'annulation des requêtes asynchrones."*
