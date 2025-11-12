# DevDay Mons 2026 - Dataform Lakehouse Architecture Demo

## 🎯 Objectif du Projet

Ce projet Dataform démontre l'implémentation d'une **architecture Lakehouse** avec le **pattern Medallion** (Bronze-Silver-Gold) pour la transformation de données StackOverflow dans Google BigQuery.

## 🏗️ Architecture Lakehouse - Pattern Medallion

### Vue d'ensemble

L'architecture Lakehouse combine les avantages des Data Lakes (stockage flexible et économique) et des Data Warehouses (performance et structure). Le pattern Medallion organise les données en trois couches progressives de raffinement :

```
┌─────────────────────────────────────────────────────────────┐
│                    LAKEHOUSE ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

🔶 BRONZE LAYER (Raw Data)
   └─► bigquery-public-data.stackoverflow.*
       │
       ├─► users (table brute)
       ├─► badges (table brute)
       ├─► posts_questions (table brute)
       └─► posts_answers (table brute)

🔷 SILVER LAYER (Cleaned & Standardized)
   └─► aal_demo_devday_2026.stg_* (views)
       │
       ├─► stg_users (renommage colonnes, calculs simples)
       ├─► stg_badges (standardisation format)
       ├─► stg_posts_questions (typage, filtrage)
       └─► stg_posts_answers (typage, filtrage)

🔶 GOLD LAYER (Business-Ready Analytics)
   └─► aal_demo_devday_2026.* (tables optimisées)
       │
       ├─► fct_posts (partitionné + clustérisé)
       └─► dim_users_stats (métriques agrégées)
```

### 📊 Détail des Couches

#### 🔶 Bronze Layer - Données Brutes
**Localisation**: `definitions/sources/stackoverflow.js`

- **Rôle**: Ingestion des données sources sans transformation
- **Format**: Tables publiques BigQuery (bigquery-public-data)
- **Caractéristiques**:
  - Données "as-is" depuis la source
  - Aucune transformation
  - Point de départ pour toute analyse
  - Historisation complète disponible

**À montrer en démo**:
```sql
-- Interroger directement la couche Bronze
SELECT COUNT(*)
FROM `bigquery-public-data.stackoverflow.users`
WHERE creation_date > '2020-01-01';
```

#### 🔷 Silver Layer - Données Nettoyées
**Localisation**: `definitions/staging/stackoverflow/*.sqlx`

- **Rôle**: Standardisation et nettoyage léger
- **Format**: Views BigQuery
- **Transformations**:
  - Renommage de colonnes (`id` → `user_id`)
  - Casting de types de données
  - Ajout de colonnes calculées (`user_tenure`)
  - Filtrage temporel basique (`creation_date > '2008-01-01'`)
  - Standardisation de format (`'question'` AS type)

**Modèles Silver**:
- `stg_users.sqlx` - Utilisateurs standardisés
- `stg_badges.sqlx` - Badges nettoyés
- `stg_posts_questions.sqlx` - Questions typées
- `stg_posts_answers.sqlx` - Réponses typées

**À montrer en démo**:
```sql
-- Comparer Bronze vs Silver
SELECT * FROM `bigquery-public-data.stackoverflow.users` LIMIT 5;
SELECT * FROM `aal_demo_devday_2026.stg_users` LIMIT 5;
```

#### 🔶 Gold Layer - Données Business-Ready
**Localisation**: `definitions/marts/core/*.sqlx`

- **Rôle**: Tables analytiques prêtes pour le reporting
- **Format**: Tables matérialisées avec optimisations
- **Caractéristiques**:
  - Agrégations complexes
  - Jointures multi-tables
  - Logique métier appliquée
  - **Partitionnement** pour performance (par date)
  - **Clustering** pour optimisation (par colonnes fréquentes)
  - Tests de qualité de données

**Modèles Gold**:

1. **`fct_posts.sqlx`** - Fact Table
   - Combine questions + réponses en une seule table
   - Partitionné par `DATE(created_at)`
   - Clustérisé par `type` et `owner_user_id`
   - Union de deux sources Silver

2. **`dim_users_stats.sqlx`** - Dimension Table
   - Métriques d'engagement utilisateur agrégées
   - Clustérisé par `creation_date` et `user_tenure`
   - Calculs via macros JavaScript réutilisables
   - Tests d'intégrité (unique, not_null)

**À montrer en démo**:
```sql
-- Voir l'impact du partitionnement
SELECT
  DATE(created_at) as date,
  type,
  COUNT(*) as post_count
FROM `aal_demo_devday_2026.fct_posts`
WHERE DATE(created_at) BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 1, 2;

-- Analyser les métriques utilisateur
SELECT
  user_tenure,
  AVG(badge_count) as avg_badges,
  AVG(question_count) as avg_questions
FROM `aal_demo_devday_2026.dim_users_stats`
GROUP BY 1
ORDER BY 1;
```

