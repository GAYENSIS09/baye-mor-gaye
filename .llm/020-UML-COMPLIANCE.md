# CONFORMITÉ ET AUDIT UML OBLIGATOIRE

## 1. PROTOCOLE D'AUDIT UML SYSTÉMATIQUE

Avant d'écrire ou de modifier la moindre ligne de code (que ce soit pour le frontend, le backend, les schémas de base de données ou les contrats d'API), le modèle de langage **doit impérativement exécuter un audit complet de conformité UML**. 

Cette étape permet de garantir que le système développé reste en parfaite adéquation avec la modélisation métier globale et d'éviter les dérives d'implémentation locale.

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│   Lire tous les .wsd   │ ───> │ Construire le graphe   │ ───> │ Extraire la matrice    │
│  (Cas d'utilisation,   │      │    UML interne de     │      │   Acteurs / Permissions│
│  Séquence, Classes)    │      │      composants        │      │       / Endpoints      │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
                                                                            │
┌────────────────────────┐      ┌────────────────────────┐                  │
│  Rapport d'Audit UML   │ <─── │ Détecter les écarts et │ <────────────────┘
│ (Incohérences, Trous)  │      │   les hallucinations   │
└────────────────────────┘      └────────────────────────┘
```

---

## 2. LES 5 ÉTAPES DE L'AUDIT UML

Le processus d'audit obligatoire se décompose en cinq étapes analytiques séquentielles :

### Étape 1 : Lecture exhaustive des spécifications UML
Le modèle doit rechercher et lire tous les fichiers avec l'extension `.wsd` ou `.puml` présents dans le projet (généralement situés dans un dossier `/uml`, `/docs/uml`, ou à la racine). 

### Étape 2 : Reconstruction du graphe de dépendances système
Le modèle doit construire mentalement et formuler un graphe unifié comprenant :
*   Les **Acteurs** et leurs liens d'héritage.
*   Les **Cas d'Utilisation** (Use Cases) et leurs relations (`<<include>>`, `<<extend>>`).
*   Les **Entités de Classe** avec leurs attributs, méthodes, multiplicités et associations (composition, agrégation, héritage).
*   Les **États** d'un objet et les **Transitions** autorisées.
*   La cinématique d'appels définie par les diagrammes de **Séquence**.

### Étape 3 : Extraction de la Matrice Fonctionnelle Réelle
Le modèle doit extraire et lister explicitement :
1.  **Les Rôles & Permissions :** Qui a le droit de faire quoi.
2.  **La Matrice CRUD :** Quelles entités sont lues, créées, modifiées ou supprimées par quel cas d'utilisation et quel acteur.
3.  **Les Flux de Séquence :** L'enchaînement exact des appels d'API requis pour réaliser un scénario.

### Étape 4 : Analyse de Cohérence et Détection d'Écarts
Le modèle doit confronter le code existant et les intentions de développement avec le graphe UML extrait afin d'identifier :
*   **Les Incohérences :** Divergence de nommage de champs, types discordants, flux d'appels incorrects.
*   **Les Redondances :** Fonctionnalités ou endpoints doublonnés.
*   **Les Omissions (Trous de modélisation) :** Cas d'utilisation décrits dans l'UML mais absents du code, ou inversement, code implémentant une logique métier inexistante dans l'UML.
*   **Les Fonctionnalités Orphelines :** Composants, pages, routes ou tables SQL inutilisés ou ne se rattachant à aucun cas d'utilisation UML formalisé.

### Étape 5 : Production du Rapport d'Audit UML
Avant l'écriture de code, le modèle doit publier un rapport synthétique d'audit sous la forme suivante (à intégrer dans le rapport d'auto-audit global décrit dans `160-AUTO-AUDIT.md`) :

```markdown
### 📝 RAPPORT D'CONFORMITÉ UML (EXTRAIT)

- **Fichiers UML analysés :** [liste des fichiers .wsd / .puml lus]
- **Cas d'utilisation ciblés :** [ex: UC-102 : Authentification Utilisateur]
- **Acteurs impliqués :** [ex: Visiteur, Administrateur]
- **Matrice de conformité :**
  | Concept UML | Implémentation Code | Statut | Commentaire |
  | :--- | :--- | :--- | :--- |
  | Entité `User` | Modèle `App\Models\User` | ✅ Conforme | Attributs et relations OK |
  | Transition `validate` | Méthode `approve()` | ⚠️ Écart | Nom différent dans le code |
- **Écarts ou anomalies détectés :** [Décrire tout écart ou anomalie, ou "Aucune anomalie détectée"]
```

---

## 3. RÈGLES DE CONDUITE EN CAS DE NON-CONFORMITÉ

### RÈGLE D'OR 1 : PAS DE MODIFICATION SILENCIEUSE DU CODE POUR SE CONFORMER À UN UML FAUX
Si un diagramme UML présente une faille de logique évidente (par exemple, un problème de sécurité majeur, une incohérence fonctionnelle, une boucle infinie dans un diagramme de séquence), le modèle **ne doit pas** l'implémenter aveuglément ni corriger le code de manière non coordonnée. 

Le modèle doit :
1. Émettre une alerte claire dans son rapport de conformité.
2. Signaler l'incohérence via le protocole "MISSING INFORMATION" de la constitution.
3. Proposer la correction du fichier UML `.wsd` correspondant en même temps que la correction du code.

### RÈGLE D'OR 2 : SYNCHRONISATION ABSOLUE DES VERSIONS
Tout ajout de fonctionnalité ou modification d'une règle métier doit se traduire par une mise à jour concomitante :
1.  Du diagramme UML (`.wsd`).
2.  Des contrats d'API (`080-API-CONTRACT.md`).
3.  De la base de données (`090-DATABASE.md`).
4.  Du code Backend et Frontend.
