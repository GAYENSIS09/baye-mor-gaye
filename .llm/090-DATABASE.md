# CONTRAT SÉCURISÉ DES SCHÉMAS ET DE LA BASE DE DONNÉES

## 1. STRATÉGIE ET GOUVERNANCE DES DONNÉES

La base de données (générée via des **migrations Laravel 11** et opérée sous **MySQL/PostgreSQL**) est le coffre-fort de notre système. Les schémas de données doivent être conçus pour garantir l'intégrité, l'absence de redondance et des performances optimales constantes (grâce à une indexation méthodique). 

Toute modification de la base doit passer obligatoirement par des migrations documentées, auditables et réversibles.

```
                  ┌─────────────────────────────────────┐
                  │          Migration Laravel          │
                  └─────────────────────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    MySQL / PostgreSQL Schema        │
                  │   (Tables, Foreign Keys, Indexes)   │
                  └─────────────────────────────────────┘
                     │                             │
                     ▼                             ▼
         ┌───────────────────────┐     ┌───────────────────────┐
         │     Transactions      │     │  Indexation de Tri /  │
         │  (Garantie d'Atomicité)│     │     Filtre / Jointure │
         └───────────────────────┘     └───────────────────────┘
```

---

## 2. CONVENTIONS DE NOMMAGE ET TYPES DE COLONNES

### 2.1 Règles de Nommage Uniformes
*   **Tables :** En anglais, au pluriel, en casse de serpent (`snake_case`) (ex: `posts`, `user_profiles`, `categories`).
*   **Tables pivots (Many-to-Many) :** Singulier, ordre alphabétique des deux tables concernées, séparé par un trait de soulignement (ex: `category_post`).
*   **Colonnes :** En anglais, en casse de serpent (`snake_case`) (ex: `first_name`, `email_verified_at`).
*   **Clés Étrangères :** Nom de la table ciblée au singulier suivi de `_id` (ex: `user_id` lié à la table `users`).

### 2.2 Types de Données Standards et Sécurisés
*   **Identifiants (Clés Primaires) :** Utiliser systématiquement de grands entiers non signés incrémentaux (`bigIncrements`) ou, pour les ressources exposées publiquement côté frontend, des identifiants uniques universels (**UUID**) pour prévenir le scraping d'ID séquentiels.
*   **Dates d'Audit :** Chaque table doit inclure les marqueurs temporels standard de création et de modification (`created_at`, `updated_at`).
*   **Suppression Logique (Soft Deletes) :** Pour les données métier sensibles qui ne doivent pas être détruites physiquement (ex: commandes, factures, profils), utiliser le trait `SoftDeletes` qui ajoute la colonne nullable `deleted_at`.

---

## 3. INDEXATION ET PERFORMANCES DES REQUÊTES SQL

Une mauvaise indexation est la première cause d'effondrement des performances d'un système lors de sa montée en charge.

### 3.1 Règles d'Indexation Systématique (Obligatoires)
*   **Clés Étrangères (Foreign Keys) :** Toutes les colonnes de clé étrangère doivent posséder un index simple. Laravel s'en charge automatiquement lors de la définition de contraintes de clé étrangère, mais cela doit être expressément vérifié.
*   **Colonnes de Filtrage :** Toute colonne soumise à des clauses de sélection fréquentes (`WHERE`) doit être indexée (ex: `status`, `type`).
*   **Colonnes de Tri :** Toute colonne servant régulièrement à ordonner les données (`ORDER BY`) doit posséder un index (ex: `created_at`, `published_at`).
*   **Index Uniques :** Les colonnes devant contenir des valeurs uniques (ex: `email`, `slug`) doivent être déclarées uniques au niveau de la base, ce qui crée automatiquement un index unique.
*   **Index Composés :** Lorsque des requêtes filtrent systématiquement les données sur plusieurs critères conjoints (ex: `WHERE user_id = ? AND status = ?`), créer un index composé sur ces colonnes :
    ```php
    $table->index(['user_id', 'status']);
    ```

---

## 4. INTÉGRITÉ DE DONNÉES ET CLÉS ÉTRANGÈRES (FOREIGN KEYS)

Toutes les relations entre tables doivent être matérialisées par des contraintes de clé étrangère physiques au niveau SQL. L'utilisation d'identifiants orphelins (clés logiques simples sans contrainte SQL) est strictement interdite.

### 4.1 Stratégies de Cascade en Base de Données
Chaque clé étrangère doit explicitement définir son comportement lors d'une suppression d'un enregistrement parent :
*   `cascadeOnDelete()` : Supprime automatiquement les enfants si le parent est supprimé (à utiliser pour les entités dépendantes fortes, comme les lignes d'une facture liée à une facture parent).
*   `nullOnDelete()` : Met à jour la colonne enfant à `NULL` si le parent est supprimé (la colonne doit être déclarée `nullable()`).
*   `restrictOnDelete()` (ou comportement par défaut) : Interdit la suppression du parent si des enfants y font référence (sécurité maximale pour les données hautement sensibles comme les clients ou les comptes bancaires).

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Indexé et cascade auto
    $table->string('title');
    $table->string('slug')->unique(); // Index unique auto
    $table->text('content');
    $table->string('status')->index(); // Index de filtre explicite
    $table->timestamps();
    $table->softDeletes(); // deleted_at nullable
});
```

---

## 5. ATOMICITÉ ET TRANSACTIONS DE BASE DE DONNÉES

Toute action d'écriture ou mise à jour logique qui nécessite des requêtes SQL sur plusieurs tables ou plusieurs lignes différentes doit s'exécuter au sein d'une **transaction SQL**.

Cela garantit que s'il y a un échec à n'importe quelle étape du processus, l'intégralité des requêtes de la transaction sera annulée (`rollback`), évitant de laisser la base de données dans un état corrompu ou désynchronisé.

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () use ($dto) {
    // 1. Création de la commande
    $order = Order::create([...]);
    
    // 2. Déduction des stocks
    foreach ($dto->items as $item) {
        $product = Product::findOrFail($item['product_id']);
        $product->decrementStock($item['quantity']);
        
        // 3. Liaison de l'item à la commande
        $order->items()->create([...]);
    }
});
```
