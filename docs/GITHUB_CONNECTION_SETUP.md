# Configuration de la Connexion GitHub pour Dataform

## 🔐 Guide Complet de Configuration

Dataform nécessite un secret (Personal Access Token ou SSH Key) pour accéder à votre repository GitHub privé.

## 📋 Informations Nécessaires

Pour votre projet:

```
Remote Git repository URL (HTTPS): https://github.com/allienna/devday_mons_2026_dataform.git
Remote Git repository URL (SSH):   git@github.com:allienna/devday_mons_2026_dataform.git
Default branch:                     main
Service Account:                    service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com
```

## 🎯 Option Recommandée: HTTPS avec Personal Access Token

L'option HTTPS est plus simple et recommandée pour commencer.

### Étape 1: Créer un Personal Access Token GitHub

1. **Aller sur GitHub**:
   - https://github.com/settings/tokens

2. **Cliquer sur "Generate new token" → "Generate new token (classic)"**

3. **Configurer le token**:
   ```
   Note: Dataform Access for devday_mons_2026_dataform
   Expiration: 90 days (ou No expiration pour la démo)

   Scopes à cocher:
   ✅ repo (Full control of private repositories)
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
      ✅ security_events
   ```

4. **Générer et Copier**:
   - Cliquer "Generate token"
   - ⚠️ **IMPORTANT**: Copier le token IMMÉDIATEMENT (il ne sera plus visible)
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Étape 2: Créer un Secret dans Google Secret Manager

#### Via Console GCP (Interface Graphique)

1. **Accéder à Secret Manager**:
   - https://console.cloud.google.com/security/secret-manager

2. **Créer un secret**:
   - Cliquer "CREATE SECRET"

   Configuration:
   ```
   Name: github-dataform-token
   Secret value: [Coller votre Personal Access Token GitHub]
   ```

3. **Cliquer "CREATE SECRET"**

#### Via gcloud CLI (Alternative)

```bash
# Créer le secret avec votre token
echo -n "ghp_votre_token_github_ici" | gcloud secrets create github-dataform-token \
    --data-file=- \
    --replication-policy="automatic"

# Vérifier la création
gcloud secrets list | grep github-dataform-token
```

### Étape 3: Donner les Permissions au Service Account Dataform

Le service account Dataform a besoin d'accéder au secret.

#### Via Console GCP

1. **Dans Secret Manager**, cliquer sur votre secret `github-dataform-token`

2. **Aller dans l'onglet "PERMISSIONS"**

3. **Cliquer "GRANT ACCESS"**

4. **Ajouter le principal**:
   ```
   New principals: service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com
   Role: Secret Manager Secret Accessor
   ```

5. **Cliquer "SAVE"**

#### Via gcloud CLI (Alternative)

```bash
# Donner l'accès au service account Dataform
gcloud secrets add-iam-policy-binding github-dataform-token \
    --member="serviceAccount:service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Vérifier les permissions
gcloud secrets get-iam-policy github-dataform-token
```

### Étape 4: Configurer la Connexion dans Dataform

Retournez dans Dataform Console:

1. **Dans la configuration de connexion Git**, entrer:
   ```
   Connection type: HTTPS

   Remote Git repository URL:
   https://github.com/allienna/devday_mons_2026_dataform.git

   Default branch:
   main

   Secret containing authentication credentials:
   projects/VOTRE_PROJET_GCP/secrets/github-dataform-token/versions/latest
   ```

   Le format complet du secret est:
   ```
   projects/[PROJECT_ID]/secrets/github-dataform-token/versions/latest
   ```

2. **Cliquer "Connect"**

3. **Vérifier la connexion**:
   - Dataform va tester l'accès au repository
   - Si succès ✅: Connexion établie
   - Si échec ❌: Voir section Troubleshooting ci-dessous

## 🔑 Option Alternative: SSH avec Clé Privée

Si vous préférez SSH (plus sécurisé pour production):

### Étape 1: Générer une Paire de Clés SSH

```bash
# Générer une nouvelle clé SSH dédiée à Dataform
ssh-keygen -t ed25519 -C "dataform-access" -f ~/.ssh/dataform_github_key

# Cela crée:
# - ~/.ssh/dataform_github_key (clé privée)
# - ~/.ssh/dataform_github_key.pub (clé publique)
```

### Étape 2: Ajouter la Clé Publique sur GitHub

1. **Copier la clé publique**:
   ```bash
   cat ~/.ssh/dataform_github_key.pub
   ```

2. **Aller sur GitHub**:
   - https://github.com/allienna/devday_mons_2026_dataform/settings/keys

3. **Cliquer "Add deploy key"**:
   ```
   Title: Dataform Access Key
   Key: [Coller le contenu de dataform_github_key.pub]
   ☐ Allow write access (DÉCOCHÉ - lecture seule suffit)
   ```

4. **Cliquer "Add key"**

### Étape 3: Créer le Secret avec la Clé Privée

```bash
# Créer le secret avec la clé privée
gcloud secrets create github-dataform-ssh-key \
    --data-file=~/.ssh/dataform_github_key \
    --replication-policy="automatic"

# Donner accès au service account
gcloud secrets add-iam-policy-binding github-dataform-ssh-key \
    --member="serviceAccount:service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Étape 4: Configurer SSH dans Dataform

```
Connection type: SSH

Remote Git repository URL:
git@github.com:allienna/devday_mons_2026_dataform.git

