# LISTE DE CONTRÔLE DE GOUVERNANCE (CHECKLIST)

## 1. OBJET DE LA CHECKLIST

Cette liste de contrôle regroupe les points de vigilance critiques issus de l'expertise de niveau Staff/Principal Engineer. Elle doit être consultée lors de l'auto-audit et de la validation finale pour s'assurer qu'aucun détail technique ou architectural n'a été omis.

---

## 2. ARCHITECTURE ET DESIGN (SOLID, DDD, CLEAN)

- [ ] Est-ce que la logique métier est isolée des détails d'infrastructure ?
- [ ] Le principe de responsabilité unique (SRP) est-il respecté par chaque classe/composant ?
- [ ] Les dépendances sont-elles injectées via des interfaces plutôt que des classes concrètes (DIP) ?
- [ ] Y a-t-il des fuites de logique backend dans le frontend ?
- [ ] Le code évite-t-il la sur-ingénierie (YAGNI) ?
- [ ] Les noms de variables, fonctions et classes sont-ils explicites et en anglais ?

## 3. BACKEND (LARAVEL 11, SQL, SECURITY)

- [ ] Les modèles Eloquent utilisent-ils `$fillable` (pas de `$guarded = []`) ?
- [ ] Le mode Strict d'Eloquent est-il activé et respecté ?
- [ ] Chaque endpoint est-il protégé par une **Policy** et un middleware d'authentification ?
- [ ] Les requêtes SQL sont-elles immunisées contre les injections (pas de `DB::raw` avec variables) ?
- [ ] Toutes les relations sont-elles chargées via **Eager Loading** (`with()`) pour éviter le N+1 ?
- [ ] Les colonnes de filtre, tri et clés étrangères sont-elles indexées ?
- [ ] Les traitements longs sont-ils déportés dans des **Jobs** asynchrones ?
- [ ] Les données sensibles sont-elles cryptées au repos (`encrypted` casts) ?
- [ ] Les sorties d'API utilisent-elles des **JsonResources** (pas de modèles bruts) ?

## 4. FRONTEND (NEXT.JS 16, TS, REACT)

- [ ] Le typage TypeScript est-il strict (aucun `any`, `unknown` validé via Zod) ?
- [ ] La frontière entre Server Components et Client Components est-elle optimale ?
- [ ] L'hydratation est-elle protégée contre les erreurs (pas d'API navigateur au premier rendu) ?
- [ ] Les images utilisent-elles `next/image` avec dimensions et priorité si nécessaire ?
- [ ] Les polices sont-elles chargées via `next/font` ?
- [ ] Les formulaires sont-ils validés côté client (Zod) ET côté serveur ?
- [ ] Les états de chargement (**Skeletons**) et les états vides sont-ils implémentés ?
- [ ] Les actions d'écriture utilisent-elles des **Optimistic Updates** lorsque c'est pertinent ?

## 5. SÉCURITÉ ET ACCESSIBILITÉ (OWASP, WCAG)

- [ ] Les en-têtes de sécurité (CORS, CSP) sont-ils configurés ?
- [ ] Les entrées utilisateur sont-elles nettoyées pour prévenir les failles XSS ?
- [ ] Le balisage HTML est-il sémantique (`<main>`, `<nav>`, `<h1>`, etc.) ?
- [ ] Chaque champ de formulaire a-t-il un label associé et des attributs ARIA ?
- [ ] La navigation au clavier est-elle possible sur tous les éléments interactifs ?
- [ ] Le contraste des couleurs est-il suffisant (WCAG AA) ?

## 6. PERFORMANCE ET SEO

- [ ] Le TTFB est-il sous les 400ms ?
- [ ] Le bundle JavaScript est-il optimisé (dynamic imports pour les composants lourds) ?
- [ ] Les méta-données SEO (title, description) sont-elles dynamiques et uniques ?
- [ ] Les données structurées (JSON-LD) sont-elles présentes pour les contenus clés ?
- [ ] Les images ont-elles des attributs `alt` descriptifs ?

## 7. QUALITÉ ET VALIDATION (TESTS)

- [ ] Le code est-il passé par `Laravel Pint` et `ESLint/Prettier` ?
- [ ] La suite de tests unitaires et d'intégration passe-t-elle à 100% ?
- [ ] La couverture de tests sur la logique critique est-elle satisfaisante ?
- [ ] Les logs d'erreurs sont-ils propres et informatifs ?
- [ ] Le rapport d'auto-critique (`180-SELF-CRITIQUE.md`) a-t-il été rédigé ?
