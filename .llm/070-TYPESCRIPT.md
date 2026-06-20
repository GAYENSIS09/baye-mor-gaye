# CONTRAT ET STANDARDS SÉCURISÉS TYPESCRIPT

## 1. STRATÉGIE DE TYPAGE ET SÉCURITÉ DU CODE

TypeScript est le langage pivot du frontend et de la couche d'intégration de notre système. Il ne doit pas être considéré comme une simple surcouche de documentation visuelle, mais comme un **outil de vérification formelle de la cohérence logique du code**. 

Un typage robuste permet de capturer 90 % des erreurs d'intégration dès la phase de compilation, éliminant ainsi les dysfonctionnements silencieux en production.

---

## 2. EXIGENCES STRICTES DE CONFIGURATION (`tsconfig.json`)

Le compilateur TypeScript doit être configuré avec les drapeaux de sécurité les plus rigoureux. Aucune dérogation n'est tolérée dans le fichier de configuration `tsconfig.json` du projet :

```json
{
  "compilerOptions": {
    "strict": true,                           /* Active toutes les vérifications strictes de type */
    "noImplicitAny": true,                    /* Lève une erreur sur les expressions avec un type 'any' implicite */
    "strictNullChecks": true,                 /* Prend en compte 'null' et 'undefined' lors du contrôle des types */
    "strictFunctionTypes": true,              /* Vérification stricte des signatures de fonctions */
    "noImplicitThis": true,                   /* Lève une erreur si 'this' a un type 'any' implicite */
    "alwaysStrict": true,                     /* Analyse en mode strict et émet "use strict" pour chaque fichier */
    "noUnusedLocals": true,                   /* Rapporte les erreurs sur les variables locales inutilisées */
    "noUnusedParameters": true,               /* Rapporte les erreurs sur les paramètres de fonction inutilisés */
    "noImplicitReturns": true,                /* Lève une erreur si toutes les branches d'une fonction ne renvoient pas de valeur */
    "noFallthroughCasesInSwitch": true,       /* Signale les erreurs pour les cas de switch qui s'enchaînent sans break */
    "exactOptionalPropertyTypes": true,       /* Empêche d'assigner 'undefined' à des propriétés optionnelles qui ne le permettent pas */
    "noPropertyAccessFromIndexSignature": true /* Force l'utilisation de la syntaxe de crochet pour les propriétés dynamiques */
  }
}
```

---

## 3. INTERDICTION SANS APPEL DE 'any'

### 3.1 Règle Absolue
L'utilisation du mot-clé `any` est **strictement interdite** dans tout le projet (fichiers `.ts`, `.tsx`). L'utilisation de `any` désactive complètement la sécurité de TypeScript et réintroduit les risques inhérents au JavaScript dynamique.

### 3.2 Alternatives Sécurisées
*   **Données Inconnues (ex: réponses réseau brutes) :** Utiliser systématiquement le type `unknown`. Contrairement à `any`, un type `unknown` ne peut pas être manipulé ou assigné sans avoir subi au préalable une opération de rétrécissement de type (Type Narrowing) ou de validation de schéma.
*   **Validation au Runtime :** Utiliser des bibliothèques de schéma comme **Zod** pour valider et typer simultanément les flux entrants :
    ```typescript
    import { z } from 'zod';

    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    });

    type User = z.infer<typeof UserSchema>; // Génère automatiquement le type TS conforme
    ```

---

## 4. CONTRATS DE DTO ET INTERFACES SHARED

Les contrats de données (DTOs d'entrée et de sortie) entre Next.js et Laravel doivent être modélisés de manière rigoureuse pour éviter tout déphasage.

### 4.1 Modélisation des Structures API
Chaque ressource d'API doit posséder son interface TypeScript correspondante. Les propriétés doivent correspondre de manière exacte aux champs exportés par les `JsonResource` de Laravel (voir `030-BACKEND-CONTRACT.md`).

```typescript
// types/api/user.ts
export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// Response unifiée
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    currentPage?: number;
    lastPage?: number;
    total?: number;
  };
}
```

### 4.2 Utilisation des Types Utilitaires (Utility Types)
S'appuyer sur les utilitaires génériques de TypeScript pour dériver des types d'écriture ou de modification sans dupliquer les interfaces :
*   `Omit<T, K>` : Pour enlever des attributs système d'une interface (ex: `Omit<UserDTO, 'id' | 'createdAt' | 'updatedAt'>` pour le payload de création).
*   `Partial<T>` : Pour rendre toutes les propriétés optionnelles (particulièrement adapté pour les requêtes de type `PATCH`).
*   `Readonly<T>` : Pour immuniser un objet contre les mutations accidentelles de l'état applicatif.

---

## 5. TYPE NARROWING (RÉTRÉCISSEMENT DE TYPE) ET GUARDES

Pour garantir la sécurité de l'exécution, le développeur doit employer des mécanismes de contrôle stricts avant de manipuler des variables à types multiples :

*   **Opérateurs natifs :** Utiliser `typeof`, `instanceof`, ou `in` pour valider l'existence d'une clé dans un objet.
*   **Type Guards personnalisés (Prédicats de Type) :** Créer des fonctions de validation réutilisables pour certifier la structure d'un objet :
    ```typescript
    function isUserDTO(data: unknown): data is UserDTO {
      return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'email' in data &&
        'role' in data
      );
    }
    ```
*   **Unions Discriminées (Discriminated Unions) :** Idéal pour modéliser des états d'interfaces mutuellement exclusifs (ex: états de requêtes HTTP) :
    ```typescript
    type RequestState<T> =
      | { status: 'idle' }
      | { status: 'loading' }
      | { status: 'success'; data: T }
      | { status: 'error'; error: Error };
    ```
