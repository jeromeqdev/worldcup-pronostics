# 🏆 Pronostics Coupe du Monde 2026 — Guide d'installation et déploiement

## Prérequis

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Compte GitHub ([github.com](https://github.com))
- Compte Supabase gratuit ([supabase.com](https://supabase.com))
- Compte Vercel gratuit ([vercel.com](https://vercel.com))

---

## ÉTAPE 1 — Configurer Supabase

### 1.1 Créer le projet

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir un nom (ex: `worldcup-pronostics`), un mot de passe fort, région `West EU`
3. Attendre la création (~2 minutes)

### 1.2 Exécuter le schéma SQL

1. Dans Supabase → **SQL Editor** → **New query**
2. Copier-coller **tout le contenu** du fichier `supabase/migrations/001_initial_schema.sql`
3. Cliquer **Run** (▶)
4. Vérifier qu'il n'y a aucune erreur rouge

### 1.3 Récupérer les clés API

1. Supabase → **Settings** → **API**
2. Noter :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Configurer l'authentification

1. Supabase → **Authentication** → **Providers**
2. **Email** : désactiver "Confirm email" pour les tests (optionnel)

---

## ÉTAPE 2 — Installation locale

```bash
# Cloner ou télécharger le projet
cd worldcup-pronostics

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env.local
```

Éditer `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_CLE_ANON
```

```bash
# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## ÉTAPE 3 — Créer le compte administrateur

1. Aller sur `/auth/register` et créer ton compte
2. Dans Supabase → **Table Editor** → table `profiles`
3. Trouver ton utilisateur et mettre `is_admin` à `true`

---

## ÉTAPE 4 — Pousser sur GitHub

```bash
# Initialiser Git (si pas encore fait)
git init
git add .
git commit -m "feat: initial worldcup pronostics app"

# Créer un repo GitHub (github.com → New repository)
# Puis :
git remote add origin https://github.com/TON-USERNAME/worldcup-pronostics.git
git branch -M main
git push -u origin main
```

---

## ÉTAPE 5 — Déployer sur Vercel

### 5.1 Import du projet

1. Aller sur [vercel.com](https://vercel.com) → **New Project**
2. Importer le repo GitHub `worldcup-pronostics`
3. Framework : **Next.js** (auto-détecté)

### 5.2 Variables d'environnement

Dans Vercel → **Environment Variables**, ajouter :

| Nom | Valeur |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://VOTRE-PROJET.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `VOTRE_CLE_ANON` |

### 5.3 Déployer

Cliquer **Deploy** → attendre ~2 minutes → l'URL est prête !

### 5.4 Déploiements automatiques

Chaque `git push origin main` déclenche automatiquement un nouveau déploiement Vercel.

---

## ÉTAPE 6 — Configuration Supabase pour production

1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL** : `https://votre-app.vercel.app`
3. **Redirect URLs** : ajouter `https://votre-app.vercel.app/**`

---

## Utilisation

### Barème des points

| Résultat | Points |
|----------|--------|
| Score exact (ex: 2-1 prédit, 2-1 réel) | **5 pts** ⭐ |
| Bon vainqueur (score incorrect) | **3 pts** ✅ |
| Bon match nul (score incorrect) | **2 pts** 🔵 |
| Mauvais résultat | **0 pt** ❌ |

### Règles

- Pronostic verrouillé **dès le coup d'envoi**
- Match nul **interdit** en phases éliminatoires
- Classement recalculé **automatiquement** à chaque résultat saisi

### Pages

| URL | Description |
|-----|-------------|
| `/` | Accueil, stats, top 5, prochains matchs |
| `/matches` | Liste tous les matchs par phase |
| `/matches/[id]` | Détail match + saisie pronostic |
| `/ranking` | Classement général complet |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription |
| `/admin` | Dashboard admin |
| `/admin/results` | Saisir les résultats officiels |
| `/admin/users` | Gérer les utilisateurs |
| `/admin/recalculate` | Forcer le recalcul classement |

---

## Architecture technique

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx            # Accueil
│   ├── layout.tsx          # Layout global + Navbar
│   ├── globals.css         # Styles Tailwind
│   ├── auth/               # Login / Register
│   ├── matches/            # Liste + détail matchs
│   ├── ranking/            # Classement
│   └── admin/              # Dashboard admin
├── components/
│   ├── layout/             # Navbar
│   └── predictions/        # Formulaire + liste pronostics
├── hooks/
│   └── useAuth.ts          # Hook d'authentification
├── lib/
│   ├── supabase/           # Clients browser + server
│   └── utils.ts            # Fonctions utilitaires
└── types/
    └── index.ts            # Types TypeScript

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Schéma complet + RLS + triggers
```

---

## Ajouter des matchs

Via Supabase **Table Editor** → table `matches`, ou via l'interface admin `/admin/matches`.

Structure minimale d'un match :
```sql
INSERT INTO public.matches (match_number, phase, home_team_id, away_team_id, stadium_id, kickoff_time)
VALUES (6, 'group', '...uuid...', '...uuid...', '...uuid...', '2026-06-16 21:00:00+00');
```

---

## Support & évolutions possibles

- Notifications email (via Resend + Supabase Edge Functions)
- Pronostics de phase finale (vainqueur du tournoi)
- Mini-leagues entre groupes d'amis
- Application mobile (React Native / Expo)
