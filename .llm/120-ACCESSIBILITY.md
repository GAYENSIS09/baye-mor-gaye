# CONTRAT ACCESSIBILITÉ UNIVERSELLE (WCAG 2.2)

## 1. VISION ET ENGAGEMENT ACCESSIBILITÉ

Notre application se doit d'être utilisable par le plus grand nombre, indépendamment de leurs capacités physiques ou cognitives. L'accessibilité n'est pas une fonctionnalité optionnelle, mais une exigence fondamentale intégrée à chaque étape du développement. 

Nous nous alignons sur les directives **WCAG 2.2 (Web Content Accessibility Guidelines)**, visant à atteindre un niveau de conformité AA.

---

## 2. PRINCIPES DE L'ACCESSIBILITÉ (POUR CHAQUE MODULE)

### 2.1 Perceptible
Le contenu et les composants de l'interface utilisateur doivent être présentés aux utilisateurs de manière perceptible. 
*   **Alternative Textuelle :** Toutes les informations non textuelles (images, vidéos, audios) doivent avoir des alternatives textuelles appropriées (attribut `alt`, transcriptions, descriptions).
*   **Contenu Adaptable :** Le contenu doit pouvoir être présenté de différentes manières (par exemple, mise en page simplifiée) sans perte d'information ni de structure.
*   **Perceptible :** Les couleurs utilisées ne doivent pas être le seul moyen de transmettre une information ou d'indiquer une action. Utiliser des symboles, des formes, des tailles et des contrastes suffisants.

### 2.2 Opérable
Les composants de l'interface utilisateur et la navigation doivent être opérables.
*   **Navigation au Clavier :** Toutes les fonctionnalités interactives doivent être accessibles via le clavier, sans aucun dispositif de pointage.
*   **Ordre de Focus Logique :** Les éléments interactifs doivent apparaître dans un ordre de tabulation logique et prévisible.
*   **Indicateurs de Focus Visuels :** Un indicateur de focus clair (ex: contour bleu ou jaune) doit être visible lorsque l'utilisateur navigue au clavier.
*   **Temps Suffisant :** Les utilisateurs doivent avoir suffisamment de temps pour lire et utiliser le contenu. Éviter les limites de temps arbitraires ou permettre leur extension.
*   **Pas d'Épilepsie Induite :** Le contenu ne doit pas comporter de contenu clignotant ou pulsant plus de trois fois par seconde, sauf si ces éléments sont désactivables ou de faible contraste.

### 2.3 Compréhensible
Les informations et le fonctionnement de l'interface utilisateur doivent être compréhensibles.
*   **Lisibilité :** Le texte doit être lisible et compréhensible. Utiliser des langages simples, éviter le jargon excessif. La taille des polices doit être ajustable par l'utilisateur.
*   **Prévisibilité :** Les éléments de navigation doivent être cohérents sur l'ensemble du site ou de l'application. Le comportement des composants interactifs doit être prévisible.
*   **Aide à la Saisie :** Les formulaires doivent fournir une aide claire à la saisie (labels associés, messages d'erreur explicites, instructions).

### 2.4 Robuste
Le contenu doit être suffisamment robuste pour être interprété de manière fiable par une large gamme d'agents utilisateurs, y compris les technologies d'assistance.
*   **Utilisation de HTML Sémantique :** Utiliser les balises HTML appropriées pour leur rôle sémantique (ex: `<nav>`, `<button>`, `<h1>`-`<h6>`, `<main>`, `<aside>`, `<table>`).
*   **Attributs ARIA :** Utiliser judicieusement les rôles, propriétés et états ARIA (Accessible Rich Internet Applications) pour améliorer l'accessibilité des composants dynamiques ou personnalisés (ex: pour les modales, les menus déroulants, les onglets).

---

## 3. EXIGENCES SPÉCIFIQUES POUR NEXT.JS 16 ET LARAVEL

### 3.1 Next.js 16 (Frontend)
*   **Utilisation systématique des Labels pour les Formulaires :** Chaque champ de formulaire (`<input>`, `<select>`, `<textarea>`) doit être associé à un `<label>` via l'attribut `htmlFor` (ou `id`).
*   **Structure Sémantique des Pages :** Utiliser les balises `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` pour structurer le contenu de manière sémantique.
*   **Gestion du Focus :** Assurer qu'un indicateur de focus visible est présent sur tous les éléments interactifs lors de la navigation au clavier. Pour les composants clients interactifs, gérer le focus programmatiquement si nécessaire (ex: ouvrir une modale et déplacer le focus sur le premier élément interactif de la modale).
*   **Contenu Dynamique :** Utiliser des attributs ARIA (`aria-live`, `aria-atomic`) pour informer les lecteurs d'écran des changements importants dans le contenu (ex: mise à jour d'une zone de notification, ajout d'un élément dans un panier).

### 3.2 Laravel 11 (Backend & API)
*   Bien que Laravel soit un framework backend, il influence l'accessibilité via la génération de HTML et la structure des API.
*   **Génération de HTML Sémantique :** Si des vues Blade sont utilisées, elles doivent générer un HTML sémantique conforme aux standards.
*   **Contrats d'API (pour les données dynamiques) :** S'assurer que les informations renvoyées par l'API permettent au frontend de construire des interfaces accessibles (ex: fournir des descriptions textuelles pour les icônes, des labels pour les champs de formulaire dynamiques).

---

## 4. TESTS ET VÉRIFICATION DE L'ACCESSIBILITÉ

*   **Audit Manuel :** Tester la navigation au clavier (Tab, Shift+Tab, Enter, Space), vérifier les indicateurs de focus, et écouter le rendu via un lecteur d'écran (NVDA, JAWS, VoiceOver).
*   **Outils Automatisés :** Utiliser des extensions de navigateur (ex: Lighthouse, axe DevTools) pour identifier les problèmes d'accessibilité courants. Intégrer ces vérifications dans les pipelines CI/CD si possible.
