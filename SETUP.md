# Configuration et Installation

## Prérequis

1. **Node.js** (v16 ou supérieur)
   ```bash
   node --version  # Vérifier la version
   ```

2. **Compte Google Cloud Platform** avec:
   - Projet GCP créé
   - API BigQuery activée
   - Droits d'accès configurés

3. **Dataform CLI** (optionnel pour développement local)
   ```bash
   npm install -g @dataform/cli
   ```

## Installation du Projet

### 1. Cloner et Installer les Dépendances

```bash
# Cloner le repository
git clone <votre-repo>
cd devday_mons_2026_dataform

# Installer les dépendances npm
npm install
```

### 2. Configurer Google Cloud

#### Option A: Via Dataform Web UI (Recommandé pour la démo)

1. Aller sur [Dataform Console](https://console.cloud.google.com/bigquery/dataform)
2. Créer un nouveau repository
3. Connecter à votre repository Git
4. Configurer les credentials BigQuery

#### Option B: Via CLI Local (Pour développement)

1. Installer le CLI Dataform globalement:
   ```bash
   npm install -g @dataform/cli
   ```

2. Initialiser les credentials:
   ```bash
   # Se connecter à GCP
   gcloud auth application-default login

   # Définir le projet par défaut
   gcloud config set project VOTRE_PROJET_GCP
   ```

3. Mettre à jour `dataform.json` avec vos informations:
   ```json
   {
     "defaultProject": "votre-projet-gcp",
     "defaultDataset": "aal_demo_devday_2026",
     "defaultLocation": "europe-west1"
   }
   ```

### 3. Vérifier la Configuration

```bash
# Compiler le projet (vérifier syntaxe)
dataform compile

# Lister tous les modèles et leurs dépendances
dataform compile --json | jq '.tables[] | {name, type, dependencies}'
```

## Structure des Branches

Le projet est organisé en branches progressives pour la démonstration:

```bash
# Voir toutes les branches
git branch -a

# Changer de branche
git checkout step_01/first_request
git checkout step_02/modularize_query_with_refs
git checkout step_03/modularize_query_with_refs_and_sources
git checkout step_04/testing
git checkout step_05/documentation
```

### Progression des Branches

| Branche | Description | Concepts |
|---------|-------------|----------|
| `main` | Architecture complète | Tous les layers |
| `step_01/first_request` | Requête simple | Bronze → Query directe |
| `step_02/modularize_query_with_refs` | Modularisation | Bronze → Silver → Gold |
| `step_03/modularize_query_with_refs_and_sources` | Sources déclaratives | Declarations formelles |
| `step_04/testing` | Tests qualité | Assertions et validations |
| `step_05/documentation` | Documentation complète | Métadonnées et catalog |

## Exécution

### Développement Local (avec CLI)

```bash
# Compiler uniquement (dry-run)
dataform compile

# Exécuter tous les modèles
dataform run

# Exécuter un modèle spécifique
dataform run --tags stg_users

# Exécuter avec dépendances
dataform run --tags dim_users_stats --include-deps

# Exécuter les tests
dataform test
```

### Via Dataform Web UI (Recommandé pour démo)

1. Ouvrir [Dataform Console](https://console.cloud.google.com/bigquery/dataform)
2. Sélectionner votre workspace
3. Cliquer sur "Start Execution"
4. Choisir les modèles à exécuter
5. Voir les résultats et logs en temps réel

## Vérification dans BigQuery

Après exécution, vérifier les tables créées:

```sql
-- Lister les tables créées
SELECT table_name, table_type, creation_time
FROM `aal_demo_devday_2026.INFORMATION_SCHEMA.TABLES`
ORDER BY creation_time DESC;

-- Vérifier les données Silver
SELECT * FROM `aal_demo_devday_2026.stg_users` LIMIT 10;

-- Vérifier les données Gold
SELECT * FROM `aal_demo_devday_2026.dim_users_stats` LIMIT 10;

-- Analyser les partitions (fct_posts)
SELECT
  _PARTITIONTIME as partition_date,
  COUNT(*) as row_count
FROM `aal_demo_devday_2026.fct_posts`
GROUP BY 1
ORDER BY 1 DESC
LIMIT 10;
```

## Commandes Utiles

### Compilation et Validation

```bash
# Vérifier la syntaxe sans exécution
dataform compile

# Voir le graphe de dépendances
dataform compile --json > compiled.json
cat compiled.json | jq '.tables[] | {name, type, dependencies}'

# Formater les fichiers SQLX
dataform format
```

### Gestion des Dépendances

```bash
# Visualiser les dépendances d'un modèle
dataform compile --json | jq '.tables[] | select(.name == "dim_users_stats") | .dependencies'

# Trouver qui dépend d'un modèle
dataform compile --json | jq '.tables[] | select(.dependencies[] | contains("stg_users"))'
```

### Debug et Troubleshooting

```bash
# Mode verbose pour debug
dataform compile --verbose

# Voir le SQL compilé d'un modèle
dataform compile --json | jq '.tables[] | select(.name == "dim_users_stats") | .query'

# Tester la connexion BigQuery
bq ls --project_id=VOTRE_PROJET
```

## Résolution de Problèmes Courants

### Erreur: "Cannot find module '@dataform/core'"

```bash
# Solution: Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Permission denied" sur BigQuery

```bash
# Solution: Vérifier les credentials
gcloud auth application-default login
gcloud config set project VOTRE_PROJET

# Vérifier les droits IAM nécessaires:
# - BigQuery Data Editor
# - BigQuery Job User
```

### Erreur: "Table not found" lors de l'exécution

```bash
# Solution: Exécuter avec dépendances
dataform run --tags votre_modele --include-deps

# Ou exécuter dans le bon ordre
dataform run --tags stg_users
dataform run --tags dim_users_stats
```

### Compilation réussie mais exécution échoue

```bash
# Vérifier que le projet GCP est correct
cat dataform.json | jq '.defaultProject'

# Vérifier que les sources existent
bq ls bigquery-public-data:stackoverflow

# Tester une requête simple
bq query "SELECT COUNT(*) FROM \`bigquery-public-data.stackoverflow.users\`"
```

## Ressources

- [Documentation Dataform](https://cloud.google.com/dataform/docs)
- [Dataform Core Reference](https://cloud.google.com/dataform/docs/reference/dataform-core)
- [BigQuery Public Datasets](https://cloud.google.com/bigquery/public-data)
- [StackOverflow Dataset Schema](https://console.cloud.google.com/marketplace/product/stack-exchange/stack-overflow)

## Support

Pour toute question ou problème:
1. Vérifier ce guide SETUP.md
2. Consulter le README.md pour l'architecture
3. Ouvrir une issue sur le repository
