# CONSTITUTION TECHNIQUE ET CADRE DE GOUVERNANCE SÉCURISÉ (v1.0.0)

## 0. PRÉAMBULE ET VISION GLOBALE

Le présent document constitue la **Constitution Technique Suprême** (Cahier de Gouvernance) régissant l'intégralité du cycle de vie du système logiciel. 

### 0.1 Le Problème du "Raisonnement Local"
Le principal défaut des modèles de langage (LLM) n'est pas leur capacité d'écriture locale de code, mais leur propension à résoudre des problèmes de manière isolée sans reconstruire spontanément un **modèle mental global et cohérent** du système. Ce document a pour but d'éradiquer ce comportement en imposant un cadre de réflexion holistique obligatoire avant toute ligne de code produite.

### 0.2 Mode d'Emploi du Framework pour le LLM
L'utilisation de ce framework n'est pas consultative, elle est **impérative**. Pour chaque interaction :
1. **L'Ancre :** Consulter `000-CONSTITUTION.md` pour rappeler les règles d'or.
2. **L'Audit :** Exécuter strictement le processus de `160-AUTO-AUDIT.md`.
3. **Le Contrat :** Vérifier la conformité avec les contrats (`030`, `040`, `080`).
4. **La Preuve :** Ne jamais affirmer "C'est fait" sans fournir le rapport de `190-FINAL-VALIDATION.md`.

Chaque décision d'implémentation doit être justifiée par une conformité stricte avec les diagrammes UML, l'architecture globale, la sécurité, les performances et l'accessibilité.


---

## 1. CARTOGRAPHIE DES MODULES DE GOUVERNANCE (.llm/)

Le système de gouvernance est segmenté en 20 modules de contrôle stricts, chacun détenant une autorité souveraine sur son domaine respectif :

```
.llm/
├── 000-CONSTITUTION.md            # Vision globale, règles d'or et protocoles d'erreur
├── 010-DEVELOPMENT-PHILOSOPHY.md  # Principes d'architecture (Clean Arch, DDD, CQRS, SOLID)
├── 020-UML-COMPLIANCE.md          # Audit UML obligatoire et traçabilité des cas d'utilisation
├── 030-BACKEND-CONTRACT.md        # Règles d'implémentation Laravel 11, Sanctum, Horizon, Echo
├── 040-FRONTEND-CONTRACT.md       # Règles Next.js 16 App Router, états de chargement et offline
├── 050-NEXTJS-16.md               # Standards avancés Next.js 16, RSC, Suspense, Streaming, etc.
├── 060-LARAVEL-11.md              # Standards avancés Laravel 11, Policies, Queues, Redis, etc.
├── 070-TYPESCRIPT.md              # Typage strict, interdiction de 'any', contrats de types partagés
├── 080-API-CONTRACT.md            # Spécification et validation stricte des requêtes/réponses (JSON)
├── 090-DATABASE.md                # Règles de modélisation, indexation, migrations et transactions
├── 100-PERFORMANCE.md             # Analyse proactive de la lenteur (N+1, cache, SSR, bundle sizes)
├── 110-SECURITY.md                # Sécurité absolue, XSS, CSRF, injections, cryptage, OWASP Top 10
├── 120-ACCESSIBILITY.md           # Accessibilité universelle (WCAG 2.2, ARIA, navigation clavier)
├── 130-SEO.md                     # Optimisation SEO, métadonnées dynamiques, JSON-LD, performances
├── 140-UX.md                      # Principes d'interface, feedback utilisateur, skeleton, toasts, empty
├── 150-CODE-QUALITY.md            # Standards de code, tests automatisés, linting, revue de code
├── 160-AUTO-AUDIT.md              # Processus d'auto-audit obligatoire avant toute implémentation
├── 170-CHECKLIST.md               # Liste de contrôle de 1000 points (Staff/Principal Engineer)
├── 180-SELF-CRITIQUE.md           # Protocole d'auto-critique et d'identification de dette technique
└── 190-FINAL-VALIDATION.md        # Processus de validation finale post-implémentation
```

---

## 2. INTERDICTION ABSOLUE : SÉCURISATION AVANT IMPLÉMENTATION

### RÈGLE D'OR : AUCUN CODE SANS CONTEXTE COMPLET

Il est strictement interdit de développer un écran, un composant frontend ou un endpoint backend sans avoir préalablement identifié, documenté et validé les 17 éléments cardinaux suivants :

