# Rapport Technique — Portfolio Baye Mor Gaye
> Audit d'alignement · Correctifs critiques · Décisions d'architecture
> Date : Juin 2026

---

## 1. Bilan d'alignement : 60% — Ce que ça signifie concrètement

Le diagramme de classes spécifie 30 entités, 22 cas d'utilisation, et 3 couches
(public / auth / propriétaire). Le code actuel couvre correctement la structure
de base — modèles, routes CRUD, authentification Sanctum. Les 40% manquants ne
sont pas des détails : ce sont les flux métier complets (modération, likes,
notifications, EDT) et plusieurs endpoints qui existent dans les diagrammes mais
pas dans l'API.

---

## 2. Les 6 correctifs critiques

### C1 — Endpoints manquants : Like et VuePage

**Problème :** Le diagramme séquence 05 spécifie un `POST /api/likes/toggle`
et un enregistrement automatique de `VuePage` à chaque consultation de
publication ou de projet. Ces deux endpoints sont absents du code actuel.

**Impact :** Le LikeButton du frontend ne peut pas fonctionner. Les statistiques
de vues sont à zéro partout.

**Correctif Laravel :**
```php
// routes/api.php — ajouter
Route::post('/likes/toggle', [LikeController::class, 'toggle'])->middleware('auth:sanctum');
Route::post('/vues', [VuePageController::class, 'enregistrer']); // pas d'auth — visiteur aussi

// LikeController.php
public function toggle(Request $request)
{
    $request->validate(['publication_id' => 'nullable|exists:publications,id',
                        'projet_id'       => 'nullable|exists:projet_portfolios,id']);

    $like = Like::firstOrCreate([
        'utilisateur_id' => auth()->id(),
        'publication_id' => $request->publication_id,
        'projet_id'      => $request->projet_id,
    ]);

    if ($like->wasRecentlyCreated) {
        $like->update(['est_aime' => true]);
    } else {
        $like->update(['est_aime' => !$like->est_aime]);
    }

    return response()->json(['est_aime' => $like->est_aime, 'count' => $this->count($request)]);
}
```

**Correctif Next.js — optimistic update :**
```typescript
// hooks/use-like.ts
export function useToggleLike(publicationSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post('/likes/toggle', { publication_id: id }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: qk.publication(publicationSlug) });
      const prev = qc.getQueryData(qk.publication(publicationSlug));
      qc.setQueryData(qk.publication(publicationSlug), (old: any) => ({
        ...old,
        liked: !old.liked,
        likes_count: old.liked ? old.likes_count - 1 : old.likes_count + 1,
      }));
      return { prev };
    },
    onError: (_, __, ctx) => {
      qc.setQueryData(qk.publication(publicationSlug), ctx?.prev);
    },
  });
}
```

---

### C2 — Cascade manquante : suppression Domaine

**Problème :** Le diagramme séquence 17 spécifie qu'à la suppression d'un
`Domaine`, les publications liées doivent être **dissociées** (pivot supprimé)
et les ressources associées doivent avoir leur `domaine_id` mis à null. Le code
actuel ne fait ni l'un ni l'autre — une suppression de Domaine cause une
contrainte de clé étrangère en production.

**Correctif Laravel :**
```php
// DomaineController.php
public function destroy(Domaine $domaine)
{
    DB::transaction(function () use ($domaine) {
        // Dissocier les publications (table pivot)
        $domaine->publications()->detach();
        // Nullifier les ressources liées
        Ressource::where('domaine_id', $domaine->id)
                 ->update(['domaine_id' => null]);
        // Soft delete le domaine
        $domaine->delete();
    });

    return response()->json(['message' => 'Domaine supprimé']);
}
```

**Correctif Next.js — avertissement avant suppression :**
```typescript
// Le ConfirmDialog doit afficher les counts AVANT suppression
const { data: stats } = useDomaineStats(domaine.id);
// stats = { publications_count: 4, ressources_count: 2 }

<ConfirmDialog
  message={`${stats.publications_count} publication(s) seront dissociées,
            ${stats.ressources_count} ressource(s) perdront leur domaine.`}
  onConfirm={() => mutate(domaine.id)}
/>
```

---

### C3 — Purification du contenu TipTap manquante

**Problème :** Le diagramme séquence 03 spécifie que l'API doit **purifier**
le contenu HTML avant insertion (`contenuHtml`). Le code actuel stocke le HTML
brut retourné par TipTap sans assainissement. C'est une faille XSS exploitable.

**Correctif Laravel :**
```bash
composer require ezyang/htmlpurifier
```

```php
// PublicationController.php
use HTMLPurifier;
use HTMLPurifier_Config;

private function purifierContenu(string $html): string
{
    $config = HTMLPurifier_Config::createDefault();
    $config->set('HTML.Allowed',
        'p,br,strong,em,u,s,h2,h3,h4,ul,ol,li,blockquote,code,pre,a[href|target],img[src|alt|width|height]'
    );
    $config->set('HTML.TargetBlank', true);
    $config->set('URI.SafeIframeRegexp', null); // bloquer les iframes
    return (new HTMLPurifier($config))->purify($html);
}

public function store(Request $request)
{
    $validated = $request->validate([...]);
    $validated['contenu_html'] = $this->purifierContenu($validated['contenu_html']);
    // ...
}
```

---

### C4 — Endpoint de modération incomplet

**Problème :** Le diagramme séquence 14 spécifie deux actions sur les
commentaires : approuver (`estApprouve = true`) et rejeter (soft delete +
notification à l'auteur). Le code actuel a un `update` générique mais pas de
route nommée pour chaque action, et aucune notification à l'auteur n'est envoyée.

**Correctif Laravel :**
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/commentaires/{commentaire}/approuver', [CommentaireController::class, 'approuver']);
    Route::delete('/commentaires/{commentaire}/rejeter', [CommentaireController::class, 'rejeter']);
});

// CommentaireController.php
public function approuver(Commentaire $commentaire)
{
    $commentaire->update(['est_approuve' => true]);
    // Notification à l'auteur (queue)
    $commentaire->utilisateur->notify(new CommentaireApprouve($commentaire));
    return response()->json($commentaire);
}

public function rejeter(Commentaire $commentaire)
{
    $auteur = $commentaire->utilisateur;
    $commentaire->delete(); // soft delete
    $auteur?->notify(new CommentaireRejete($commentaire));
    return response()->json(['message' => 'Commentaire rejeté']);
}
```

---

### C5 — Import EDT : endpoint ConversionEDT absent

**Problème :** Le diagramme séquence 04 spécifie un `POST /api/edt/import`
qui reçoit un fichier (image ou PDF), l'envoie à PaliGemma, stocke le résultat
dans `ConversionEDT` (fichierOriginal, modeleUtilise, resultatJSON, confiance),
et retourne la prévisualisation. Cet endpoint n'existe pas du tout.

**Note sur PaliGemma :** voir Section 4 de ce rapport pour la décision
d'architecture complète sur ce point.

**Correctif Laravel (avec stub PaliGemma) :**
```php
// routes/api.php
Route::post('/edt/import', [EdtController::class, 'import'])->middleware('auth:sanctum');

