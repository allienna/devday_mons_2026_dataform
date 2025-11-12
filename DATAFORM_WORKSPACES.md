# Gestion des Branches dans Dataform via Workspaces

## 🌳 Concept: Workspaces = Branches Git

Dans Dataform, vous ne changez pas de branche directement. À la place, vous créez des **Workspaces**, et chaque workspace est lié à une branche Git spécifique.

```
Workspace "production"     → Git branch "main"
Workspace "step-01"        → Git branch "step_01/first_request"
Workspace "step-02"        → Git branch "step_02/modularize_query_with_refs"
Workspace "development"    → Git branch "dev"
```

## 📋 Créer un Workspace pour Chaque Branche

### Via Dataform Console (Interface Graphique)

#### 1. Accéder à votre Repository Dataform

1. Aller sur: https://console.cloud.google.com/bigquery/dataform
2. Cliquer sur votre repository: `devday-mons-2026-dataform`

#### 2. Créer un Nouveau Workspace

1. Cliquer sur **"Create Workspace"** (ou le bouton ➕)

2. **Configuration du workspace**:
   ```
   Workspace ID: production
   Git branch: main
   ```

3. Cliquer **"Create"**

#### 3. Répéter pour Toutes les Branches de Démo

Pour votre projet, créez ces workspaces:

| Workspace ID | Git Branch | Usage |
|--------------|------------|-------|
| `production` | `main` | Architecture complète |
| `step-01-first-request` | `step_01/first_request` | Première requête simple |
| `step-02-modularization` | `step_02/modularize_query_with_refs` | Modularisation |
| `step-03-sources` | `step_03/modularize_query_with_refs_and_sources` | Sources déclaratives |
| `step-04-testing` | `step_04/testing` | Tests qualité |
| `step-05-documentation` | `step_05/documentation` | Documentation |

### Commandes pour Créer Tous les Workspaces

#### Exemple pour step-01:
```
Workspace ID: step-01-first-request
Git branch: step_01/first_request
```

#### Exemple pour step-02:
```
Workspace ID: step-02-modularization
Git branch: step_02/modularize_query_with_refs
```

Etc.

## 🔄 Changer de Workspace (= Changer de Branche)

### Via Console Dataform

1. **Dans le repository Dataform**, vous verrez la liste de tous vos workspaces

2. **Cliquer sur le workspace** que vous voulez utiliser

3. **Le workspace s'ouvre** et affiche les fichiers de la branche Git correspondante

### Workflow pour la Démo

Pendant votre présentation:

1. **Commencer avec `step-01-first-request`**:
   - Montrer la requête simple
   - Compiler et exécuter
   - Montrer le résultat dans BigQuery

2. **Passer à `step-02-modularization`**:
   - Fermer le workspace actuel
   - Ouvrir `step-02-modularization`
   - Montrer la modularisation Bronze→Silver→Gold
   - Compiler et montrer le DAG

3. **Continuer avec `step-04-testing`**:
   - Ouvrir `step-04-testing`
   - Montrer les assertions
   - Exécuter les tests

4. **Finir avec `production`**:
   - Ouvrir `production` (branche main)
   - Montrer l'architecture complète
   - Exécuter tout le pipeline

## 📁 Structure des Workspaces dans le Repository

Voici à quoi ressemble votre repository avec plusieurs workspaces:

```
devday-mons-2026-dataform (Repository)
│
├── 📂 Workspaces
│   ├── production (main)
│   ├── step-01-first-request (step_01/first_request)
│   ├── step-02-modularization (step_02/modularize_query_with_refs)
│   ├── step-03-sources (step_03/.../sources)
│   ├── step-04-testing (step_04/testing)
│   └── step-05-documentation (step_05/documentation)
│
└── 🔗 Git Connection
    └── github.com/allienna/devday_mons_2026_dataform
```

## 🔧 Opérations sur les Workspaces

### Voir le Code de la Branche

1. Ouvrir le workspace
2. Naviguer dans `definitions/` pour voir les modèles
3. Le code affiché correspond exactement à la branche Git

