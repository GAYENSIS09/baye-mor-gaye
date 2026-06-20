# STANDARDS SÉCURISÉS ET BONNES PRATIQUES NEXT.JS 16

## 1. NEXT.JS 16 : EXIGENCES DE CONCEPTION ET D'ARCHITECTURE

Next.js 16 utilise l'**App Router** comme structure fondamentale de routage. Il est impératif d'utiliser les React Server Components (RSC) au maximum de leur potentiel pour garantir des temps de chargement ultra-rapides, réduire l'empreinte JavaScript envoyée au client, et assurer une sécurité optimale (les clés d'API et appels de base de données s'exécutant côté serveur).

---

## 2. EXIGENCES D'IMPLÉMENTATION DE L'APP ROUTER

### 2.1 Hiérarchie des Fichiers de Route
Toute nouvelle route ou segment de route doit respecter la structure de fichiers standardisée de Next.js 16 :
*   `page.tsx` : Point d'entrée de la vue de la route (RSC par défaut).
*   `layout.tsx` : Structure commune persistante (maintient l'état à travers les navigations).
*   `loading.tsx` : Interface de chargement gérée automatiquement via React Suspense.
*   `error.tsx` : Frontière d'erreur (Error Boundary) capturant les erreurs du client ou du serveur dans le segment.
*   `not-found.tsx` : Rendu de la page 404 spécifique à un segment ou globale.

### 2.2 Isolement des Composants Serveur (RSC) et Client (RCC)
*   **Composants Serveur (RSC) :** Préférés pour les affichages de données, la récupération d'API, et les structures de pages de contenu. Les RSC ne peuvent pas utiliser d'états (`useState`), d'effets (`useEffect`), de hooks spécifiques au navigateur (`window`, `document`) ou de contextes.
*   **Composants Client (RCC) :** Identifiés obligatoirement par la directive `"use client"` tout en haut du fichier. À utiliser de manière chirurgicale uniquement pour les arbres de composants nécessitant de l'interactivité.
*   **Déplacement de la Frontière (Client Boundary) :** Toujours placer `"use client"` le plus bas possible dans l'arborescence des composants pour maximiser la proportion de RSC.

```
[ RSC: page.tsx (Récupère les données d'API) ]
  ├── [ RSC: Card.tsx (Affiche les données) ]
  └── [ RCC: ButtonContainer.tsx ("use client" - Interactivité locale) ]
```

---

## 3. RÉCUPÉRATION DE DONNÉES (DATA FETCHING) ET CACHE

### 3.1 Utilisation de l'API `fetch` Native Étendue
Dans les Server Components, utiliser la fonction `fetch` native que Next.js surcharge pour ajouter des capacités avancées de cache et de revalidation :
*   **Static Data (SSG) :** Mis en cache indéfiniment par défaut (`cache: 'force-cache'`).
*   **Dynamic Data (SSR) :** Ne jamais mettre en cache, revalidé à chaque requête (`cache: 'no-store'`).
*   **Incremental Static Regeneration (ISR) :** Revalidation temporelle (`next: { revalidate: 3600 }` pour 1 heure).

### 3.2 Server Actions vs API Routes
*   **Server Actions :** Fonctions asynchrones marquées par la directive `"use server"` exécutées sur le serveur mais appelées directement depuis le client. Elles sont recommandées pour les soumissions de formulaires simples, les mutations rapides et les changements d'états de données liés à la session utilisateur.
*   **API Routes (Route Handlers) :** Définies dans un fichier `route.ts`. Obligatoires pour exposer des endpoints tiers (Webhooks, intégrations mobiles, requêtes d'outils externes).

---

## 4. PRÉVENTION DES INCOHÉRENCES D'HYDRATION (HYDRATION ERRORS)

L'erreur d'hydratation se produit lorsque le HTML généré sur le serveur ne correspond pas au HTML attendu par React sur le client lors du premier rendu.

### 4.1 Causes Fréquentes à Éviter Absolument
*   **Utilisation d'API Spécifiques au Navigateur :** Tenter d'accéder à `window`, `localStorage`, `document` ou à des données dépendantes de la taille d'écran lors du premier rendu.
*   **Dates Dynamiques ou Nombres Aléatoires :** Rendre une date courante (`new Date()`) ou un nombre aléatoire (`Math.random()`) directement dans le JSX sans formatage statique ou sans isoler le calcul côté client.
*   **Structure HTML Invalide :** Balisage HTML non conforme (par exemple, placer un élément `<div>` à l'intérieur d'un paragraphe `<p>`).

### 4.2 Solutions Standardisées
*   **Utilisation de `useEffect` :** Initialiser les variables d'état du navigateur dans un `useEffect` qui s'exécute uniquement côté client :
    ```tsx
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    if (!isClient) return <Skeleton />;
    ```
*   **Désactivation Sélective du SSR (Dynamic Imports) :** Charger un composant instable en désactivant le SSR :
    ```tsx
    const ClientComponent = dynamic(() => import('./ClientComponent'), { ssr: false });
    ```

---

## 5. OPTIMISATION DES PERFORMANCES ET DES RESSOURCES

### 5.1 Optimisation des Images (`next/image`)
*   Interdiction d'utiliser la balise HTML `<img>` classique.
*   Utiliser systématiquement le composant `<Image />` de Next.js.
*   Renseigner obligatoirement les attributs `width` et `height` (ou utiliser `fill` avec un conteneur en `position: relative`) pour éliminer le décalage de mise en page (CLS - Cumulative Layout Shift).
*   Fournir l'attribut `priority` pour l'image principale au-dessus de la ligne de flottaison (LCP - Largest Contentful Paint).

### 5.2 Optimisation des Polices de Caractères (`next/font`)
*   Toutes les polices (comme Google Fonts) doivent être chargées localement et optimisées via `next/font/google`. Cela évite les requêtes tierces bloquantes lors du rendu initial.

### 5.3 Chargement Paresseux (Lazy Loading / Dynamic Imports)
*   Découper le code JavaScript de l'application en utilisant `next/dynamic` pour différer le chargement des composants lourds qui ne sont pas visibles immédiatement (modales, éditeurs de texte riches, graphiques).
*   Envelopper les transitions de pages et les chargements asynchrones dans des frontières `<Suspense>` pour permettre le **Streaming** progressif du HTML du serveur vers le client.