// EdtController.php
public function import(Request $request)
{
    $request->validate([
        'fichier' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        'edt_id'  => 'required|exists:emploi_du_temps,id',
    ]);

    $chemin = $request->file('fichier')->store('edt-imports', 'local');

    // Appel PaliGemma (ou stub en dev)
    $resultat = app(PaliGemmaService::class)->analyserEdt(storage_path('app/' . $chemin));

    $conversion = ConversionEDT::create([
        'emploi_du_temps_id' => $request->edt_id,
        'fichier_original'   => $chemin,
        'modele_utilise'     => $resultat['model'],
        'resultat_json'      => $resultat['evenements'],
        'confiance'          => $resultat['confiance'],
    ]);

    return response()->json($conversion);
}
```

---

### C6 — Endpoint statistiques agrégées absent

**Problème :** Le dashboard affiche des StatCards et des charts de vues, mais
il n'y a pas d'endpoint `GET /api/statistiques?periode=7d` qui agrège
`VuePage` par jour et par contenu. Le frontend fait actuellement plusieurs
appels séparés ou affiche des zéros.

**Correctif Laravel :**
```php
// routes/api.php
Route::get('/statistiques', [StatistiqueController::class, 'index'])->middleware('auth:sanctum');

// StatistiqueController.php
public function index(Request $request)
{
    $jours = match($request->get('periode', '7d')) {
        '30d'  => 30, '3m' => 90, '1a' => 365, default => 7,
    };
    $depuis = now()->subDays($jours);

    return response()->json([
        'vues_par_jour' => VuePage::where('visite_le', '>=', $depuis)
            ->selectRaw('DATE(visite_le) as date, COUNT(*) as total')
            ->groupBy('date')->orderBy('date')->get(),

        'top_publications' => Publication::withCount(['vuepages' => fn($q) => $q->where('visite_le', '>=', $depuis)])
            ->withCount('likes', 'commentaires')
            ->orderByDesc('vuepages_count')->limit(5)->get(['id', 'titre', 'slug']),

        'top_projets' => ProjetPortfolio::withCount(['vuepages' => fn($q) => $q->where('visite_le', '>=', $depuis)])
            ->orderByDesc('vuepages_count')->limit(5)->get(['id', 'titre', 'slug']),

        'totaux' => [
            'vues'          => VuePage::count(),
            'publications'  => Publication::where('est_publiee', true)->count(),
            'projets'       => ProjetPortfolio::where('est_publie', true)->count(),
            'likes'         => Like::where('est_aime', true)->count(),
            'messages_non_lus' => Contact::where('est_lu', false)->count(),
        ],
    ]);
}
```

---

## 3. Les 16 fichiers PlantUML manquants

Le README spécifie 31 diagrammes. En croisant les cas d'utilisation (22) et
les entités (30 dans le diagramme de classes), voici les fichiers source `.wsd`
à créer pour couvrir les flux non encore documentés.

### Diagrammes de séquence manquants (8 fichiers)

```
uml-code/sequences/
  20-sequence-likes.wsd
      Flux : Visiteur consulte publication → clic Like →
             [non-auth] redirect login → [auth] POST /likes/toggle →
             update optimiste frontend → réponse API → update count

  21-sequence-statistiques.wsd
      Flux : Proprietaire ouvre dashboard → GET /statistiques?periode=7d →
             agrégation VuePage en DB → retour JSON → rendu charts

  22-sequence-vuepage.wsd
      Flux : Visiteur ouvre /publications/[slug] →
             frontend POST /vues (silencieux) →
             insertion VuePage → mise à jour nombreVues publication

  23-sequence-auth-complete.wsd
      Flux complet : POST /login → Sanctum token →
                     stockage cookie httpOnly → redirect dashboard →
                     /api/user vérifié → logout → invalidation token

  24-sequence-rappels-cron.wsd
      Flux : Scheduler (cron every minute) → RappelJob dispatché →
             Queue worker → Notification créée en DB →
             Email envoyé via SMTP → estEnvoye=true

  25-sequence-edt-import.wsd
      Flux complet import EDT :
             Upload fichier → POST /edt/import →
             Stockage local → Appel PaliGemmaService →
             ConversionEDT créée → retour résultat (confiance) →
             Frontend : confiance > 0.7 → preview → confirm →
             POST /evenements (batch) → EvenementEDT créés

  26-sequence-ressources-public.wsd
      Flux : Visiteur clique télécharger sur Ressource.estPublique=true →
             GET /ressources/{id}/download →
             increment nombreTelechargements → retour fichier

  27-sequence-notifications-lecture.wsd
      Flux : Dashboard charge NotificationBell →
             GET /notifications?non_lues=true →
             Clic notif → PUT /notifications/{id}/read →
             lueLe=now() → badge décrementé → redirect vers ressource
```

### Diagrammes d'activité manquants (5 fichiers)

```
uml-code/activities/
  20-activity-likes.wsd
      Partitions : Visiteur | Frontend | API
      Décision : authentifié ? → oui : toggle like / non : redirect login

  21-activity-auth.wsd
      Partitions : Utilisateur | Frontend | API | Sanctum
      Flux login/logout complet avec gestion token expiré

  22-activity-edt-import.wsd
      Partitions : Proprietaire | Frontend | API | PaliGemmaService
      Décision confiance → branches confirm/manual-edit/cancel

  23-activity-rappels-auto.wsd
      Partitions : Scheduler | Queue | Notification | SMTP
      Boucle : vérification → rappels dus → dispatch → envoi → marqué envoyé

  24-activity-statistiques.wsd
      Partitions : Proprietaire | Frontend | API | DB
      Sélection période → agrégation → rendu charts
```

### Diagrammes de classes manquants (3 fichiers)

```
uml-code/class-diagram/
  02f-class-qualifications.wsd
      Entités : Experience, Formation, Certification, MediaQualification
      Ces entités sont dans le diagramme master mais n'ont pas leur
      sous-diagramme dédié contrairement aux 5 autres packages.

  02g-class-enums.wsd
      Diagramme dédié aux 4 enums (Niveau, TypeMedia, TypeRessource, + type Notification)
      avec leurs relations vers les entités qui les utilisent.

  02h-class-traits.wsd
      Diagramme dédié aux traits transverses :
      Timestamps (dateCreation, dateModif) + SoftDeletes (dateSuppression)
      avec toutes les entités qui en héritent (vue d'ensemble).
```

### Commande de génération batch pour les nouveaux fichiers

```powershell
# Régénérer uniquement les nouveaux fichiers
$nouveaux = @(
  "uml-code/sequences/20-sequence-likes.wsd",
  "uml-code/sequences/21-sequence-statistiques.wsd",
  # ... liste complète
)
$nouveaux | ForEach-Object {
  java -jar plantuml.jar -tsvg $_
}
```

---

## 4. Décision d'architecture : PaliGemma, WebSocket, SMTP

### 4.1 PaliGemma 2 — Vision IA pour l'import EDT

**Réalité :** PaliGemma 2 10B est un modèle de 10 milliards de paramètres.
Le faire tourner localement requiert une GPU avec ~20GB de VRAM. Dans le
contexte d'un portfolio hébergé sur un VPS standard, c'est **impossible en
production directe**.

**Décision recommandée : architecture stub + API externe optionnelle**

```
Développement local :
  PaliGemmaService retourne un JSON mocké avec confiance = 0.95
  Permet de développer et tester tout le flux EDT sans GPU

Production (option A — sans IA) :
  L'import EDT est désactivé (bouton masqué si PALIGEMMA_ENABLED=false)
  L'utilisateur saisit les événements manuellement
  La fonctionnalité reste dans les diagrammes comme vision future

Production (option B — via API cloud) :
  Utiliser Google Vertex AI (PaliGemma est disponible sur Vertex)
  Appel HTTPS depuis Laravel, coût à l'usage (~0.002$/image)
  Viable pour un portfolio avec usage occasionnel
```

**Implémentation Laravel avec strategy pattern :**
```php
// app/Services/PaliGemmaService.php
interface VisionServiceInterface {
    public function analyserEdt(string $cheminFichier): array;
}

class PaliGemmaStub implements VisionServiceInterface {
    public function analyserEdt(string $cheminFichier): array {
        return [
            'model'      => 'stub-v1',
            'confiance'  => 0.95,
            'evenements' => [
                ['titre' => 'Cours ML', 'jour' => 1, 'debut' => '08:00', 'fin' => '10:00'],
            ],
        ];
    }
}

class PaliGemmaVertex implements VisionServiceInterface {
    public function analyserEdt(string $cheminFichier): array {
        // Appel réel Vertex AI
        $client = new VertexAIClient(config('services.vertex.key'));
        return $client->predict('paligemma-2-10b', file_get_contents($cheminFichier));
    }
}

// AppServiceProvider.php
$this->app->bind(VisionServiceInterface::class,
    config('services.paligemma.enabled')
        ? PaliGemmaVertex::class
        : PaliGemmaStub::class
);
```

**Conséquence sur les diagrammes :** Le diagramme 25-sequence-edt-import doit
mentionner la condition `[PALIGEMMA_ENABLED]` et les deux branches (stub / Vertex).

---

### 4.2 WebSocket — Temps réel pour les notifications

**Réalité :** Laravel Echo Server (basé sur Socket.io) est listé dans la stack
technique. C'est **viable** mais il ajoute un processus Node à superviser, une
connexion WebSocket persistante, et une complexité d'infrastructure.

**Deux options selon le niveau de priorité :**

**Option A — Laravel Reverb (recommandé pour ce projet)**

Laravel Reverb est le serveur WebSocket officiel d'Eloquent/Artisan, sorti en
Laravel 11. Il tourne en PHP pur (pas de Node), s'intègre nativement avec
Broadcasting, et est beaucoup plus simple à déployer dans un contexte Docker
PHP-FPM existant.

```bash
# Installation
composer require laravel/reverb
php artisan reverb:install

# docker-compose.yml — ajouter
reverb:
  image: php-fpm:8.3-alpine
  command: php artisan reverb:start --host=0.0.0.0 --port=8080
  depends_on: [php-fpm]
  ports: ["8080:8080"]
```

```typescript
// Next.js — connexion Reverb via Echo
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
  wsPort: 8080,
});