### Compiler dans un Workspace Spécifique

1. Ouvrir le workspace
2. Cliquer **"Compile"**
3. La compilation utilise le code de la branche Git liée

### Exécuter dans un Workspace Spécifique

1. Ouvrir le workspace
2. Cliquer **"Start Execution"**
3. Les tables sont créées selon la branche Git

⚠️ **Note**: Toutes les branches créent des tables dans le **même dataset** BigQuery par défaut!

## 🎯 Bonnes Pratiques pour la Démo

### Option 1: Utiliser le Même Dataset pour Toutes les Branches

**Avantage**: Simple et rapide
**Inconvénient**: Les branches s'écrasent mutuellement

Configuration (même dataset pour tous):
```json
{
  "defaultDataset": "aal_demo_devday_2026"
}
```

### Option 2: Utiliser un Dataset Différent par Branche (Recommandé)

**Avantage**: Isolation complète, pas de conflit
**Inconvénient**: Plus de configuration

#### Configurer des Datasets Séparés

Pour chaque workspace, modifier `dataform.json`:

**Workspace `step-01-first-request`**:
```json
{
  "defaultProject": "VOTRE_PROJET",
  "defaultDataset": "demo_step_01",
  "defaultLocation": "europe-west1"
}
```

**Workspace `step-02-modularization`**:
```json
{
  "defaultProject": "VOTRE_PROJET",
  "defaultDataset": "demo_step_02",
  "defaultLocation": "europe-west1"
}
```

**Workspace `production`**:
```json
{
  "defaultProject": "VOTRE_PROJET",
  "defaultDataset": "aal_demo_devday_2026",
  "defaultLocation": "europe-west1"
}
```

⚠️ **Important**: Ces modifications doivent être faites dans les branches Git correspondantes, pas dans le workspace!

### Option 3: Utiliser des Variables d'Environnement (Avancé)

Créer `environments.json` dans le repository:

```json
{
  "step01": {
    "defaultDataset": "demo_step_01"
  },
  "step02": {
    "defaultDataset": "demo_step_02"
  },
  "production": {
    "defaultDataset": "aal_demo_devday_2026"
  }
}
```

Puis dans les modèles:
```javascript
config {
  schema: dataform.projectConfig.vars.defaultDataset || "aal_demo_devday_2026"
}
```

## 🔍 Voir les Différences Entre Workspaces

### Comparer les Fichiers

1. Ouvrir `step-01-first-request`
2. Noter les fichiers présents
3. Ouvrir `step-02-modularization`
4. Comparer les fichiers → Plus de modèles dans step-02

### Comparer les DAG (Graphes de Dépendances)

1. Dans chaque workspace, cliquer **"Compile"**
2. Voir le graphe de dépendances généré
3. Comparer la complexité:
   - step-01: Simple, peu de dépendances
   - step-02: Plus complexe avec ref()
   - production: Très complexe avec tout le pipeline

## 🚀 Workflow de Développement avec Workspaces

### Créer une Nouvelle Fonctionnalité

1. **Créer une branche Git localement**:
   ```bash
   git checkout -b feature/new-metric
   git push -u origin feature/new-metric
   ```

2. **Créer un workspace Dataform**:
   ```
   Workspace ID: feature-new-metric
   Git branch: feature/new-metric
   ```

3. **Développer dans le workspace**:
   - Modifier les fichiers dans le workspace
   - Commit et push vers GitHub
   - Tester dans le workspace

4. **Merger la feature**:
   - Créer une Pull Request sur GitHub
   - Merger vers `main`
   - Le workspace `production` voit automatiquement les changements

### Synchroniser un Workspace avec Git

Si vous avez fait des changements sur GitHub:

1. Ouvrir le workspace
2. Cliquer **"Pull from Git"** (bouton de rafraîchissement)
3. Les fichiers sont mis à jour depuis la branche Git

## 📊 Cas d'Usage pour Votre Démo

### Scénario: Montrer la Progression Pédagogique

