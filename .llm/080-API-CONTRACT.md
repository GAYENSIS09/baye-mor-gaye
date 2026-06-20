# CONTRAT SÉCURISÉ DES INTERFACES D'API (API CONTRACT)

## 1. STRATÉGIE DE COHÉRENCE FRONT-BACK

L'API (Application Programming Interface) est le pont de communication unique entre le frontend (Next.js 16) et le backend (Laravel 11). Pour garantir un fonctionnement fluide, sans supposition ni régression technique, l'API doit être gouvernée par un **contrat strict de données**. 

Aucun endpoint ne doit être développé sans une spécification préalable et validée de son schéma de requête et de réponse.

---

## 2. STRUCTURE DES URIs

### Sémantique des URIs
*   Utiliser exclusivement des noms de ressources au pluriel pour désigner des collections.
*   Ne jamais inclure d'actions ou de verbes dans l'URI.

| Méthode HTTP | URI | Action sémantique | Code de succès attendu |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Liste les publications (avec filtres, tri, pagination) | `200 OK` |
| `GET` | `/api/posts/{id}` | Récupère les détails d'une publication précise | `200 OK` |
| `POST` | `/api/posts` | Crée une nouvelle publication | `201 Created` |
| `PUT` | `/api/posts/{id}` | Remplace intégralement une publication existante | `200 OK` |
| `PATCH` | `/api/posts/{id}` | Modifie partiellement une publication | `200 OK` |
| `DELETE` | `/api/posts/{id}` | Supprime définitivement une publication | `204 No Content` |

---

## 3. STRUCTURE DES REQUÊTES (PAYLOADS) ET RESPONSES

### 3.1 Format des Réponses de Succès
Toutes les réponses renvoyées par le backend lors d'un traitement réussi doivent encapsuler la ressource dans un conteneur JSON unifié :

```json
{
  "success": true,
  "data": {
    "id": 102,
    "title": "Introduction à Next.js 16",
    "slug": "introduction-a-nextjs-16",
    "content": "Le contenu complet...",
    "status": "published"
  },
  "meta": {
    "timestamp": "2026-06-13T14:30:22Z"
  }
}
```

### 3.2 Format des Réponses d'Erreur (Structure Stable)
En cas d'échec de traitement (quel que soit le code d'erreur HTTP d'erreur généré), l'enveloppe doit obligatoirement suivre cette structure pour permettre un parsing homogène par le client frontend :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Les données du formulaire sont invalides.",
    "details": {
      "title": ["Le champ titre doit comporter au moins 5 caractères."],
      "slug": ["Le format du slug est invalide."]
    }
  }
}
```

*   `code` : Chaîne de caractères en majuscules avec tirets bas (`SNAKE_CASE`) représentant le type d'erreur technique (ex: `UNAUTHENTICATED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `VALIDATION_FAILED`, `INTERNAL_SERVER_ERROR`).
*   `message` : Description textuelle humanisée de l'erreur en langue française.
*   `details` : Objet facultatif répertoriant les messages d'erreurs fins (particulièrement utilisé pour les échecs de validation de formulaires 422, indexés par le nom des champs).

---

## 4. STANDARDISATION DES PARAMÈTRES DE REQUÊTE (QUERY PARAMETERS)

Pour toutes les listes de ressources (`GET /api/[ressource]`), les paramètres de requêtes doivent obéir aux formats normalisés suivants :

### 4.1 Pagination
*   `page` : Numéro de la page demandée (ex: `?page=3`).
*   `per_page` : Nombre d'éléments retournés par page (ex: `?per_page=15`). Limité côté serveur par une contrainte de sécurité maximale (ex: 100 maximum) pour éviter les attaques par déni de service de base de données.

### 4.2 Tri (Sorting)
*   `sort` : Spécifie le champ de tri et l'ordre (ex: `?sort=name` pour l'ordre ascendant, `?sort=-created_at` pour l'ordre descendant).

### 4.3 Filtrage (Filtering)
*   `filter` : Les filtres complexes doivent être groupés dans un dictionnaire sous la clé `filter` (ex: `?filter[status]=active&filter[category_id]=12`).

### 4.4 Recherche (Search)
*   `search` : Chaîne de caractères représentant le terme recherché (ex: `?search=recherche_textuelle`).

---

## 5. VALIDATION STRICTE DU CONTRAT ET DU SCHEMA (ZOD)

Côté Frontend, les retours d'API doivent être validés au runtime (particulièrement en environnement de développement ou de test) pour garantir le respect strict du contrat d'API.

```typescript
import { z } from 'zod';

// Définition du schéma d'API pour une publication
export const PostResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.number(),
    title: z.string().min(5),
    slug: z.string(),
    content: z.string(),
    status: z.enum(['draft', 'published', 'archived']),
  }),
  meta: z.object({
    timestamp: z.string().datetime(),
  }),
});

export type PostResponse = z.infer<typeof PostResponseSchema>;
```
Ce niveau de rigueur prémunit l'application contre les régressions backend impactant silencieusement l'affichage frontend.