// Hook notifications temps réel
echo.private(`notifications.${userId}`)
    .listen('NouvelleNotification', (e) => {
      queryClient.invalidateQueries({ queryKey: qk.notifications() });
    });
```

**Option B — Polling SSE (fallback si Reverb trop complexe)**

Si le déploiement WebSocket est une contrainte, remplacer par un polling
toutes les 30 secondes sur les notifications non-lues. Moins élégant mais
zéro infrastructure supplémentaire.

```typescript
// hooks/use-notifications-polling.ts
export function useNotificationsPolling() {
  return useQuery({
    queryKey: qk.notifications(),
    queryFn: () => api.get('/notifications?non_lues=true'),
    refetchInterval: 30_000,        // 30s
    refetchIntervalInBackground: false, // stop si onglet inactif
  });
}
```

**Recommandation finale :** commencer avec le polling (Option B) pour
livrer rapidement. Migrer vers Reverb (Option A) une fois le reste stable.
Les deux implémentations sont compatibles — seul le hook change côté frontend.

---

### 4.3 SMTP — Envoi d'emails

**Réalité :** Mailhog est configuré en développement (capture SMTP locale).
En production, un vrai serveur SMTP est nécessaire.

**Stack recommandée :**

```
Développement : Mailhog (déjà configuré — port 1025, UI sur 8025)
Production    : Resend (resend.com) — API email moderne, 3000 emails/mois gratuits,
                Laravel driver officiel, domaine sénégalais supporté
Alternative   : Brevo (ex-Sendinblue) — présent en Afrique de l'Ouest,
                support français, 300 emails/jour gratuits
```

**Configuration Laravel :**
```php
// .env production
MAIL_MAILER=resend
RESEND_KEY=re_xxxxxxxxxxxx
MAIL_FROM_ADDRESS=contact@bayemorgaye.dev
MAIL_FROM_NAME="Baye Mor Gaye"
```

**Emails envoyés par l'application (liste exhaustive) :**

| Déclencheur | Destinataire | Template |
|---|---|---|
| Nouveau message Contact | Proprietaire | `new-contact.blade.php` |
| Commentaire approuvé | Auteur du commentaire | `commentaire-approuve.blade.php` |
| Commentaire rejeté | Auteur du commentaire | `commentaire-rejete.blade.php` |
| Rappel dû (cron) | Proprietaire | `rappel-du.blade.php` |

**Seuls 4 templates à créer.** Chacun utilise le layout Markdown Laravel
(`resources/views/vendor/mail/html/layout.blade.php`) — pas besoin de HTML
custom pour commencer.

```bash
php artisan make:mail NouveauContact --markdown=emails.contact.nouveau
php artisan make:mail CommentaireApprouve --markdown=emails.commentaire.approuve
php artisan make:mail CommentaireRejete --markdown=emails.commentaire.rejete
php artisan make:mail RappelDu --markdown=emails.rappel.du
```

**Queue obligatoire :** tous les envois d'email passent par la queue
(interface `ShouldQueue`) pour ne pas bloquer la réponse HTTP.

---

## 5. Ordre de résolution recommandé

```
Semaine 1 — Fondations (bloquantes pour le frontend)
  [C1] Endpoints Like + VuePage
  [C3] Purification HTML TipTap
  [C6] Endpoint statistiques agrégées

Semaine 2 — Flux métier
  [C4] Modération commentaires (approuver/rejeter + notification)
  [C2] Cascade suppression Domaine
  [C5] Endpoint import EDT (avec stub PaliGemma)
  [SMTP] 4 templates email + queue

Semaine 3 — Infrastructure temps réel
  [WS] Polling SSE 30s (immédiat)
  Puis migration Reverb si priorité confirmée

Semaine 4 — Documentation
  16 fichiers PlantUML manquants (séquences + activités + classes)
  Régénération SVG batch
```

---

## 6. Ce qui est bien aligné — Ne pas toucher

```
✓ Structure Sanctum (authentification, protection routes)
✓ SoftDeletes sur les bonnes entités (Publication, Commentaire, ProjetPortfolio,
  Competence, Domaine, Formation, Experience, Certification, Ressource)
