# PROTOCOLE DE VALIDATION FINALE (PREUVE DE TRAVAIL)

## 1. NATURE DE LA VALIDATION FINALE

La validation finale n'est pas une simple déclaration d'intention, mais une **Preuve de Travail (Proof of Work)**. Le modèle ne peut pas clore une tâche en disant "Le code a été écrit", il doit prouver que le code est fonctionnel, performant et conforme.

---

## 2. ÉTAPES DE VALIDATION OBLIGATOIRES

Le modèle doit fournir les preuves factuelles pour chaque étape :

### Étape 1 : Preuve de Compilation & Typage
*   **Action :** Exécuter `npm run build` ou `tsc --noEmit`.
*   **Preuve :** Copier-coller le résultat du terminal confirmant l'absence d'erreurs de type.

### Étape 2 : Preuve de Test (Rapport de Test)
*   **Action :** Lancer `php artisan test` et `npm run test`.
*   **Preuve :** Fournir le résumé des tests exécutés (ex: `Tests: 12 passed, 0 failed`).

### Étape 3 : Preuve de Qualité (Linting)
*   **Action :** Exécuter `vendor/bin/pint --test` et `npm run lint`.
*   **Preuve :** Confirmer que le code est conforme aux standards de formatage.

### Étape 4 : Preuve de Performance (Audit SQL)
*   **Action :** Analyser les requêtes via Debugbar ou logs SQL.
*   **Preuve :** Affirmer explicitement : "Aucune requête N+1 détectée pour l'endpoint X, nombre de requêtes total : Y".

### Étape 5 : Preuve de Conformité UML
*   **Action :** Comparer le code produit avec le fichier `.wsd`.
*   **Preuve :** Confirmer que les noms de méthodes et de classes correspondent exactement au diagramme.

---

## 3. FORMAT DU RAPPORT DE VALIDATION (LIVRABLE DE CLÔTURE)

C'est le document final qui valide la livraison.

```markdown
################################################################################
#                         RAPPORT DE VALIDATION FINALE                         #
################################################################################
# 🧪 RÉSULTATS DES TESTS :
# - Unitaires/Intégration : [✅ PASS - 0 fail]
# - E2E : [✅ PASS / ➖ N/A]
#
# 🛠️ QUALITÉ ET TYPAGE :
# - TSC / PHPStan : [✅ Zéro erreur]
# - Pint / ESLint : [✅ Conforme]
#
# ⚡ PERFORMANCE & SQL :
# - N+1 : [✅ Aucun]
# - Req total : [X requêtes pour l'action Y]
#
# 📐 CONFORMITÉ UML : [✅ Synchronisé avec fichier X.wsd]
#
# 🏁 CONCLUSION : [✅ CODE VALIDÉ ET PRÊT POUR DÉPLOIEMENT]
################################################################################
```
