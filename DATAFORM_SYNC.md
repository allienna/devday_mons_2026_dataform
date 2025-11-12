# Synchronisation avec Dataform dans Google Cloud

## 🎯 Objectif

Connecter votre projet Dataform GitHub à Google Cloud Platform pour exécuter les transformations dans BigQuery.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir:

- ✅ Un projet Google Cloud Platform actif
- ✅ L'API BigQuery activée
- ✅ Les droits suivants sur votre projet GCP:
  - `BigQuery Data Editor`
  - `BigQuery Job User`
  - `Dataform Editor`
- ✅ Le repository GitHub `devday_mons_2026_dataform` accessible

## 🚀 Option 1: Dataform via BigQuery Console (Recommandé)

### Étape 1: Accéder à Dataform

1. Ouvrir la console Google Cloud: https://console.cloud.google.com
2. Sélectionner votre projet GCP
3. Menu Navigation → **BigQuery** → **Dataform**

   Ou accès direct: https://console.cloud.google.com/bigquery/dataform

### Étape 2: Créer un Repository Dataform

1. Cliquer sur **"Create Repository"**

2. Configuration du repository:
   ```
   Repository name: devday-mons-2026-dataform
   Region: europe-west1 (ou votre région préférée)
   ```

3. Cliquer **"Create"**

### Étape 3: Connecter à GitHub

1. Dans votre nouveau repository, cliquer sur **"Connect to Git"**

2. Sélectionner **"GitHub"**

3. **Autoriser Google Cloud**:
   - Une fenêtre GitHub s'ouvre
   - Cliquer "Authorize Google Cloud Platform"
   - Confirmer votre mot de passe si demandé

4. **Sélectionner le repository**:
   ```
   Organization: allienna
   Repository: devday_mons_2026_dataform
   Default branch: main
   ```

5. Cliquer **"Connect"**

### Étape 4: Créer un Workspace

Un workspace est un environnement d'exécution lié à une branche Git.

1. Cliquer sur **"Create Workspace"**

2. Configuration:
   ```
   Workspace name: production
   Git branch: main
   ```

3. Cliquer **"Create"**

### Étape 5: Configurer les Paramètres BigQuery

1. Dans le workspace, aller dans **"Workspace Settings"** (⚙️)

2. **Compilation Configuration**:
   ```json
   {
     "defaultProject": "VOTRE_PROJET_GCP",
     "defaultDataset": "aal_demo_devday_2026",
     "defaultLocation": "europe-west1"
   }
   ```

   ⚠️ **Important**: Remplacer `VOTRE_PROJET_GCP` par votre vrai Project ID

3. **Sauvegarder** les modifications

### Étape 6: Compiler le Projet

1. Dans le workspace, cliquer sur **"Compile"**

2. Vérifier que la compilation réussit:
   - ✅ Pas d'erreurs de syntaxe
   - ✅ Tous les modèles sont détectés
   - ✅ Le DAG de dépendances est généré

### Étape 7: Exécuter les Transformations

1. Cliquer sur **"Start Execution"**

2. **Sélectionner les modèles** (ou tout exécuter):
   - Option 1: **"All actions"** pour tout exécuter
   - Option 2: Sélectionner manuellement les modèles

3. Cliquer **"Start Execution"**

4. **Suivre l'exécution**:
   - Temps réel des logs
   - Status de chaque modèle (running, success, failed)
   - Erreurs détaillées si échec

### Étape 8: Vérifier dans BigQuery

1. Aller dans BigQuery: https://console.cloud.google.com/bigquery

2. Explorer le dataset `aal_demo_devday_2026`:
   ```sql
   -- Lister les tables créées
   SELECT table_name, table_type, creation_time
   FROM `aal_demo_devday_2026.INFORMATION_SCHEMA.TABLES`
   ORDER BY creation_time DESC;
   ```

3. Vérifier les données:
   ```sql
   -- Silver layer
   SELECT * FROM `aal_demo_devday_2026.stg_users` LIMIT 10;

   -- Gold layer
   SELECT * FROM `aal_demo_devday_2026.dim_users_stats` LIMIT 10;
   ```

## 🌳 Gérer Plusieurs Branches (Pour la Démo)

Pour démontrer la progression via les branches step_01, step_02, etc.:

### Créer des Workspaces pour Chaque Branche

1. **Workspace pour step_01**:
   ```
   Workspace name: step-01-first-request
   Git branch: step_01/first_request
   ```

2. **Workspace pour step_02**:
   ```
   Workspace name: step-02-modularization
   Git branch: step_02/modularize_query_with_refs
   ```

3. **Et ainsi de suite** pour step_03, step_04, step_05

### Utilisation Pendant la Démo

1. **Montrer la progression**:
   - Switcher entre workspaces pour montrer l'évolution
   - Exécuter step_01 → résultat simple
   - Exécuter step_04 → avec tests
   - Exécuter main → architecture complète

2. **Compiler sans exécuter** (dry-run):
   - Utile pour montrer le DAG
   - Pas de coût BigQuery
   - Validation syntaxe uniquement

## 🔧 Option 2: Dataform CLI Local (Développement)

### Installation

```bash
# Installer Dataform CLI globalement
npm install -g @dataform/cli

# Vérifier l'installation
dataform --version
```

### Configuration Locale

1. **Créer un fichier de credentials** (ne pas commiter!):

   `.df-credentials.json`:
   ```json
   {
     "projectId": "VOTRE_PROJET_GCP",
     "location": "europe-west1"
   }
   ```

   Ajouter à `.gitignore`:
   ```bash
   echo ".df-credentials.json" >> .gitignore
   ```