## 🔧 Structure du Projet

```
devday_mons_2026_dataform/
├── dataform.json              # Configuration du projet
├── package.json               # Dépendances Dataform
│
├── definitions/
│   ├── sources/
│   │   └── stackoverflow.js   # 🔶 Bronze: Déclaration sources
│   │
│   ├── staging/
│   │   └── stackoverflow/     # 🔷 Silver: Modèles de nettoyage
│   │       ├── stg_users.sqlx
│   │       ├── stg_badges.sqlx
│   │       ├── stg_posts_questions.sqlx
│   │       └── stg_posts_answers.sqlx
│   │
│   ├── marts/
│   │   └── core/              # 🔶 Gold: Modèles analytiques
│   │       ├── fct_posts.sqlx
│   │       └── dim_users_stats.sqlx
│   │
│   └── assertions/            # Tests de qualité de données
│       └── assert_dim_users_stats_badge_count_is_valid.sqlx
│
└── includes/
    └── macros.js              # Fonctions JavaScript réutilisables
```

## 🚀 Quick Start

### Prérequis

1. Node.js installé (v16+)
2. Accès à un projet Google Cloud Platform
3. Droits BigQuery configurés

### Installation

```bash
# Cloner le repository
cd devday_mons_2026_dataform

# Installer les dépendances
npm install

# Configurer votre projet GCP
# Éditer dataform.json avec vos credentials
```

### Configuration

Mettre à jour `dataform.json` avec vos informations GCP :

```json
{
  "defaultProject": "votre-projet-gcp",
  "defaultDataset": "aal_demo_devday_2026",
  "defaultLocation": "europe-west1"
}
```

### Commandes Essentielles

```bash
# Compiler le projet (vérifier la syntaxe)
npm run compile

# Voir le graphe de dépendances
dataform compile --json | jq '.tables[] | {name, type, dependencies}'

# Exécuter tous les modèles
dataform run

# Exécuter un modèle spécifique
dataform run --tags stg_users

# Exécuter les tests
npm test
```

## 📖 Branches Git - Évolution Progressive

Le projet est organisé en branches qui montrent une évolution progressive des fonctionnalités, permettant de démontrer chaque concept séparément.

### `main` - Base du Projet
Configuration initiale avec structure complète mais modèles minimaux.

### `step_01/first_request` - Première Requête Simple
**Concepts démontrés**:
- Déclaration de source Bronze
- Première transformation Silver basique
- Exécution d'une requête simple

**À montrer**:
```bash
git checkout step_01/first_request
dataform run
```

### `step_02/modularize_query_with_refs` - Modularisation avec Références
**Concepts démontrés**:
- Pattern de référencement entre modèles (`${ref("model")}`)
- Séparation staging vs marts
- Construction du DAG (Directed Acyclic Graph)
- Découpage logique Bronze → Silver → Gold

**À montrer**:
```bash
git checkout step_02/modularize_query_with_refs
dataform compile --json | jq '.tables[].dependencies'
```

### `step_03/modularize_query_with_refs_and_sources` - Sources Déclaratives
**Concepts démontrés**:
- Déclaration formelle des sources externes
- Référencement des sources publiques BigQuery
- Distinction claire Bronze Layer (sources) vs Silver Layer (staging)
- Documentation des origines de données

**À montrer**:
```bash
git checkout step_03/modularize_query_with_refs_and_sources
cat definitions/sources/stackoverflow.js
```

### `step_04/testing` - Tests et Qualité de Données
**Concepts démontrés**:
- Assertions Dataform pour data quality
- Tests d'unicité et non-nullité
- Tests métier personnalisés (badge_count >= 0)
- Validation automatisée du pipeline

**À montrer**:
```bash
git checkout step_04/testing
dataform test
# Montrer l'échec si assertion échoue
```

### `step_05/documentation` - Documentation et Métadonnées
**Concepts démontrés**:
- Documentation inline des modèles
- Description des colonnes
- Génération automatique de catalogue de données
- Métadonnées pour data governance

**À montrer**:
```bash
git checkout step_05/documentation
# Dans BigQuery UI, voir les descriptions automatiques
```

## 🎓 Points Clés à Démontrer en Présentation

### 1. Architecture Lakehouse en Action

**Démonstration**: Comparer les 3 couches côte à côte dans BigQuery Console

```sql
-- Bronze: Données brutes
SELECT id, age, creation_date
FROM `bigquery-public-data.stackoverflow.users`
LIMIT 5;

-- Silver: Données standardisées
SELECT user_id, age, creation_date, user_tenure
FROM `aal_demo_devday_2026.stg_users`
LIMIT 5;

-- Gold: Métriques business
SELECT user_id, badge_count, question_count, answer_count
FROM `aal_demo_devday_2026.dim_users_stats`
LIMIT 5;
```