1.  **Les Acteurs :** Quels rôles système interagissent avec cette fonctionnalité ?
2.  **Les Permissions :** Quelles permissions fines (habilitations) sont requises ?
3.  **Les Cas d'Utilisation :** Quels use cases UML sont touchés ou créés ?
4.  **Les Diagrammes UML :** Quels fichiers `.wsd` (PlantUML) décrivent cette logique ?
5.  **Les Endpoints :** Quelles routes précises (URI, verbes HTTP) sont requises ou impactées ?
6.  **Les DTO (Data Transfer Objects) :** Quelle est la structure exacte des données d'entrée/sortie ?
7.  **Les Modèles :** Quels modèles de données (tables SQL, relations Eloquent) sont concernés ?
8.  **Les Règles Métier :** Quelles contraintes fonctionnelles doivent être appliquées ?
9.  **Les Validations :** Quelles sont les règles de validation strictes (front et back) ?
10. **Les Contraintes de Sécurité :** Quelles sont les menaces potentielles et comment sont-elles atténuées (Sanctum, Policies, sanitization) ?
11. **Les Performances Attendues :** Quels sont les temps de réponse visés et les stratégies de cache ?
12. **Les États de Chargement :** Skeletons, indicateurs de progression, transitions fluides.
13. **Les Erreurs :** Gestion unifiée des exceptions, codes d'erreur HTTP, messages conviviaux.
14. **Les États Vides (Empty States) :** Qu'affiche l'écran s'il n'y a pas de données ?
15. **Les Notifications :** Toasts, alertes temps réel (Laravel Echo), courriels, push.
16. **Les Comportements Offline :** Mode lecture seule, synchronisation, file d'attente locale.
17. **Les Comportements Temps Réel :** Canaux WebSockets (publics, privés, de présence).

---

## 3. PROTOCOLE ANTI-HALLUCINATION : "MISSING INFORMATION"

### INTERDICTION FORMELLE DE SUPPOSER OU D'INVENTER

Le modèle de langage a interdiction absolue d'inventer, d'estimer ou de supposer l'existence de :
*   Endpoints d'API
*   Champs de formulaires ou de tables SQL
*   Propriétés d'objets ou DTO
*   Routes frontend ou backend
*   Permissions, rôles ou politiques d'autorisation
*   Modèles ou relations de base de données
*   Diagrammes UML ou flux fonctionnels
*   Colonnes, index ou clés de base de données
*   Enums ou règles de flux métier

Tout élément de code ou de conception doit s'appuyer exclusivement sur une source de vérité existante et prouvable dans le projet (fichiers `.wsd`, base de données existante, code backend/frontend validé).

### LE SIGNAL DE BLOCAGE : "MISSING INFORMATION"

Si une information requise pour l'application des règles d'or est manquante, obsolète ou contradictoire, le modèle **doit immédiatement arrêter toute génération de code** et émettre le signalement standardisé suivant :

```
################################################################################
#                             MISSING INFORMATION                              #
################################################################################
# LOG DE BLOCAGE TECHNIQUE : [Nom de la fonctionnalité]
#
# MOTIF DU BLOCAGE : [Expliquer de manière détaillée ce qui manque ou bloque]
#
# SOURCES VÉRIFIÉES :
# - [Fichier/Chemin checked 1]
# - [Fichier/Chemin checked 2]
#
# QUESTIONS DE CLARIFICATION POUR DÉBLOCAGE :
# 1. [Question précise sur la donnée manquante]
# 2. [Question précise sur la règle métier ou l'endpoint]
#
# PROPOSITION DE CONTOURNE / HYPOTHÈSE SÉCURISÉE :
# [Proposer une solution propre respectant l'architecture en attendant validation]
################################################################################
```

Aucun contournement "silencieux" n'est toléré. L'honnêteté technique du LLM est le gage de la stabilité du système.

---

## 4. CYCLE D'EXÉCUTION DU LLM (LES 5 COMMANDEMENTS)

À chaque interaction, le modèle de langage doit suivre ce protocole strict :

1.  **Phase d'Audit Préalable :** Exécuter le protocole du fichier `160-AUTO-AUDIT.md`.
2.  **Validation Mentale :** Reconstruire le graphe de dépendance et de conformité UML (`020-UML-COMPLIANCE.md`).
3.  **Planification & Auto-critique :** Rédiger un plan de modifications, le soumettre à la grille d'évaluation de `180-SELF-CRITIQUE.md`.
4.  **Implémentation Rigoureuse :** Écrire le code en appliquant les contrats backend (`030-BACKEND-CONTRACT.md`), frontend (`040-FRONTEND-CONTRACT.md`), TypeScript (`070-TYPESCRIPT.md`) et les guides spécifiques aux frameworks (`050-NEXTJS-16.md`, `060-LARAVEL-11.md`).
5.  **Validation Finale :** Effectuer la vérification automatisée et les tests décrits dans `190-FINAL-VALIDATION.md`.

---

Ce document est la clé de voûte de notre ingénierie logicielle. Respectez-le à la lettre.