**Préparation**:
1. Créer les 6 workspaces (step-01 à step-05 + production)
2. Compiler chaque workspace une fois
3. Tester l'exécution de chacun

**Pendant la Démo**:

1. **Introduction** (5 min):
   - Montrer la liste des workspaces
   - Expliquer: "Chaque workspace = une étape"

2. **Step 01** (5 min):
   - Ouvrir `step-01-first-request`
   - Montrer `user_stats_simple.sqlx`
   - Compiler
   - Exécuter
   - Montrer résultat BigQuery

3. **Step 02** (7 min):
   - Ouvrir `step-02-modularization`
   - Montrer `definitions/staging/` et `definitions/marts/`
   - Compiler → montrer DAG plus complexe
   - Exécuter
   - Comparer résultats BigQuery

4. **Step 04** (5 min):
   - Ouvrir `step-04-testing`
   - Montrer `definitions/assertions/`
   - Exécuter avec tests

5. **Production** (8 min):
   - Ouvrir `production`
   - Montrer architecture complète
   - Exécuter pipeline complet
   - Analyser les résultats

## 🔐 Permissions sur les Workspaces

### Qui Peut Voir/Modifier les Workspaces?

Les permissions sont héritées du repository Dataform:

- **Dataform Editor**: Peut créer/modifier/supprimer workspaces
- **Dataform Viewer**: Peut voir les workspaces mais pas les modifier
- **BigQuery Admin**: Nécessaire pour exécuter les transformations

### Partager un Workspace

1. Partager l'accès au repository Dataform
2. L'utilisateur verra tous les workspaces
3. Il peut ouvrir et travailler dans n'importe quel workspace

## ⚠️ Limitations et Pièges à Éviter

### ❌ Ne Pas Faire

1. **Modifier directement dans le workspace sans commit**:
   - Les changements non commités sont perdus
   - Toujours commit et push vers Git

2. **Utiliser le même dataset pour tous les workspaces**:
   - Les exécutions s'écrasent mutuellement
   - Préférer des datasets séparés

3. **Oublier de "Pull from Git"**:
   - Si quelqu'un pousse sur GitHub, votre workspace est obsolète
   - Toujours Pull avant de compiler/exécuter

### ✅ Bonnes Pratiques

1. **Un workspace = une branche = un objectif**
2. **Toujours Pull avant de travailler**
3. **Compiler avant d'exécuter** (vérifier syntaxe)
4. **Utiliser des datasets séparés pour l'isolation**
5. **Nommer clairement les workspaces** (éviter "test", "tmp")

## 🎓 Résumé pour Votre Projet

### Commande Rapide: Créer Tous les Workspaces

Via Console Dataform, créer manuellement:

| Ordre | Workspace ID | Git Branch | Pour Montrer |
|-------|--------------|------------|--------------|
| 1 | `step-01-first-request` | `step_01/first_request` | Requête simple |
| 2 | `step-02-modularization` | `step_02/modularize_query_with_refs` | Modularisation |
| 3 | `step-03-sources` | `step_03/modularize_query_with_refs_and_sources` | Sources |
| 4 | `step-04-testing` | `step_04/testing` | Tests |
| 5 | `step-05-documentation` | `step_05/documentation` | Docs |
| 6 | `production` | `main` | Architecture complète |

### Navigation Rapide Pendant la Démo

```
Repository Dataform
└── Workspaces
    ├── 📂 step-01-first-request    ← Cliquer pour ouvrir
    ├── 📂 step-02-modularization   ← Cliquer pour ouvrir
    ├── 📂 step-04-testing          ← Cliquer pour ouvrir
    └── 📂 production               ← Cliquer pour ouvrir
```

### Checklist Avant Démo

- [ ] 6 workspaces créés
- [ ] Chaque workspace compile sans erreur
- [ ] Exécution testée dans au moins 2 workspaces
- [ ] Datasets BigQuery créés (si séparés)
- [ ] Pull from Git effectué sur tous les workspaces

---

**Les workspaces sont votre outil principal pour naviguer entre les branches et démontrer la progression!** 🌳
