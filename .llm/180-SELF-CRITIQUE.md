# PROTOCOLE D'AUTO-CRITIQUE ET DE DETTE TECHNIQUE

## 1. OBJECTIF DE L'AUTO-CRITIQUE

L'auto-critique est une phase de recul nécessaire après l'implémentation (ou lors de la phase de conception) pour identifier les compromis effectués, les zones de fragilité potentielle et la dette technique introduite. 

Aucun système n'est parfait dès le premier jet. L'honnêteté technique sur les faiblesses du code est ce qui permet d'orienter les futures refactorisations et de maintenir la santé du projet à long terme.

---

## 2. GRILLE D'ÉVALUATION D'AUTO-CRITIQUE

Le modèle doit se poser les questions suivantes et consigner ses observations :

### 2.1 Analyse de la Dette Technique
*   **Complexité Cyclomatique :** Y a-t-il des fonctions ou des composants trop complexes ou trop longs qui devraient être découpés ?
*   **Couplage :** Le code est-il trop dépendant d'une implémentation concrète ou d'une bibliothèque tierce spécifique ?
*   **Duplication (DRY) :** Ai-je copié-collé de la logique qui aurait dû être factorisée ? Si oui, pourquoi ne l'ai-je pas fait (urgence, manque de contexte) ?

### 2.2 Analyse de la Robustesse et des Angles Morts
*   **Cas Limites (Edge Cases) :** Ai-je géré les entrées inattendues, les valeurs nulles, ou les timeouts réseau ?
*   **Vérification du Catalogue 200 :** 
    *   L'état survit-il à un refresh (F5) ?
    *   Y a-t-il un risque d'erreur d'hydratation ?
    *   Les requêtes asynchrones sont-elles annulables ?
    *   Les timers/listeners sont-ils nettoyés ?
*   **Gestion des Erreurs :** Les exceptions sont-elles capturées de manière granulaire ou ai-je utilisé un `catch` trop générique ?


### 2.3 Analyse de l'Évolutivité
*   **Flexibilité :** Sera-t-il difficile de changer de base de données, de bibliothèque de validation ou de fournisseur d'authentification à l'avenir ?
*   **Lisibilité :** Un autre développeur (ou moi-même dans 6 mois) comprendra-t-il l'intention derrière ce code complexe sans commentaires excessifs ?

---

## 3. FORMAT DU RAPPORT D'AUTO-CRITIQUE

Ce rapport doit être produit après l'implémentation, ou intégré au rapport d'auto-audit si des faiblesses sont anticipées.

```markdown
################################################################################
#                         RAPPORT D'AUTO-CRITIQUE TECHNIQUE                    #
################################################################################
# COMPROMIS EFFECTUÉS :
# - [Compromis 1 : ex: Validation simplifiée pour ce prototype]
# - [Compromis 2 : ex: Pas de cache implémenté sur cet endpoint pour l'instant]
#
# DETTE TECHNIQUE IDENTIFIÉE :
# - [Dette 1 : ex: Logique métier présente dans le contrôleur (à déplacer dans un UseCase)]
# - [Dette 2 : ex: Absence de tests unitaires sur le calcul de TVA]
#
# OPPORTUNITÉS D'OPTIMISATION :
# - [Optimisation 1 : ex: Utiliser Redis pour mettre en cache les résultats de recherche]
# - [Optimisation 2 : ex: Dynamic import pour le composant de graphique lourd]
#
# NOTE DE CONFIANCE (0-10) : [Note / 10]
# JUSTIFICATION : [Pourquoi cette note ?]
################################################################################
```

L'identification d'une dette technique n'est pas un échec, c'est une preuve de maturité d'ingénierie. Cacher la dette technique est, en revanche, une faute grave contre le système.
