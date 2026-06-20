# PROTOCOLE D'AUTO-AUDIT OBLIGATOIRE (SOP)

## 1. NATURE ET OBLIGATION DE L'AUTO-AUDIT

L'auto-audit est une étape de réflexion critique **non négociable** et **mécanique**. Le modèle de langage doit agir comme son propre réviseur (Reviewer) avant de devenir l'implémenteur.

### Règle de Blocage :
Si l'auto-audit révèle une information manquante, une contradiction UML ou un risque de sécurité non atténué, le modèle **doit s'arrêter immédiatement** et utiliser le signalement "MISSING INFORMATION". **La génération de code "au jugé" est strictement interdite.**

---

## 2. DÉROULEMENT DU PROTOCOLE D'AUTO-AUDIT (L'ALGORITHME)

Le modèle doit suivre cet algorithme de réflexion séquentiel :

1.  **Séquence d'Analyse UML :** `Lire .wsd` ➔ `Identifier Acteurs` ➔ `Mapper Use Case` ➔ `Vérifier flux de séquence`.
2.  **Séquence de Contrat API :** `Vérifier Endpoint` ➔ `Valider Structure DTO` ➔ `Vérifier Types TS` ➔ `Valider JSON Resource`.
3.  **Séquence de Sécurité :** `Identifier Menace OWASP` ➔ `Vérifier Policy` ➔ `Vérifier Sanitization` ➔ `Vérifier Auth`.
4.  **Séquence de Performance :** `Calculer Complexité` ➔ `Détecter N+1` ➔ `Vérifier Index SQL` ➔ `Décider Asynchrone/Cache`.
5.  **Séquence UX/Accessibilité :** `Vérifier Sémantique HTML` ➔ `Prévoir Skeleton` ➔ `Vérifier ARIA/Contrastes`.
6.  **Séquence d'Angles Morts :** `Consulter 200-LLM-BLINDSPOTS.md` ➔ `Vérifier Persistance Refresh` ➔ `Vérifier Hydratation` ➔ `Vérifier Race Conditions`.
7.  **Séquence de Test :** `Définir Cas Nominal` ➔ `Définir Cas d'Erreur` ➔ `Définir Test E2E`.

---

## 3. FORMAT DU RAPPORT D'AUTO-AUDIT (LIVRABLE OBLIGATOIRE)

Le rapport doit être produit **AVANT** tout bloc de code.

```markdown
################################################################################
#                          RAPPORT D'AUTO-AUDIT TECHNIQUE                      #
################################################################################
# 🔍 ANALYSE DE CONFORMITÉ :
# - UML : [✅ Conforme / ⚠️ Écart / ❌ Manquant] -> [Justification]
# - API : [✅ Validé / ⚠️ À créer / ❌ Incohérent] -> [Endpoint : METHOD /URI]
# - SÉCURITÉ : [✅ Sécurisé / ⚠️ Risque identifié] -> [Mesure : Policy X, Sanitization Y]
# - PERF : [✅ Optimisé / ⚠️ Risque N+1] -> [Correction : eager loading / index Z]
# - UX/ACC : [✅ Conforme / ⚠️ Manquant] -> [Skeletons, ARIA, Contrastes]
#
# 🛠️ STRATÉGIE D'IMPLÉMENTATION :
# - Back : [Service X -> DTO Y -> JsonResource Z]
# - Front : [RSC Page -> RCC Component -> Zod Validation]
# - Tests : [Unitaires X, Integration Y, E2E Z]
#
# 🚩 VERDICT : [🚀 PRÊT / 🛑 BLOQUÉ (Missing Info)]
################################################################################
```


Si un doute subsiste lors de n'importe quelle étape, le protocole **"MISSING INFORMATION"** de la constitution (`000-CONSTITUTION.md`) doit être immédiatement déclenché.