2. **Authentification GCP**:
   ```bash
   gcloud auth application-default login
   gcloud config set project VOTRE_PROJET_GCP
   ```

### Commandes CLI Utiles

```bash
# Compiler le projet
dataform compile

# Voir le graphe de dépendances
dataform compile --json | jq '.tables[] | {name, dependencies}'

# Exécuter tous les modèles
dataform run

# Exécuter un modèle spécifique avec dépendances
dataform run --tags stg_users --include-deps

# Exécuter uniquement les tests
dataform test

# Dry-run (compilation sans exécution)
dataform run --dry-run
```

### Workflow Développement Local

```bash
# 1. Développer localement
vi definitions/staging/stackoverflow/stg_users.sqlx

# 2. Compiler pour vérifier syntaxe
dataform compile

# 3. Tester localement
dataform run --tags stg_users

# 4. Commiter et pousser
git add .
git commit -m "Update stg_users model"
git push

# 5. Dataform Cloud pull automatiquement les changements
```

## 🎬 Configuration Spécifique pour la Démo

### Créer un Dataset Dédié

```bash
# Via bq CLI
bq mk --location=europe-west1 --dataset aal_demo_devday_2026

# Ou via console BigQuery UI
```

### Paramètres Recommandés

Dans `dataform.json` (déjà configuré):

```json
{
  "defaultProject": "VOTRE_PROJET_GCP",
  "defaultDataset": "aal_demo_devday_2026",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions",
  "warehouse": "bigquery",
  "defaultDatabase": "VOTRE_PROJET_GCP"
}
```

### Variables d'Environnement (Optionnel)

Pour gérer plusieurs environnements (dev, staging, prod):

1. Créer `environments.json`:
   ```json
   {
     "demo": {
       "defaultDataset": "aal_demo_devday_2026"
     },
     "dev": {
       "defaultDataset": "aal_dev"
     },
     "prod": {
       "defaultDataset": "aal_prod"
     }
   }
   ```

2. Utiliser dans les modèles:
   ```javascript
   config {
     schema: dataform.projectConfig.vars.defaultDataset
   }
   ```

## 📊 Monitoring et Logs

### Dans Dataform Console

1. **Execution History**:
   - Voir toutes les exécutions passées
   - Temps d'exécution de chaque modèle
   - Erreurs et warnings

2. **Logs en Temps Réel**:
   - Pendant l'exécution
   - SQL généré pour chaque modèle
   - Nombre de lignes traitées

### Dans BigQuery

```sql
-- Voir les jobs récents
SELECT
  job_id,
  user_email,
  creation_time,
  statement_type,
  total_bytes_processed,
  total_slot_ms
FROM `region-europe-west1`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
ORDER BY creation_time DESC
LIMIT 100;
```

## 🔐 Sécurité et Permissions

### Service Account (Pour Production)

1. Créer un service account dédié:
   ```bash
   gcloud iam service-accounts create dataform-executor \
     --display-name="Dataform Executor"
   ```

2. Attribuer les rôles:
   ```bash
   gcloud projects add-iam-policy-binding VOTRE_PROJET_GCP \
     --member="serviceAccount:dataform-executor@VOTRE_PROJET_GCP.iam.gserviceaccount.com" \
     --role="roles/bigquery.dataEditor"

   gcloud projects add-iam-policy-binding VOTRE_PROJET_GCP \
     --member="serviceAccount:dataform-executor@VOTRE_PROJET_GCP.iam.gserviceaccount.com" \
     --role="roles/bigquery.jobUser"
   ```

### Permissions Minimales Requises

Pour exécuter Dataform:
- `bigquery.datasets.get`
- `bigquery.tables.create`
- `bigquery.tables.update`
- `bigquery.tables.get`
- `bigquery.jobs.create`

## ⚠️ Troubleshooting

### Erreur: "Permission denied"

```bash
# Vérifier vos permissions
gcloud projects get-iam-policy VOTRE_PROJET_GCP \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:VOTRE_EMAIL"
```

### Erreur: "Table not found"

- Vérifier que les sources publiques sont accessibles:
  ```sql
  SELECT COUNT(*) FROM `bigquery-public-data.stackoverflow.users` LIMIT 1;
  ```

### Erreur: "Compilation failed"

```bash
# Mode verbose pour debug
dataform compile --verbose

# Voir le JSON compilé
dataform compile --json > compiled.json
cat compiled.json | jq '.compilationErrors'
```

### Workspace ne voit pas les changements Git

1. Dans Dataform Console → Workspace Settings
2. Cliquer "Pull from Git"
3. Ou recréer le workspace

## 📚 Ressources Complémentaires

- [Dataform Documentation](https://cloud.google.com/dataform/docs)
- [Dataform Quickstart](https://cloud.google.com/dataform/docs/quickstart)
- [BigQuery Permissions](https://cloud.google.com/bigquery/docs/access-control)
- [Dataform Best Practices](https://cloud.google.com/dataform/docs/best-practices)

## ✅ Checklist de Synchronisation

- [ ] Projet GCP créé et sélectionné
- [ ] API BigQuery activée
- [ ] Repository Dataform créé dans GCP
- [ ] Connexion GitHub établie
- [ ] Workspace créé (au moins `main`)
- [ ] `dataform.json` configuré avec bon Project ID
- [ ] Compilation réussie
- [ ] Première exécution réussie
- [ ] Tables visibles dans BigQuery
- [ ] (Optionnel) Workspaces pour autres branches créés
- [ ] (Optionnel) CLI Dataform installé localement

---

**Une fois synchronisé, tous vos changements Git seront automatiquement disponibles dans Dataform Cloud!** 🚀
