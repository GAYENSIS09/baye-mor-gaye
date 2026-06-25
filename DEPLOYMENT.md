# Guide de déploiement

Guide générique pour déployer le portfolio sur un serveur de production.

## Infrastructure

- **Hébergement** : Serveur Linux (Ubuntu) avec Docker
- **Domaine** : DuckDNS (gratuit) ou autre DNS
- **SSL** : Let's Encrypt (via DNS-01 ou HTTP-01)
- **Services** : nginx, php-fpm, Next.js (standalone), MariaDB

## Prérequis serveur

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Docker Compose plugin
sudo apt-get install -y docker-compose-plugin
```

## Structure attendue

```
~/portfolio/
├── docker-compose.yml
├── .env                    # Secrets (hors git)
├── 01-portfolio-laravel/
├── 02-portfolio-nextJS/
└── docker/
    ├── frontend/Dockerfile
    └── nginx/nginx.conf
```

## Procédure

### 1. Transférer les fichiers

```bash
scp -i "<chemin-vers-cle-ssh>/<cle>.pem" -r <dossier-projet>/ ubuntu@<IP>:/home/ubuntu/portfolio/
```

> Ne pas copier `vendor/`, `node_modules/`, `.git/` (allégé et sécurisé).

### 2. Configurer le domaine et SSL

- Créer un domaine DuckDNS pointant vers l'IP du serveur
- Obtenir un certificat Let's Encrypt via le challenge approprié
- Stocker les certificats dans `/etc/letsencrypt/`

### 3. Configurer `.env` sur le serveur

Variables obligatoires :

| Variable | Exemple |
|---|---|
| `DB_PASSWORD` | Mot de passe base de données |
| `APP_KEY` | Clé Laravel (`php artisan key:generate`) |
| `NEXT_PUBLIC_API_URL` | `https://domaine.tld/api` |
| `NEXT_PUBLIC_OWNER_NOM` | Nom du propriétaire (fallback build) |
| `NEXT_PUBLIC_OWNER_TITRE` | Titre du propriétaire (fallback build) |
| `DUCKDNS_TOKEN` | Token DuckDNS (si utilisation DNS-01) |

> `.env` est dans `.gitignore` — ne jamais le committer.

### 4. Lancer les conteneurs

```bash
cd ~/portfolio
docker compose up -d --build
```

### 5. Exécuter les migrations

```bash
docker compose exec -T php-fpm php artisan migrate:fresh --seed --force
```

### 6. Configurer le renouvellement SSL (cron)

```bash
# Exemple pour DuckDNS — adapter selon le fournisseur DNS
crontab -e
# Ajouter :
*/30 * * * * /chemin/vers/duckdns/duck.sh >/dev/null 2>&1
0 3 * * * docker compose exec -T nginx certbot renew --quiet && docker compose restart nginx
```

## Mise à jour (déploiement incrémental)

```bash
# 1. Transférer seulement les fichiers modifiés
scp -i "<cle>" chemin/fichier ubuntu@<IP>:~/portfolio/chemin/fichier

# 2. Rebuild (si frontend ou Dockerfile modifié)
docker compose build frontend
docker compose up -d --force-recreate frontend

# 3. Redémarrer nginx (si nginx.conf modifié)
docker compose restart nginx

# 4. Migrer (si Laravel modifié)
docker compose exec -T php-fpm php artisan migrate:fresh --seed --force
```

## Vérification

```bash
curl -s -o /dev/null -w "%{http_code}" https://domaine.tld/
curl -s -o /dev/null -w "%{http_code}" https://domaine.tld/api/profile/public
```

## Logs

```bash
docker compose logs --tail=50 <service>
```
