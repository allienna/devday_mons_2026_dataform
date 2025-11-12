# Configuration Dataform - dataform.json

## 📋 Format Correct selon Documentation Officielle

Le fichier `dataform.json` doit utiliser la nomenclature BigQuery standard:

```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions"
}
```

## 🔑 Explication des Paramètres

### `warehouse`
- **Valeur**: `"bigquery"`
- **Description**: Type de data warehouse utilisé
- **Requis**: Oui

### `defaultDatabase`
- **Valeur**: Votre **Project ID** GCP
- **Description**: Le projet Google Cloud où seront créées les tables
- **Nomenclature BigQuery**: `project_id`
- **Exemple**: `"aal-demo-devday-2025"` ou `"mon-projet-gcp-12345"`

⚠️ **Important**: Utilisez le **Project ID**, pas le Project Name!

Pour trouver votre Project ID:
```bash
gcloud config get-value project
```

### `defaultSchema`
- **Valeur**: Nom du dataset BigQuery
- **Description**: Le dataset où seront créées les tables par défaut
- **Nomenclature BigQuery**: `dataset_name`
- **Exemple**: `"dataform"`, `"analytics"`, `"dwh"`

💡 **Note**: En BigQuery, un "schema" = un "dataset"

### `defaultLocation`
- **Valeur**: Région géographique
- **Description**: Localisation des données dans BigQuery
- **Options courantes**:
  - `"europe-west1"` (Belgique)
  - `"europe-west9"` (Paris)
  - `"US"` (Multi-région US)
  - `"EU"` (Multi-région Europe)

### `assertionSchema`
- **Valeur**: Dataset pour les tests/assertions
- **Description**: Où Dataform stocke les résultats des tests
- **Recommandé**: `"dataform_assertions"` (séparé du schéma principal)

## 🎯 Nomenclature BigQuery vs Dataform

### Correspondance des Termes

| BigQuery | Dataform | Exemple |
|----------|----------|---------|
| Project | Database | `aal-demo-devday-2025` |
| Dataset | Schema | `dataform` |
| Table | Table | `dim_users_stats` |

### Fully Qualified Name

En BigQuery, une table complète s'écrit:
```
project_id.dataset_name.table_name
```

Avec votre configuration:
```
aal-demo-devday-2025.dataform.dim_users_stats
```

## 📝 Configurations pour Différents Environnements

### Configuration pour Démo (Actuelle)

```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions"
}
```

**Résultat**:
- Tables créées dans: `aal-demo-devday-2025.dataform.*`
- Tests créés dans: `aal-demo-devday-2025.dataform_assertions.*`

### Configuration Multi-Environnement

Si vous voulez séparer dev/staging/prod:

#### Développement
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform_dev",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_dev_assertions"
}
```

#### Staging
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform_staging",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_staging_assertions"
}
```

#### Production
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform_prod",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_prod_assertions"
}
```

## 🌳 Configuration par Branche (Pour Démo Progressive)

Si vous voulez isoler chaque step de la démo:

### Branche `main`
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions"
}
```

### Branche `step_01/first_request`
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "demo_step_01",
  "defaultLocation": "europe-west1",
  "assertionSchema": "demo_step_01_assertions"
}
```

### Branche `step_02/modularize_query_with_refs`
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "demo_step_02",
  "defaultLocation": "europe-west1",
  "assertionSchema": "demo_step_02_assertions"
}
```

### Avantages de l'Isolation

✅ Chaque workspace crée ses tables dans un dataset séparé
✅ Pas de conflit entre les différentes étapes
✅ Possibilité de comparer les résultats
✅ Nettoyage facile après la démo

## 🔧 Paramètres Avancés (Optionnels)

### Ajouter des Variables Personnalisées

```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions",
  "vars": {
    "env": "demo",
    "version": "1.0.0",
    "source_project": "bigquery-public-data"
  }
}
```

