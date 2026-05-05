# Olympe Production — Espace client

Application web où tes clients suivent l'avancement de leurs projets vidéo, valident les étapes et échangent avec toi.

- **Stack** : Next.js 15 (App Router) + TypeScript, Tailwind CSS, Supabase (auth + base + stockage), Resend (emails), Vercel (hébergement + cron).
- **Charte** : tokens repris à l'identique de [fadhula10-hue.github.io/Site-](https://fadhula10-hue.github.io/Site-/) (orange `#F15A24`, fond `#05051A`, Cormorant Garamond + Inter Tight + JetBrains Mono).

---

## 🧭 Sommaire

1. [Première mise en ligne (à faire UNE fois)](#-première-mise-en-ligne-à-faire-une-fois)
2. [Utilisation au quotidien](#-utilisation-au-quotidien)
3. [Configuration des comptes (Supabase / Vercel / Resend)](#-configuration-des-comptes)
4. [Modifier la charte plus tard](#-modifier-la-charte)
5. [Modifier l'heure des relances](#-modifier-lheure-des-relances)
6. [Dépannage](#-dépannage)

---

## 🚀 Première mise en ligne (à faire UNE fois)

Suis ces étapes dans l'ordre. Compte ~30 minutes. Tu n'as pas besoin de coder, juste copier/coller des valeurs.

### 1. Crée tes 3 comptes (gratuits)

- **Supabase** → https://supabase.com (base de données + auth + stockage)
- **Resend** → https://resend.com (emails)
- **Vercel** → https://vercel.com (hébergement) — connecte-le à ton compte GitHub

### 2. Configure Supabase

1. Sur supabase.com, clique **« New project »**.
   - Nom : `olympe-espace-client`
   - Mot de passe DB : génère-en un (note-le quelque part de sûr)
   - Region : `eu-west-3 (Paris)` ou la plus proche de tes clients
2. Une fois le projet créé, va dans **SQL Editor** (icône terminal à gauche).
3. Copie/colle le contenu de `portal/supabase/migrations/0001_initial.sql` → clique **Run**.
4. Idem avec `portal/supabase/migrations/0002_rls.sql` → **Run**.
5. Va dans **Authentication → Users** → **« Add user »** → **« Create new user »** :
   - Email : `contact@olympeproduction.com` (ton email admin)
   - Password : choisis un mot de passe fort
   - Coche **« Auto Confirm User »**
6. Reviens dans **SQL Editor**, ouvre `portal/supabase/migrations/0003_seed_admin.sql`. Vérifie que l'email correspond bien au tien, puis **Run**.
   → Ton compte est maintenant admin.

### 3. Configure Resend

1. Sur resend.com → **Domains → Add domain** → entre `olympeproduction.com`.
2. Resend te donne 3-4 enregistrements DNS (SPF, DKIM, DMARC) à ajouter chez ton registrar (l'endroit où tu as acheté ton nom de domaine).
3. Une fois les DNS validés (ça peut prendre jusqu'à quelques heures), va dans **API Keys** → **Create API Key** → copie la clé.

### 4. Récupère tes clés Supabase

Dans Supabase → **Settings → API** :
- `Project URL` (commence par `https://...supabase.co`)
- `anon public` (la clé publique)
- `service_role secret` (la clé secrète admin — ne JAMAIS la partager)

### 5. Pousse le code sur GitHub

Le code est déjà dans la branche `claude/video-client-portal-Wp2wp` de ton dépôt. Tu peux :
- Soit la mergerver dans `main`
- Soit déployer directement depuis cette branche dans Vercel

### 6. Déploie sur Vercel

1. Sur vercel.com → **« Add New… → Project »** → choisis ton dépôt GitHub.
2. **Important** : dans **Root Directory**, indique `portal` (le projet est dans ce sous-dossier).
3. Avant de cliquer **Deploy**, déroule **Environment Variables** et colle ces clés :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé `anon public` Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` Supabase |
| `RESEND_API_KEY` | clé Resend |
| `EMAIL_FROM` | `Olympe Production <contact@olympeproduction.com>` |
| `EMAIL_REPLY_TO` | `contact@olympeproduction.com` |
| `ADMIN_EMAIL` | `contact@olympeproduction.com` |
| `NEXT_PUBLIC_SITE_URL` | (à remplir après le 1er déploiement, voir étape 7) |
| `CRON_SECRET` | une chaîne aléatoire longue (ex: génère sur https://1password.com/password-generator/) |

4. Clique **Deploy**.

### 7. Finalise l'URL

1. Une fois déployé, copie l'URL Vercel (ex: `https://olympe-espace-client.vercel.app`).
2. Retourne dans **Settings → Environment Variables** sur Vercel et **mets à jour** `NEXT_PUBLIC_SITE_URL` avec cette URL.
3. Dans Supabase → **Authentication → URL Configuration** :
   - **Site URL** : ton URL Vercel
   - **Redirect URLs** : ajoute `https://ton-url.vercel.app/auth/callback`
4. Redéploie depuis Vercel (bouton **Redeploy**).

### 8. Personnalise les emails Supabase (optionnel mais recommandé)

Dans Supabase → **Authentication → Email Templates**, tu peux remplacer les templates par défaut. Mais comme on envoie nos propres emails Olympe via Resend pour la création de compte, ce n'est pas critique.

### 9. Premier test

1. Va sur ton URL Vercel → **Espace administrateur** → connecte-toi avec ton email + mot de passe.
2. **+ Nouveau projet** → remplis (nom, email d'un client de test, deadline, description) → **Créer**.
3. Le client reçoit un email Olympe avec un lien magique. Il clique → arrive sur sa page projet.
4. Côté admin, mets l'avancement à 30%, change l'étape, clique **« Demander Pré-production »**.
5. Le client reçoit l'email de validation, valide → tu reçois la confirmation.

✅ Tout fonctionne.

---

## 🎬 Utilisation au quotidien

### Ajouter un nouveau client / projet

1. Va sur `https://ton-url.vercel.app/admin`
2. Clique **+ Nouveau projet**
3. Remplis le formulaire et clique **Créer**
4. Le client reçoit automatiquement un email de bienvenue avec son lien d'accès — il n'a rien à installer ni de mot de passe à retenir.

### Modifier l'avancement d'un projet

1. Depuis le dashboard admin, clique sur le projet
2. Glisse le curseur d'avancement → **Enregistrer**
3. Le client est notifié par email automatiquement

### Demander la validation d'une étape

1. Sur la page du projet, dans **« Demander la validation au client »**, clique sur l'étape concernée
2. Email immédiat envoyé au client + relances quotidiennes à 09h00 (heure La Réunion) jusqu'à validation
3. Dès que le client valide ou demande des modifications, les relances s'arrêtent automatiquement

### Uploader un fichier ou une vidéo

1. Sur la page du projet, clique **« + Ajouter à [étape] »**
2. Le client reçoit une notif email
3. Le client peut prévisualiser dans son espace (lecteur intégré pour vidéos/images/PDF)

### Voir les commentaires

Le fil de commentaires est visible côté admin et côté client, trié du plus récent au plus ancien. Chaque message envoyé déclenche un email à l'autre partie.

---

## 🔧 Modifier la charte

Si tu changes ta charte un jour, deux fichiers à éditer :

- `portal/tailwind.config.ts` → bloc `colors.op` et `fontFamily`
- `portal/app/globals.css` → bloc `:root` (variables CSS)

Garde les **mêmes valeurs aux deux endroits** pour une cohérence parfaite. Les emails reprennent automatiquement les couleurs depuis `portal/lib/emails/template.ts` — change-les là aussi si besoin.

---

## ⏰ Modifier l'heure des relances

Les relances tournent via un cron Vercel. La planification est dans `portal/vercel.json` :

```json
{ "schedule": "0 5 * * *" }
```

Format : `minute heure * * *` en **UTC**.

La Réunion = UTC+4 (pas de changement d'heure). Donc :
- 09:00 La Réunion → 05:00 UTC → `"0 5 * * *"`
- 10:00 La Réunion → 06:00 UTC → `"0 6 * * *"`
- 08:00 La Réunion → 04:00 UTC → `"0 4 * * *"`

Modifie la valeur, commit + push → Vercel redéploie automatiquement.

---

## 🛠 Dépannage

### Le serveur ne tourne plus / je veux le relancer en local

```bash
cd portal
npm install
cp .env.example .env.local   # remplis tes vraies clés
npm run dev
```

Ouvre http://localhost:3000.

### Un client ne reçoit pas son email

1. Vérifie dans **Resend → Logs** si l'email a bien été envoyé
2. Si non : vérifie ta clé `RESEND_API_KEY` dans Vercel
3. Vérifie que le domaine est bien validé chez Resend (DNS SPF + DKIM verts)
4. Vérifie les spams du client

### Renvoi manuel du lien d'accès

Sur la page admin du projet → **🔗 Renvoyer un lien d'accès au client**.

### Modifier l'email admin

Variable d'environnement `ADMIN_EMAIL` sur Vercel + table `profiles` (rôle `admin`) dans Supabase.

---

## 📁 Structure du projet

```
portal/
├─ app/
│  ├─ admin/              ← interface admin (dashboard, création, gestion)
│  ├─ projet/[id]/        ← espace client
│  ├─ login/              ← connexion client (magic link)
│  ├─ auth/callback/      ← réception du lien magique
│  └─ api/cron/reminders/ ← endpoint appelé par Vercel Cron
├─ components/             ← Logo, Stages, ProgressBar, Header
├─ lib/
│  ├─ supabase/            ← clients Supabase (browser + server + middleware)
│  └─ emails/              ← envoi Resend + template HTML Olympe
├─ supabase/migrations/    ← scripts SQL à exécuter dans Supabase
├─ tailwind.config.ts      ← tokens design Olympe
└─ vercel.json             ← planification cron
```

---

Bonne production 🎬