Default branch:
main

Secret containing authentication credentials:
projects/VOTRE_PROJET_GCP/secrets/github-dataform-ssh-key/versions/latest
```

## 🔍 Vérification de la Configuration

### Tester l'Accès au Secret

```bash
# Vérifier que le secret existe
gcloud secrets describe github-dataform-token

# Voir les versions du secret
gcloud secrets versions list github-dataform-token

# Tester l'accès (en tant que vous)
gcloud secrets versions access latest --secret="github-dataform-token"
```

### Vérifier les Permissions du Service Account

```bash
# Lister les permissions sur le secret
gcloud secrets get-iam-policy github-dataform-token

# Devrait montrer:
# - member: serviceAccount:service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com
#   role: roles/secretmanager.secretAccessor
```

### Tester la Connexion GitHub

```bash
# Vérifier l'accès au repository (depuis votre machine)
git ls-remote https://github.com/allienna/devday_mons_2026_dataform.git

# Devrait lister toutes les branches
```

## ⚠️ Troubleshooting

### Erreur: "Failed to access secret"

**Cause**: Le service account n'a pas les permissions sur le secret

**Solution**:
```bash
# Re-donner les permissions
gcloud secrets add-iam-policy-binding github-dataform-token \
    --member="serviceAccount:service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Vérifier
gcloud secrets get-iam-policy github-dataform-token
```

### Erreur: "Authentication failed"

**Cause**: Le Personal Access Token est invalide ou expiré

**Solution**:
1. Vérifier que le token est correct
2. Créer une nouvelle version du secret:
   ```bash
   echo -n "nouveau_token" | gcloud secrets versions add github-dataform-token --data-file=-
   ```

### Erreur: "Repository not found"

**Cause**: URL incorrecte ou repository privé sans accès

**Solution**:
1. Vérifier l'URL exacte:
   ```bash
   # HTTPS
   https://github.com/allienna/devday_mons_2026_dataform.git

   # SSH
   git@github.com:allienna/devday_mons_2026_dataform.git
   ```

2. Pour repository public, vous pouvez utiliser HTTPS sans token:
   - Créer un secret vide OU
   - Utiliser un token minimal

### Erreur: "Permission denied (publickey)" pour SSH

**Cause**: La clé SSH n'est pas correctement configurée

**Solution**:
1. Vérifier que la clé publique est sur GitHub
2. Vérifier que la clé privée est dans le secret
3. Tester manuellement:
   ```bash
   ssh -T git@github.com -i ~/.ssh/dataform_github_key
   ```

## 💡 Bonnes Pratiques

### Sécurité

1. **Utiliser des scopes minimaux** pour le GitHub token:
   - Pour repository public: `public_repo` suffit
   - Pour repository privé: `repo` complet

2. **Rotation des secrets**:
   ```bash
   # Créer une nouvelle version du secret
   echo -n "nouveau_token" | gcloud secrets versions add github-dataform-token --data-file=-

   # Désactiver l'ancienne version
   gcloud secrets versions disable 1 --secret="github-dataform-token"
   ```

3. **Audit des accès**:
   ```bash
   # Voir qui a accédé au secret
   gcloud logging read "resource.type=secretmanager.googleapis.com/Secret" --limit 50
   ```

### Pour Repository Public (Simplifié)

Si votre repository est **public** (ce qui est le cas ici), vous pouvez:

**Option 1**: Utiliser HTTPS sans authentification
- Créer un secret avec une valeur vide
- Dataform pourra lire le repository public

**Option 2**: Utiliser un token avec scope minimal
- Créer un token avec uniquement `public_repo`
- Plus sûr et permet aussi les push si nécessaire

## 📝 Résumé pour Votre Projet

Voici exactement ce qu'il faut faire:

### Configuration HTTPS (Recommandé)

```bash
# 1. Créer le Personal Access Token sur GitHub
# → https://github.com/settings/tokens
# → Scope: repo (ou public_repo pour repo public)

# 2. Créer le secret dans GCP
echo -n "VOTRE_TOKEN_GITHUB" | gcloud secrets create github-dataform-token \
    --data-file=- \
    --replication-policy="automatic"

# 3. Donner accès au service account Dataform
gcloud secrets add-iam-policy-binding github-dataform-token \
    --member="serviceAccount:service-95028912087@gcp-sa-dataform.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# 4. Dans Dataform Console, utiliser:
# URL: https://github.com/allienna/devday_mons_2026_dataform.git
# Branch: main
# Secret: projects/VOTRE_PROJET_ID/secrets/github-dataform-token/versions/latest
```

### Vérification Rapide

```bash
# Lister vos secrets
gcloud secrets list

# Vérifier les permissions
gcloud secrets get-iam-policy github-dataform-token

# Tester l'accès
gcloud secrets versions access latest --secret="github-dataform-token"
```

## ✅ Checklist

- [ ] Personal Access Token GitHub créé
- [ ] Token copié et sauvegardé temporairement
- [ ] Secret `github-dataform-token` créé dans Secret Manager
- [ ] Permissions `secretAccessor` données au service account Dataform
- [ ] URL repository correcte: `https://github.com/allienna/devday_mons_2026_dataform.git`
- [ ] Default branch: `main`
- [ ] Secret path complet fourni à Dataform
- [ ] Connexion testée avec succès ✅

---

**Une fois configuré, Dataform pourra automatiquement synchroniser avec votre repository GitHub!** 🔐