Utilisation dans les modèles:
```javascript
config {
  schema: dataform.projectConfig.vars.env === "prod"
    ? "dataform_prod"
    : "dataform_dev"
}
```

### Configuration de Compilation

```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions",
  "compilerConfig": {
    "schemaSuffix": "_dev",
    "tablePrefix": "v1_"
  }
}
```

## 📊 Vérification de la Configuration

### Après avoir modifié `dataform.json`

1. **Commit et push vers GitHub**:
   ```bash
   git add dataform.json
   git commit -m "Update dataform.json with correct schema naming"
   git push
   ```

2. **Dans Dataform Console**:
   - Ouvrir votre workspace
   - Cliquer "Pull from Git" pour récupérer les changements
   - Compiler pour vérifier

3. **Vérifier la compilation**:
   ```bash
   # En local avec CLI
   dataform compile --json | jq '.tables[] | .target'
   ```

   Devrait montrer:
   ```json
   {
     "database": "aal-demo-devday-2025",
     "schema": "dataform",
     "name": "dim_users_stats"
   }
   ```

### Créer les Datasets dans BigQuery

Avant la première exécution:

```bash
# Créer le dataset principal
bq mk --location=europe-west1 --dataset aal-demo-devday-2025:dataform

# Créer le dataset pour les assertions
bq mk --location=europe-west1 --dataset aal-demo-devday-2025:dataform_assertions
```

Ou via Console BigQuery:
1. Aller sur https://console.cloud.google.com/bigquery
2. Cliquer sur votre projet
3. Cliquer "CREATE DATASET"
4. Configuration:
   - Dataset ID: `dataform`
   - Location: `europe-west1`
5. Répéter pour `dataform_assertions`

## ⚠️ Erreurs Courantes

### Erreur: "Dataset not found"

**Cause**: Le dataset n'existe pas dans BigQuery

**Solution**:
```bash
bq mk --location=europe-west1 --dataset aal-demo-devday-2025:dataform
```

### Erreur: "Invalid project ID"

**Cause**: `defaultDatabase` ne correspond pas au vrai Project ID

**Solution**:
```bash
# Vérifier votre Project ID
gcloud config get-value project

# Utiliser ce Project ID exact dans dataform.json
```

### Erreur: "Location mismatch"

**Cause**: Le dataset existe dans une autre région

**Solution**:
```bash
# Vérifier la location du dataset
bq show aal-demo-devday-2025:dataform

# Recréer dans la bonne région ou changer defaultLocation
```

### Warning: "Using deprecated field 'defaultProject'"

**Cause**: Ancienne nomenclature utilisée

**Solution**: Utiliser `defaultDatabase` au lieu de `defaultProject`

## 📚 Références Documentation

- [Dataform Configuration Reference](https://cloud.google.com/dataform/docs/configure-project)
- [BigQuery Locations](https://cloud.google.com/bigquery/docs/locations)
- [BigQuery Datasets](https://cloud.google.com/bigquery/docs/datasets-intro)

## ✅ Checklist de Configuration

- [ ] `warehouse` = `"bigquery"`
- [ ] `defaultDatabase` = Project ID GCP correct
- [ ] `defaultSchema` = Nom du dataset souhaité
- [ ] `defaultLocation` = Région correcte
- [ ] `assertionSchema` = Dataset pour tests
- [ ] Datasets créés dans BigQuery
- [ ] Commit et push vers GitHub
- [ ] Pull from Git dans workspaces Dataform
- [ ] Compilation réussie

## 🎯 Configuration Recommandée pour Votre Démo

```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "defaultLocation": "europe-west1",
  "assertionSchema": "dataform_assertions"
}
```

**Résultat**:
- Tables principales: `aal-demo-devday-2025.dataform.*`
- Tests: `aal-demo-devday-2025.dataform_assertions.*`
- Localisation: Europe (Belgique)

---

**La configuration est maintenant conforme à la documentation officielle Dataform!** 🎯
