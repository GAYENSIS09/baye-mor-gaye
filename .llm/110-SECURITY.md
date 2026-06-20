# CONTRAT SÉCURITÉ ABSOLUE (OWASP TOP 10)

## 1. VISION ET TOLÉRANCE ZÉRO SÉCURITÉ

La sécurité n'est pas une option ou un module complémentaire ; c'est le fondement de la viabilité de notre système. Nous appliquons le principe du **moindre privilège** (Least Privilege) et de la **défense en profondeur** (Defense in Depth). 

Toute ligne de code écrite doit être pensée sous l'angle de la vulnérabilité et de la compromission potentielle. Notre architecture est conçue pour atténuer systématiquement les risques énumérés par le top 10 de l'OWASP.

---

## 2. ATTÉNUATION ET STRATÉGIES CONTRE L'OWASP TOP 10

### 2.1 Contrôle d'Accès Défaillant (Broken Access Control)
*   **Risque :** Accéder à des ressources sans autorisation adéquate (ex: forcer un ID dans une URI).
*   **Mitigation :** Ne jamais se baser sur les paramètres réseau de l'utilisateur pour valider son droit. Utiliser systématiquement les **Policies Laravel** (voir `060-LARAVEL-11.md`) pour valider que l'utilisateur connecté détient formellement le droit d'exécuter l'action demandée sur l'instance de ressource ciblée.
*   **Habilitations fines :** Préférer les permissions explicites aux rôles génériques pour éviter les escalades de privilèges.

### 2.2 Défaillances Cryptographiques (Cryptographic Failures)
*   **Risque :** Fuite ou stockage en clair de données confidentielles (mots de passe, numéros de cartes, données personnelles).
*   **Mitigation :** 
    *   Hachage obligatoire des mots de passe à l'aide de l'algorithme fort par défaut de Laravel (`Hash::make()` exploitant Bcrypt/Argon2id).
    *   Chiffrement des données sensibles en base de données à l'aide de la classe `Crypt` de Laravel ou du cast `encrypted` sur le modèle Eloquent :
        ```php
        protected $casts = [
            'bank_details' => 'encrypted:json',
        ];
        ```
    *   Utiliser exclusivement le protocole HTTPS en production (avec des cookies de session configurés avec les drapeaux `Secure`, `HttpOnly` et `SameSite=Lax/Strict`).

### 2.3 Injections SQL et Commandes (SQL & Command Injection)
*   **Risque :** Exécuter du code malveillant au sein de l'interpréteur de base de données.
*   **Mitigation :**
    *   Interdiction d'utiliser des requêtes SQL brutes (`DB::raw()`) concaténées avec des variables utilisateurs.
    *   Utiliser systématiquement l'ORM Eloquent ou le Query Builder avec des liaisons de paramètres (**Parameter Binding**) qui immunisent naturellement le système contre les injections SQL :
        ```php
        // INCORRECT (Faille potentielle)
        User::whereRaw("name = '" . $request->input('name') . "'")->get();

        // CORRECT (Sécurisé par Binding)
        User::where('name', $request->input('name'))->get();
        ```

### 2.4 Conception Non Sécurisée (Insecure Design)
*   **Risque :** Intégrer des failles de logique métier ou d'architecture par manque de modélisation.
*   **Mitigation :** Respect strict de la constitution (`000-CONSTITUTION.md`) et du protocole d'audit UML (`020-UML-COMPLIANCE.md`) pour éliminer les zones d'ombre d'ingénierie avant l'écriture de code.

### 2.5 Défaut de Configuration de Sécurité (Security Misconfiguration)
*   **Risque :** Laisser des identifiants par défaut, le mode débogage actif en production, ou des ports ouverts.
*   **Mitigation :**
    *   Désactivation obligatoire du mode débogage en production (`APP_DEBUG=false` dans le fichier `.env` de production).
    *   Isolation complète de l'accès aux variables d'environnement (`.env` ne doit jamais être commité dans Git, seul `.env.example` y figure).
    *   Configuration stricte du mécanisme CORS (Cross-Origin Resource Sharing) dans Laravel (`config/cors.php`) pour n'autoriser exclusivement que les origines frontend légitimes.

### 2.6 Composants Vulnérables et Obsolètes
*   **Risque :** Utiliser des dépendances tierces (Composer, NPM) contenant des failles connues.
*   **Mitigation :** Exécuter périodiquement des scans de sécurité sur les dépendances du projet :
    *   Pour PHP/Laravel : `composer audit`
    *   Pour JavaScript/Next.js : `npm audit` ou `yarn audit`

### 2.7 Défaillances d'Identification et d'Authentification
*   **Risque :** Brute force de mots de passe, fuites de session, force de mot de passe insuffisante.
*   **Mitigation :**
    *   Limitation stricte des tentatives de connexion (**Rate Limiting**) via le middleware de Laravel (`RateLimiter` ou middleware `throttle`).
    *   Exigence stricte de force pour les mots de passe de création de compte via la classe de validation de Laravel :
        ```php
        'password' => ['required', 'string', Password::min(12)->letters()->mixedCase()->numbers()->symbols()->uncompromised()],
        ```

### 2.8 Manque d'Intégrité des Données et du Logiciel
*   **Risque :** Exécuter des mises à jour non certifiées ou falsifier des payloads sérialisés.
*   **Mitigation :** Ne jamais désérialiser des données provenant de l'utilisateur (`unserialize()` en PHP) sans signature de sécurité ou validation de schéma robuste.

### 2.9 Journalisation et Surveillance Défaillantes (Logging & Monitoring)
*   **Risque :** Ne pas consigner les attaques ou les erreurs système, empêchant d'identifier une intrusion en temps réel.
*   **Mitigation :** Journaliser systématiquement les exceptions critiques et les échecs d'authentification suspects via les canaux de logs de Laravel (`Log::warning()`, `Log::error()`).

### 2.10 Falsification de Requête Côté Serveur (SSRF)
*   **Risque :** Forcer le serveur à émettre des requêtes HTTP vers des ressources internes protégées (ex: métadonnées AWS, ports internes).
*   **Mitigation :** Valider rigoureusement toute URL passée en paramètre par l'utilisateur avant d'émettre un appel réseau sortant via le serveur.

---

## 3. SÉCURITÉ COMPLÉMENTAIRE FRONTEND : SÉCURISATION DU DOM

*   **Prévention XSS (Cross-Site Scripting) :** Ne jamais utiliser l'attribut `dangerouslySetInnerHTML` dans les composants React/Next.js sauf si la donnée source a été explicitement nettoyée côté serveur et passée par une bibliothèque de sanitization (ex: `DOMPurify` ou `isomorphic-dompurify`).
*   **Politique de Sécurité du Contenu (Content Security Policy - CSP) :** Configurer les en-têtes CSP du serveur web pour interdire l'exécution de scripts en ligne (`inline scripts`) non certifiés par un nonce ou non autorisés explicitement.