**Points à souligner**:
- Bronze = pas de transformation, source de vérité
- Silver = léger nettoyage, colonnes renommées, user_tenure calculé
- Gold = agrégations lourdes, joins multiples, optimisations performance

### 2. Performance avec Partitionnement et Clustering

**Démonstration**: Expliquer l'optimisation de `fct_posts`

```sql
-- Configuration dans fct_posts.sqlx
bigquery: {
  partitionBy: "DATE(created_at)",  -- Partitionnement
  clusterBy: ["type", "owner_user_id"]  -- Clustering
}
```

**Montrer l'impact**:
```sql
-- Requête optimisée (scan réduit grâce au partitionnement)
SELECT COUNT(*)
FROM `aal_demo_devday_2026.fct_posts`
WHERE DATE(created_at) = '2024-01-15'  -- Utilise partition
AND type = 'question';  -- Utilise cluster
```

**Points à souligner**:
- Partitionnement réduit les données scannées (économie coûts)
- Clustering améliore performance des filtres fréquents
- BigQuery montre les octets traités dans l'UI

### 3. Réutilisabilité avec Macros JavaScript

**Démonstration**: Montrer `includes/macros.js` et son utilisation

```javascript
// Définition dans macros.js
function count_posts_if(type) {
  return `COUNT(DISTINCT IF(posts_all.type = "${type}", posts_all.post_id, NULL))`;
}

// Utilisation dans dim_users_stats.sqlx
${count_posts_if('question')} AS question_count,
${count_posts_if('answer')} AS answer_count
```

**Points à souligner**:
- DRY principle (Don't Repeat Yourself)
- JavaScript natif, pas de syntaxe template complexe
- Facilite maintenance et évolutions

### 4. Qualité de Données avec Assertions

**Démonstration**: Exécuter les tests et montrer un échec intentionnel

```bash
# Tests passent normalement
dataform test

# Modifier temporairement dim_users_stats pour créer erreur
# Relancer test pour montrer l'échec
dataform test
```

**Points à souligner**:
- Tests automatisés dans le pipeline
- Détection précoce d'anomalies de données
- Confiance dans la qualité des données Gold

### 5. Lineage et Graphe de Dépendances

**Démonstration**: Visualiser le DAG complet

```bash
dataform compile --json | jq '.tables[] | {name, type, dependencies}'
```

**Résultat attendu**:
```
stg_users (view) → dim_users_stats (table)
stg_badges (view) → dim_users_stats (table)
fct_posts (table) → dim_users_stats (table)
stg_posts_questions (view) → fct_posts (table)
stg_posts_answers (view) → fct_posts (table)
```

**Points à souligner**:
- Dataform gère automatiquement l'ordre d'exécution
- Impact analysis: modification d'un modèle upstream affecte downstream
- Visualisation claire de la data lineage

## 🎯 Scénario de Démo Recommandé (30 minutes)

### 1. Introduction (5 min)
- Expliquer le besoin: analyser données StackOverflow
- Présenter l'architecture Lakehouse + Medallion pattern
- Montrer le schéma visuel de l'architecture

### 2. Bronze Layer (5 min)
- Montrer les sources publiques dans BigQuery
- Ouvrir `definitions/sources/stackoverflow.js`
- Exécuter une requête Bronze simple

### 3. Silver Layer (7 min)
- Checkout `step_02/modularize_query_with_refs`
- Ouvrir `stg_users.sqlx`
- Comparer données Bronze vs Silver
- Montrer les transformations (renommage, calculs)

### 4. Gold Layer (8 min)
- Ouvrir `dim_users_stats.sqlx` et `fct_posts.sqlx`
- Montrer les configurations de partitionnement/clustering
- Exécuter requêtes analytiques complexes
- Démontrer les macros JavaScript

### 5. Qualité & Tests (5 min)
- Checkout `step_04/testing`
- Exécuter `dataform test`
- Montrer l'assertion dans BigQuery

### 6. Q&A et Discussion

## 📚 Ressources Complémentaires

- [Documentation Dataform](https://cloud.google.com/dataform/docs)
- [Medallion Architecture Explained](https://www.databricks.com/glossary/medallion-architecture)
- [BigQuery Partitioning Best Practices](https://cloud.google.com/bigquery/docs/partitioned-tables)
- [StackOverflow Public Dataset](https://console.cloud.google.com/marketplace/product/stack-exchange/stack-overflow)

## 🤝 Contribution

Pour questions ou suggestions concernant ce projet de démonstration, veuillez ouvrir une issue.

## 📄 License

Ce projet est à but éducatif pour DevDay Mons 2026.

---

**Développé avec ❤️ pour DevDay Mons 2026**