✓ Relations pivot Publication *-* Domaine
✓ Enum Niveau correctement défini et utilisé dans NiveauCompetence
✓ ConversionEDT lié à EmploiDuTemps (relation correcte)
✓ MediaQualification partagé entre Experience, Formation, Certification
✓ Singleton Proprietaire (un seul enregistrement possible)
✓ Contact sans relation Utilisateur (formulaire libre — correct)
✓ VuePage liée à Publication ET ProjetPortfolio (polymorphisme ou FK doubles)
✓ Rappel.estEnvoye + envoyeLe pour idempotence du cron
```


# Portfolio Frontend Skill V2 — Baye Mor Gaye
> Laravel 11 API · Next.js 16 (App Router) · TanStack Query · TypeScript · Tailwind CSS 4
> Version focalisée : navigation, structure des pages, composants par entité UML

---

## RÈGLE D0 — Ce fichier est la loi

Avant de générer **un seul composant**, lire les sections concernées ici.
Le style (couleurs, typographie) est défini dans le design system existant — ne pas le redéfinir.
Ce skill gouverne : quelles pages existent, comment on navigue entre elles, quels composants appartiennent à quelle page, et comment chaque entité UML se traduit en UI concrète.

---

## SECTION 1 — Modèle mental : les 3 acteurs, les 3 espaces

Le diagramme de cas d'utilisation définit 3 acteurs en héritage strict :

```
Proprietaire --|> UtilisateurAuthentifie --|> Visiteur
```

Cela se traduit en 3 espaces frontend **étanches** :

```
ESPACE PUBLIC      /                   → Visiteur (non authentifié)
ESPACE AUTH        /dashboard/*        → Propriétaire uniquement (singleton)
ESPACE TRANSITION  /login              → Pont entre les deux
```

**Règle absolue** : jamais une page du dashboard accessible à un Visiteur.
**Règle absolue** : le Propriétaire *voit* son espace public en Visiteur quand il le veut.

---

## SECTION 2 — Système de navigation : le bon outil au bon endroit

La navigation n'est pas universelle. Chaque contexte a son propre dispositif.

### 2.1 Pages publiques — Floating Pill Nav

```
Comportement :
  - Invisible au chargement (opacity: 0)
  - Apparaît après 80px de scroll (opacity: 1, translateY: 0)
  - Disparaît pendant un scroll rapide vers le bas (> 5px/frame)
  - Réapparaît immédiatement au scroll vers le haut

Contenu (5 items max) :
  [ Profil ]  [ Projets ]  [ Publications ]  [ Ressources ]  [ Contact ]

Position :
  - Desktop : centré en haut, backdrop-blur, border subtle
  - Mobile  : fixé en bas de l'écran, full-width, 5 icônes + label

Actif :
  - Highlight de l'item correspondant à la section visible (IntersectionObserver)
  - Sur les pages internes (/projets, /publications) : highlight permanent de l'item concerné
```

**NE PAS** mettre une navbar full-width collée en haut sur les pages publiques.

### 2.2 Dashboard — Sidebar Layout

```
Structure :
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixe)  │  MAIN CONTENT (flex-1)             │
│                        │  ┌─────────────────────────────┐   │
│  [Avatar + Nom]        │  │  TOPBAR                     │   │
│  ─────────────────     │  │  Breadcrumb + Actions page  │   │
│  Navigation groupée    │  ├─────────────────────────────┤   │
│                        │  │                             │   │
│                        │  │  CONTENU                    │   │
│                        │  │                             │   │
└─────────────────────────────────────────────────────────────┘

Sidebar collapsée (desktop) : 64px, icônes seules, tooltip au survol
Sidebar mobile              : drawer depuis la gauche (burger dans topbar)
```

**Groupes sidebar (dans cet ordre) :**
```
─── Aperçu
    Dashboard          /dashboard
─── Identité
    Profil             /dashboard/profil
    Expériences        /dashboard/experiences
    Formations         /dashboard/formations
    Certifications     /dashboard/certifications
    Compétences        /dashboard/competences
    Domaines           /dashboard/domaines
─── Contenu
    Publications       /dashboard/publications
    Projets            /dashboard/projets
    Ressources         /dashboard/ressources
─── Planning
    Emploi du temps    /dashboard/edt
    Rappels            /dashboard/rappels
─── Communauté
    Commentaires       /dashboard/commentaires    [badge non-approuvés]
    Messages           /dashboard/messages        [badge non-lus]
    Notifications      /dashboard/notifications   [badge non-lues]
─── Analyse
    Statistiques       /dashboard/statistiques
─── [Voir le site public ↗]   ← lien externe, en bas
```

### 2.3 Pages article / projet — Navigation contextuelle minimale

```
Layout :
  Topbar minimal : [← Retour]  Titre tronqué  [Actions si propriétaire]
  Barre de progression lecture : 2px, fixée en haut, accent-primary

PAS de sidebar.
PAS de floating pill (elle est masquée sur ces pages).
```

### 2.4 Pages standalone — Aucune navigation

```
Concerne : /login, /404, /403
Aucun shell, aucun nav, aucune sidebar.
Lien unique de retour si nécessaire.
```

---

## SECTION 3 — Cartographie complète des pages et leurs composants

### 3.1 Page `/` — Landing (Visiteur)

**Rôle** : présenter l'intégralité du profil public en une narration continue.
**Navigation** : floating pill (apparaît au scroll).
**Pas de sections génériques** — chaque bloc correspond à une entité UML réelle.

```
┌─────────────────────────────────────────────┐
│  HERO                                        │
│  Entités : Proprietaire                      │
│  Composants :                                │
│    <HeroSection>                             │
│      <ProprietaireAvatar />   ← photo        │
│      <ProprietaireTitre />    ← titre pro     │
│      <ProprietaireBio />      ← bio           │
│      <ProprietaireLinks />    ← linkedin/github/siteWeb │
│      <ProprietaireLocalisation />             │
│      <HeroCTA />              ← 2 boutons    │
│    </HeroSection>                            │
├─────────────────────────────────────────────┤
│  COMPÉTENCES                                 │
│  Entités : Competence, NiveauCompetence,     │
│            Domaine (catégorie)               │
│  Composants :                                │
│    <CompetencesSection>                      │
│      <DomainFilterTabs />  ← filtre par catégorie │
│      <CompetenceGroup>     ← par categorie   │
│        <CompetenceBar />   ← nom + niveau    │
│      </CompetenceGroup>                      │
│    </CompetencesSection>                     │
├─────────────────────────────────────────────┤
│  PROJETS EN VEDETTE                          │
│  Entités : ProjetPortfolio (estEnVedette=true) │
│            MediaProjet (estPrincipal=true)   │
│  Composants :                                │
│    <ProjetsFeaturedSection>                  │
│      <ProjetCard /> × 3                      │
│      <VoirTousLink />                        │
│    </ProjetsFeaturedSection>                 │
├─────────────────────────────────────────────┤
│  PUBLICATIONS RÉCENTES                       │
│  Entités : Publication (estPubliee=true),    │
│            Domaine, Like (count)             │
│  Composants :                                │
│    <PublicationsRecentesSection>             │
│      <PublicationCardLarge />  ← 1ère pub   │
│      <PublicationCardSmall /> × 2           │
│      <VoirToutesLink />                      │
│    </PublicationsRecentesSection>            │
├─────────────────────────────────────────────┤
│  TIMELINE PARCOURS                           │
│  Entités : Experience, Formation,            │
│            Certification                     │
│  Composants :                                │
│    <TimelineSection>                         │
│      <TimelineFilter />   ← Tout/Exp/Form/Certif │
│      <TimelineItem />     ← alternance G/D  │
│        - Experience   : titre + entreprise + dates + lieu │
│        - Formation    : diplôme + établissement + dates  │
│        - Certification: titre + organisme + date + lien  │
│    </TimelineSection>                        │
├─────────────────────────────────────────────┤
│  RESSOURCES PUBLIQUES                        │
│  Entités : Ressource (estPublique=true)      │
│  Composants :                                │
│    <RessourcesSection>                       │
│      <RessourceCard /> × N                   │
│    </RessourcesSection>                      │
├─────────────────────────────────────────────┤
│  CONTACT                                     │
│  Entités : Contact (nom, email, message)     │
│  Composants :                                │
│    <ContactSection>                          │
│      <ContactInfo />   ← email + localisation │
│      <ContactForm />   ← formulaire          │
│    </ContactSection>                         │
└─────────────────────────────────────────────┘
```

---

### 3.2 Page `/projets` — Grille projets (Visiteur)

**Entités** : `ProjetPortfolio`, `MediaProjet` (estPrincipal), `VuePage`

```
<ProjetsPage>
  <PageHeader title="Projets" count={total} />
  <TechFilterBar>          ← chips depuis technologies[] agrégées
    Tous | Python | Django | React | PyTorch | ...
  </TechFilterBar>
  <ProjetGrid>             ← 3 cols / 2 / 1
    <ProjetCard>
      <ProjetMedia />      ← image principale (MediaProjet.estPrincipal)
      <ProjetBody>
        <ProjetTitre />
        <ProjetDescription />  ← courteDescription (2 lignes max)
        <ProjetTechList />     ← technologies[] comme chips
        <ProjetLinks>
          <DemoLink />         ← urlDemo si présent
          <SourceLink />       ← urlSource si présent
        </ProjetLinks>
      </ProjetBody>
    </ProjetCard>
  </ProjetGrid>
  <LoadMoreButton />       ← pagination cursor-based, pas numérotée
</ProjetsPage>
```

---

### 3.3 Page `/projets/[slug]` — Détail projet (Visiteur)

**Entités** : `ProjetPortfolio`, `MediaProjet` (tous), `VuePage` (auto-enregistré)

```
Layout : topbar minimal + contenu centré (max-w-4xl)

<ProjetDetailPage>
  <ProjetDetailHeader>     ← topbar : [← Projets] + titre + [Demo ↗] [Source ↗]
  <ProjetMediaGallery>     ← carousel MediaProjet triés par ordre
  <ProjetContent>
    <ProjetMeta>
      <DateRealisation />
      <TechBadges />       ← technologies[]
      <EstEnVedette />     ← badge si true
    </ProjetMeta>
    <ProjetDescription />  ← description complète (longtext)
  </ProjetContent>
</ProjetDetailPage>
```

---

### 3.4 Page `/publications` — Liste (Visiteur)

**Entités** : `Publication` (estPubliee=true), `Domaine`, `Like` (count), `VuePage`

```
<PublicationsPage>
  <PageHeader title="Publications" />
  <DomaineFilterBar>       ← chips depuis Domaine (couleur par domaine)
  <PublicationList>
    <PublicationRow>       ← layout horizontal : image + meta + extrait
      <PublicationImage />
      <PublicationMeta>
        <DomaineBadge />   ← couleur = Domaine.couleur
        <PublicationTitre />
        <PublicationExtrait />
        <PublicationFooter>
          <DatePublication />
          <NombreVues />    ← nombreVues
          <NombreLikes />   ← count(Like)
          <NombreCommentaires /> ← count(Commentaire.estApprouve=true)
        </PublicationFooter>
      </PublicationMeta>
    </PublicationRow>
  </PublicationList>
</PublicationsPage>
```

---

### 3.5 Page `/publications/[slug]` — Article complet (Visiteur/Authentifié)

**Entités** : `Publication`, `Commentaire` (estApprouve=true), `Like`, `Domaine`, `VuePage`

```
Layout : topbar minimal + barre progression + sidebar sticky (desktop)

<PublicationDetailPage>
  <ArticleTopbar>
    [← Publications]   Titre tronqué   Temps de lecture
    [Barre progression 2px fixée en haut]
  </ArticleTopbar>

  <ArticleLayout>            ← grid 2 cols sur lg
    <ArticleMain>
      <ArticleHero>
        <ImageUne />         ← imageUne
        <DomaineBadge />
        <ArticleTitre />     ← grand, font-display
        <ArticleMeta>
          <DatePublication />
          <NombreVues />
          <TempsLecture />   ← calculé depuis contenu
        </ArticleMeta>
      </ArticleHero>
      <ArticleBody>          ← contenuHtml rendu, prose Tailwind
      <ArticleFooter>
        <LikeButton>         ← animation, optimistic update
          Si non-auth : tooltip "Connectez-vous"
        <ArticleTags />      ← Domaine(s)

      <CommentSection>
        <CommentForm>        ← si authentifié seulement
          Sinon : <LoginPrompt />
        <CommentList>
          <CommentItem>      ← avatar initiales + nom + date + contenu
            Commentaires approuvés uniquement côté public
        </CommentList>
      </CommentSection>
    </ArticleMain>

    <ArticleSidebar>         ← sticky, desktop uniquement
      <TableauMatieres />    ← auto-généré depuis H2/H3 du contenu
      <PublicationsLiees />  ← même Domaine, 3 max
    </ArticleSidebar>
  </ArticleLayout>
</PublicationDetailPage>
```

---

### 3.6 Page `/contact` — Formulaire standalone (Visiteur)

**Entité** : `Contact` (nom, email, message)

```
Layout centré, pas de shell — page épurée

<ContactPage>
  <ContactHeader>
    Titre + sous-titre (ancré dans l'identité)
  </ContactHeader>
  <ContactGrid>            ← 2 cols desktop / 1 mobile
    <ContactInfo>
      Localisation (Proprietaire.localisation)
      Email direct (Proprietaire.email)
      LinkedIn / GitHub
    </ContactInfo>
    <ContactForm>
      <input name="nom" autoComplete="name" />
      <input name="email" type="email" autoComplete="email" />
      <textarea name="message" />
      <SubmitButton />      ← disabled + "Envoi…" pendant mutation
      <SuccessMessage />    ← après succès, remplace le formulaire
    </ContactForm>
  </ContactGrid>
</ContactPage>
```

---

### 3.7 Page `/login` — Standalone (transition)

**Entité** : `Utilisateur` (email, mot de passe → Sanctum)

```
Aucune navigation.
Page centrée, fond plein.

<LoginPage>
  <LoginCard>
    Logo / Avatar Proprietaire
    <LoginForm>
      <input name="email" type="email" autoComplete="email" />
      <input name="password" type="password" autoComplete="current-password" />
      <SubmitButton />
      <ErrorMessage role="alert" />
    </LoginForm>
  </LoginCard>
  [← Retour au site]       ← discret, en bas
</LoginPage>
```

Après login réussi : redirect `/dashboard`.

---

### 3.8 Page `/dashboard` — Vue d'ensemble

**Entités** : `VuePage`, `Publication`, `ProjetPortfolio`, `Contact` (non-lus), `Commentaire` (en attente), `Notification`

```
<DashboardPage>
  <StatsGrid>              ← 4 cartes en grille 2×2 (mobile) ou 4×1 (desktop)
    <StatCard label="Vues totales"      value={sum(VuePage)} icon={Eye} />
    <StatCard label="Publications"      value={count(Publication.estPubliee)} icon={FileText} />
    <StatCard label="Projets"           value={count(ProjetPortfolio.estPublie)} icon={FolderOpen} />
    <StatCard label="Messages non lus"  value={count(Contact.estLu=false)} icon={Mail} urgent />
  </StatsGrid>

  <DashboardGrid>          ← 2 cols desktop / 1 mobile
    <VuesSemaine>          ← LineChart recharts, 7 derniers jours VuePage
    <CommentairesEnAttente>
      Liste des Commentaire.estApprouve=false (5 max)
      Actions inline : [✓ Approuver] [✗ Rejeter]
      Lien "Voir tout →" → /dashboard/commentaires
    </CommentairesEnAttente>
  </DashboardGrid>

  <DashboardGrid>          ← 2 cols desktop / 1 mobile
    <NotificationsRecentes>
      5 dernières Notification non-lues
      [Tout marquer lu]
      Lien "Voir tout →" → /dashboard/notifications
    </NotificationsRecentes>
    <RappelsProchains>
      Rappels avec rappelLe dans les 7 prochains jours
      Lien "Gérer →" → /dashboard/rappels
    </RappelsProchains>
  </DashboardGrid>
</DashboardPage>
```

---

### 3.9 Page `/dashboard/profil`

**Entités** : `Proprietaire`, `Utilisateur`

```
<ProfilPage>
  <ProfilPhotoSection>
    <AvatarUpload />       ← aperçu + bouton remplacer
  </ProfilPhotoSection>
  <ProfilForm>
    Groupe Identité :
      nom, titreProfessionnel, bio (textarea), localisation
    Groupe Liens :
      siteWeb, urlLinkedin, urlGithub
    Groupe Compte :
      email (lecture seule si vérifié), mot de passe (changement séparé)
    <SaveButton />
  </ProfilForm>
</ProfilPage>
```

---

### 3.10 Page `/dashboard/experiences`

**Entités** : `Experience`, `MediaQualification`

```
<ExperiencesPage>
  <PageActions>
    <AddButton label="Ajouter une expérience" />
  </PageActions>

  <ExperienceList>         ← draggable pour réordonner (ordre)
    <ExperienceItem>
      <ExperienceMeta>
        titre + entreprise + lieu
        dateDebut → dateFin (ou "En cours" si estActuel=true)
      </ExperienceMeta>
      <ExperienceDescription />  ← tronquée, expand au clic
      <MediaThumbnails />        ← MediaQualification associés
      <ItemActions>
        [✏ Modifier] [🗑 Supprimer]
      </ItemActions>
    </ExperienceItem>
  </ExperienceList>

  <ExperienceDrawer>       ← drawer latéral (pas modal) pour créer/éditer
    <ExperienceForm>
      titre*, entreprise*, lieu, description
      dateDebut*, dateFin, estActuel (checkbox)
      ordre
      <MediaUpload multiple />
    </ExperienceForm>
  </ExperienceDrawer>
</ExperiencesPage>
```

Même pattern exact pour `/dashboard/formations` (Formation) et `/dashboard/certifications` (Certification + urlCredential).

---

### 3.11 Page `/dashboard/competences`

**Entités** : `Competence`, `NiveauCompetence` (niveau, estSurligne), `Domaine` (catégorie)

```
<CompetencesPage>
  <PageActions>
    <AddButton label="Ajouter une compétence" />
  </PageActions>

  <CompetencesByCategory>
    Pour chaque catégorie unique :
    <CategoryGroup label={categorie}>
      <CompetenceRow>
        <CompetenceIcon />   ← Competence.icone
        <CompetenceName />
        <NiveauSelect />     ← dropdown Niveau enum : Débutant/Intermédiaire/Avancé/Expert
        <EstSurligneToggle /> ← highlight sur le portfolio public
        <DeleteButton />
      </CompetenceRow>
    </CategoryGroup>
  </CompetencesByCategory>

  <CompetenceDrawer>
    <CompetenceForm>
      nom*, categorie (select ou input libre), icone
      niveau* (NiveauCompetence), estSurligne
    </CompetenceForm>
  </CompetenceDrawer>
</CompetencesPage>
```

---

### 3.12 Page `/dashboard/domaines`

**Entités** : `Domaine` (nom, slug, description, couleur)

```
<DomainesPage>
  <PageActions>
    <AddButton label="Ajouter un domaine" />
  </PageActions>

  <DomaineGrid>            ← grille 3 cols
    <DomaineCard>
      <DomaineCouleurBadge />   ← color picker intégré
      <DomaineNom />
      <DomaineSlug />           ← auto-généré, lecture seule
      <DomaineDescription />
      <DomaineStats>
        {count(Publication)} publications · {count(Ressource)} ressources
      </DomaineStats>
      <CardActions>
        [✏ Modifier] [🗑 Supprimer]
        ⚠ Si suppression : avertissement "X publications seront dissociées"
      </CardActions>
    </DomaineCard>
  </DomaineGrid>
</DomainesPage>
```

---

### 3.13 Page `/dashboard/publications`

**Entités** : `Publication` (tous statuts), `Domaine`, `VuePage` (count), `Commentaire` (count), `Like` (count)

```
<PublicationsDashPage>
  <PageActions>
    <AddButton label="Nouvelle publication" → /dashboard/publications/new />
  </PageActions>

  <PublicationFilters>
    [Toutes] [Publiées] [Brouillons]
  </PublicationFilters>

  <PublicationTable>       ← table ou liste selon préférence
    Colonnes : Titre | Domaine(s) | Vues | Likes | Commentaires | Statut | Date | Actions
    <StatusBadge>
      Publiée (vert) | Brouillon (ambre)
    <RowActions>
      [✏ Modifier] [👁 Aperçu ↗] [🗑 Supprimer]
  </PublicationTable>
</PublicationsDashPage>
```

---

### 3.14 Page `/dashboard/publications/new` et `/[id]/edit` — Éditeur

**Entités** : `Publication` (tous champs), `MediaPublication`, `Domaine`

```
Layout : plein écran, pas de sidebar visible (masquée ou collapsée auto)

<PublicationEditorPage>
  <EditorTopbar>
    [← Publications]
    <TitreInput />         ← input grand sans bordure, placeholder "Titre de la publication"
    <EditorStatus>         ← "Brouillon" | "Publié le XX/XX"
    <AutoSaveIndicator />  ← "Sauvegardé il y a 12s" | "Sauvegarde…"
    <ActionButtons>
      [Prévisualiser] [Enregistrer brouillon] [Publier]
  </EditorTopbar>

  <EditorBody>             ← 2 cols : éditeur + panneau config
    <TipTapEditor>
      Toolbar contextuelle flottante (au-dessus de la sélection, PAS fixe)
      Upload image par drag/drop → MediaPublication
      Contenu → contenu (raw) + contenuJson (TipTap JSON) + contenuHtml (rendu)
    </TipTapEditor>

    <EditorPanel>          ← drawer sur mobile, colonne sticky sur desktop
      <DomainesSelect />   ← multi-select (Publication *—* Domaine)
      <ExtraitTextarea />
      <ImageUneUpload />   ← drag/drop, preview
      <SlugInput />        ← auto depuis titre, éditable
      <PublieLeInput />    ← date/heure de publication
    </EditorPanel>
  </EditorBody>
</PublicationEditorPage>
```

---

### 3.15 Page `/dashboard/projets`

**Entités** : `ProjetPortfolio`, `MediaProjet`

```
<ProjetsDashPage>
  <PageActions>
    <AddButton label="Nouveau projet" → /dashboard/projets/new />
  </PageActions>

  <ProjetDashList>
    <ProjetDashRow>
      <ProjetVignette />   ← MediaProjet.estPrincipal, 60×60
      <ProjetMeta>
        titre + courteDescription (1 ligne)
        technologies[] (3 max, "+N")
      </ProjetMeta>
      <ProjetStatus>
        [En vedette ★] si estEnVedette
        Publié (vert) | Brouillon (ambre)
      </ProjetStatus>
      <ProjetStats>
        {count(VuePage)} vues
      </ProjetStats>
      <RowActions>
        [★ Vedette toggle] [✏ Modifier] [👁 Aperçu] [🗑 Supprimer]
    </ProjetDashRow>
  </ProjetDashList>
</ProjetsDashPage>
```

Page `/dashboard/projets/new` et `/[id]/edit` — Formulaire projet :
```
<ProjetFormPage>
  <FormTopbar>
    [← Projets]  Titre input  [Enregistrer] [Publier]
  </FormTopbar>
  <ProjetFormBody>
    Groupe Description :
      titre*, slug (auto), courteDescription*, description* (textarea riche)
    Groupe Liens :
      urlDemo, urlSource
    Groupe Technologies :
      <TechTagInput />     ← saisie libre avec tags, stocké en List
    Groupe Médias :
      <MediaGalleryUpload /> ← multi-upload, drag to reorder, toggle estPrincipal
    Groupe Options :
      dateRealisation, estEnVedette (toggle), estPublie (toggle)
  </ProjetFormBody>
</ProjetFormPage>
```

---

### 3.16 Page `/dashboard/edt`

**Entités** : `EmploiDuTemps`, `EvenementEDT`, `ConversionEDT`

```
<EdtPage>
  <EdtTopbar>
    <EdtSelector />        ← dropdown liste des EDT (titre + semaine/année)
    <WeekNav>
      [← Semaine préc]  Semaine N — Année  [Semaine suiv →]
    </WeekNav>
    <EdtActions>
      [+ Événement] [📷 Importer image/PDF]
    </EdtActions>
  </EdtTopbar>

  <EdtGrid>                ← grille native CSS (pas de lib externe)
    Colonnes : Lundi → Dimanche (7 cols)
    Lignes   : 07:00 → 22:00, slot de 30 min
    <EvenementBlock>       ← positionné par heureDebut + heureFin
      couleur = EvenementEDT.couleur
      titre + lieu
      Clic → EditEvenementDrawer
  </EdtGrid>

  <ImportDialog>           ← s'ouvre sur "Importer image/PDF"
    <FileUpload accept="image/*,application/pdf" />
    Si ConversionEDT.confiance > 0.7 :
      <ConversionPreview>
        Aperçu des événements détectés (PaliGemma résultat JSON)
        [✓ Confirmer tout] [✏ Modifier] [✗ Annuler]
    Sinon :
      <ConfidenceWarning>
        "Confiance insuffisante — vérification manuelle recommandée"
        Affiche quand même le résultat avec flag d'incertitude
  </ImportDialog>

  <EvenementDrawer>        ← créer/éditer un événement
    <EvenementForm>
      titre*, description, jourSemaine*, heureDebut*, heureFin*
      couleur (color picker), lieu
    </EvenementForm>
  </EvenementDrawer>

  <EdtCreateDialog>        ← créer un nouvel EDT
    titre, description, numeroSemaine, annee
  </EdtCreateDialog>
</EdtPage>
```

---

### 3.17 Page `/dashboard/rappels`

**Entités** : `Rappel` (titre, message, rappelLe, estEnvoye, envoyeLe)

```
<RappelsPage>
  <RappelFilters>
    [Tous] [À venir] [Envoyés]
  </RappelFilters>

  <RappelList>
    <RappelItem>
      <RappelStatus>
        ⏰ (à venir, rouge si < 24h) | ✓ (envoyé)
      </RappelStatus>
      <RappelContent>
        titre + message (tronqué)
        rappelLe (relatif : "dans 2h", "demain à 14h")
      </RappelContent>
      <RappelActions>
        [✏ Modifier] [🗑 Supprimer]
      </RappelActions>
    </RappelItem>
  </RappelList>

  <AddRappelFAB />         ← bouton flottant +, ouvre drawer

  <RappelDrawer>
    <RappelForm>
      titre*, message, rappelLe* (datetime-local input)
    </RappelForm>
  </RappelDrawer>
</RappelsPage>
```

---

### 3.18 Page `/dashboard/ressources`

**Entités** : `Ressource` (titre, description, cheminFichier, typeFichier, type: TypeRessource, estPublique, nombreTelechargements), `Domaine`

```
<RessourcesPage>
  <PageActions>
    <UploadButton label="Ajouter une ressource" />
  </PageActions>

  <RessourceFilters>
    [Toutes] [Publiques] [Privées]  |  Filtre Domaine
  </RessourceFilters>

  <RessourceGrid>          ← 3 cols / 2 / 1
    <RessourceCard>
      <TypeIcon />         ← icône selon TypeRessource (Document/Image/Archive/Lien)
      <RessourceTitre />
      <RessourceDescription />
      <RessourceMeta>
        Domaine badge · {nombreTelechargements} téléchargements
        estPublique badge (vert "Public" | gris "Privé")
      </RessourceMeta>
      <CardActions>
        [⬇ Télécharger] [✏ Modifier] [🗑 Supprimer]
      </CardActions>
    </RessourceCard>
  </RessourceGrid>

  <RessourceDrawer>
    <RessourceForm>
      Si type ≠ Lien : <FileUpload />  ← drag/drop, preview nom + taille
      Si type = Lien : <UrlInput />
      titre*, description, type* (TypeRessource), domaine (select Domaine)
      estPublique (toggle)
    </RessourceForm>
  </RessourceDrawer>
</RessourcesPage>
```

---

### 3.19 Page `/dashboard/commentaires`

**Entités** : `Commentaire` (contenu, estApprouve), `Utilisateur` (auteur), `Publication`

```
<CommentairesPage>
  <CommentaireFilters>
    [En attente ({count})]  [Approuvés]  [Tous]
  </CommentaireFilters>

  <CommentaireList>
    <CommentaireItem>
      <AuteurInfo>
        <Avatar initiales />  nom + email
      </AuteurInfo>
      <PublicationRef>
        → lien vers la publication (titre)
      </PublicationRef>
      <CommentaireContenu />
      <CommentaireDate />
      <CommentaireActions>
        Si estApprouve=false :
          [✓ Approuver]  [✗ Rejeter (soft delete)]
        Si estApprouve=true :
          [✗ Désapprouver]
        [→ Répondre]     ← ouvre inline reply form
      </CommentaireActions>
    </CommentaireItem>
  </CommentaireList>
</CommentairesPage>
```

---

### 3.20 Page `/dashboard/messages`

**Entités** : `Contact` (nom, email, message, estLu)

```
<MessagesPage>
  <MessageFilters>
    [Non lus ({count})]  [Lus]  [Tous]
  </MessageFilters>

  <MessageList>
    <MessageItem>          ← fond légèrement différent si estLu=false
      <MessageSender>
        nom + email
      </MessageSender>
      <MessagePreview>
        message (tronqué à 100 chars)
      </MessagePreview>
      <MessageMeta>
        date (relative)
        Badge "Non lu" si estLu=false
      </MessageMeta>
      Clic sur l'item → ouvre <MessageDetailDrawer>
    </MessageItem>
  </MessageList>

  <MessageDetailDrawer>
    Nom + Email (lien mailto)
    Message complet
    Date reçu
    [✓ Marquer comme lu] ← auto au premier affichage
    [✉ Répondre par email ↗]  ← mailto: link
  </MessageDetailDrawer>
</MessagesPage>
```

---

### 3.21 Page `/dashboard/notifications`

**Entités** : `Notification` (type, donnees: JSON, lueLe)

```
<NotificationsPage>
  <PageActions>
    <MarkAllReadButton />  ← disabled si toutes lues
  </PageActions>

  <NotificationFilters>
    [Toutes] [Non lues]
  </NotificationFilters>

  <NotificationList>
    <NotificationItem>     ← fond distinct si lueLe=null
      <NotifIcon />        ← selon type (commentaire/like/contact/rappel...)
      <NotifContent>
        texte construit depuis donnees JSON
      </NotifContent>
      <NotifMeta>
        dateCreation (relative) · lueLe si défini
      </NotifMeta>
      Clic → marquer lu + naviguer vers la ressource concernée
    </NotificationItem>
  </NotificationList>
</NotificationsPage>
```

**NotificationBell dans le topbar dashboard** :
```
<NotificationBell>
  Icône cloche + badge count (lueLe=null)
  Clic → Dropdown (5 dernières non-lues)
    <NotifMiniItem /> × 5
    [Voir tout →] → /dashboard/notifications
```

---

### 3.22 Page `/dashboard/statistiques`

**Entités** : `VuePage` (par publication + projet), `Publication`, `ProjetPortfolio`, `Like`, `Commentaire`

```
<StatistiquesPage>
  <StatPeriodSelector>
    [7 jours] [30 jours] [3 mois] [Cette année]
  </StatPeriodSelector>

  <StatsTopGrid>           ← 4 StatCards
    Vues totales · Publications actives · Projets publiés · Likes reçus

  <ChartsGrid>             ← 2 cols desktop
    <VuesLineChart>        ← recharts, vues par jour sur la période
    <VuesParContenuBar>    ← bar chart : top 5 publications + top 5 projets
  </ChartsGrid>

  <TopContentTable>
    Top publications (titre + vues + likes + commentaires)
    Top projets (titre + vues)
  </TopContentTable>
</StatistiquesPage>
```

---

## SECTION 4 — Composants partagés (shared/)

Ces composants sont utilisés dans plusieurs pages — les définir une seule fois.

```
shared/
  layout/
    FloatingPillNav.tsx        ← navigation publique
    DashboardShell.tsx         ← sidebar + topbar dashboard
    ArticleShell.tsx           ← topbar minimal + progress bar
    StandaloneShell.tsx        ← aucun nav (login, 404)

  ui/
    StatCard.tsx               ← valeur + label + icône + optional urgent flag
    CompetenceBar.tsx          ← nom + barre niveau (Intersection Observer)
    DomaineBadge.tsx           ← badge coloré selon Domaine.couleur
    StatusBadge.tsx            ← Publié/Brouillon/En attente/Approuvé
    TimelineItem.tsx           ← Experience | Formation | Certification
    MediaGallery.tsx           ← carousel MediaProjet / MediaPublication
    DrawerPanel.tsx            ← drawer réutilisable (titre + children + footer)
    ConfirmDialog.tsx          ← dialog destructif standardisé
    EmptyState.tsx             ← icon + message + CTA optionnel
    SkeletonCard.tsx           ← skeleton générique paramétrable
    Toast.tsx                  ← système de toast (succès/erreur/info)
    NotificationBell.tsx       ← pour topbar dashboard

  forms/
    FieldWrapper.tsx           ← label + input + error (pattern standardisé)
    FileUpload.tsx             ← drag/drop + preview + progress
    TechTagInput.tsx           ← saisie tags libres pour technologies[]
    ColorPicker.tsx            ← pour Domaine.couleur + EvenementEDT.couleur
    RichTextarea.tsx           ← TipTap simplifié (descriptions longues)
```

---

## SECTION 5 — Structure fichiers Next.js App Router

```
app/
  layout.tsx                   ← lang="fr", skip link, font loading
  template.tsx                 ← AnimatePresence transition entre pages
  page.tsx                     ← Landing /

  projets/
    page.tsx                   ← /projets
    [slug]/page.tsx            ← /projets/[slug]

  publications/
    page.tsx                   ← /publications
    [slug]/page.tsx            ← /publications/[slug]

  contact/
    page.tsx                   ← /contact (standalone)

  login/
    page.tsx                   ← /login (standalone)

  dashboard/
    layout.tsx                 ← DashboardShell (sidebar + topbar)
    page.tsx                   ← /dashboard
    profil/page.tsx
    experiences/page.tsx
    formations/page.tsx
    certifications/page.tsx
    competences/page.tsx
    domaines/page.tsx
    publications/
      page.tsx
      new/page.tsx             ← EditorPage (sidebar auto-collapsée)
      [id]/edit/page.tsx
    projets/
      page.tsx
      new/page.tsx
      [id]/edit/page.tsx
    edt/page.tsx
    rappels/page.tsx
    ressources/page.tsx
    commentaires/page.tsx
    messages/page.tsx
    notifications/page.tsx
    statistiques/page.tsx

  not-found.tsx                ← 404 standalone
  forbidden.tsx                ← 403 standalone (si middleware rejette)
```

---

## SECTION 6 — Hooks TanStack Query — Nommage canonique

```typescript
// Clés centralisées dans lib/query-keys.ts
export const qk = {
  profile:         () => ['profile'] as const,
  experiences:     () => ['experiences'] as const,
  formations:      () => ['formations'] as const,
  certifications:  () => ['certifications'] as const,
  competences:     () => ['competences'] as const,
  domaines:        () => ['domaines'] as const,
  projets:         (f?: ProjetsFilter) => ['projets', f] as const,
  projet:          (slug: string) => ['projets', slug] as const,
  publications:    (f?: PubFilter) => ['publications', f] as const,
  publication:     (slug: string) => ['publications', slug] as const,
  commentaires:    (pubId?: string) => ['commentaires', pubId] as const,
  messages:        () => ['messages'] as const,
  notifications:   () => ['notifications'] as const,
  ressources:      (f?: RessFilter) => ['ressources', f] as const,
  edt:             () => ['edt'] as const,
  rappels:         () => ['rappels'] as const,
  statistiques:    (p: StatPeriod) => ['statistiques', p] as const,
  vuepage:         (period: string) => ['vuepage', period] as const,
};

// Fichier : hooks/use-[entite].ts pour chaque entité
// Exemples :
//   hooks/use-profil.ts        → useProfile(), useMutateProfile()
//   hooks/use-publications.ts  → usePublications(), usePublication(slug),
//                                useCreatePublication(), useUpdatePublication(),
//                                useDeletePublication(), usePublishPublication()
//   hooks/use-commentaires.ts  → useCommentaires(pubId), useApproveCommentaire(),
//                                useRejectCommentaire()
//   hooks/use-like.ts          → useLike(pubId), useToggleLike() [optimistic]
//   hooks/use-notifications.ts → useNotifications(), useMarkNotificationRead(),
//                                useMarkAllNotificationsRead()
//   hooks/use-edt.ts           → useEdts(), useEdt(id), useCreateEvenement(),
//                                useImportEdt() [upload + PaliGemma]
```

---

## SECTION 7 — Règles anti-patterns

Ces erreurs sont interdites dans ce projet :

```
✗ Afficher un spinner seul pour les listes → utiliser Skeleton
✗ window.confirm() pour les confirmations destructives → utiliser ConfirmDialog
✗ Navbar full-width sur les pages publiques → utiliser FloatingPillNav
✗ Toast sur les likes (optimistic UI suffit)
✗ outline:none sans focus-visible:ring-2 de remplacement
✗ Couleurs hardcodées hors du token system
✗ Pagination numérotée → cursor-based uniquement
✗ Sidebar visible dans l'éditeur de publication → auto-collapsée
✗ Modal pour créer/éditer les entités simples → Drawer latéral
✗ Modal pour créer/éditer projets ou publications complexes → page dédiée
✗ Afficher les commentaires non approuvés côté public
✗ Permettre l'accès /dashboard sans être Proprietaire authentifié
✗ Transitions full-page bloquantes (fond opaque qui cache tout)
```

---

## SECTION 8 — Checklist par page avant livraison

Pour chaque page, valider dans l'ordre :

```
DONNÉES
[ ] Toutes les propriétés de l'entité UML sont affichées ou éditables
[ ] Les relations (ex: Publication *-* Domaine) sont gérées
[ ] Les enums (Niveau, TypeMedia, TypeRessource) sont en select, pas input libre
[ ] Les softDeletes ne sont pas affichés côté public
[ ] Les champs calculés (nombreVues, count likes) viennent bien de l'API

NAVIGATION
[ ] La bonne navigation est utilisée (pill/sidebar/minimal/aucune)
[ ] Le lien actif est mis en évidence (aria-current="page")
[ ] Le retour arrière fonctionne et mène au bon endroit
[ ] Les breadcrumbs (dashboard) reflètent la page courante

ÉTATS
[ ] Skeleton pendant le chargement
[ ] EmptyState si liste vide (avec CTA approprié)
[ ] ErrorState avec bouton Retry
[ ] Toast succès après chaque mutation réussie
[ ] ConfirmDialog avant chaque suppression
[ ] Bouton submit : disabled + aria-busy + texte alternatif

FORMULAIRES
[ ] htmlFor + id sur chaque champ
[ ] name + autoComplete appropriés
[ ] Erreurs API affichées champ par champ (pas juste toast global)
[ ] Enums affichés comme select (pas input)

ACCÈS
[ ] Pages dashboard inaccessibles sans auth (middleware)
[ ] Contenu propriétaire (soft-deleted, brouillons) invisible côté public
```