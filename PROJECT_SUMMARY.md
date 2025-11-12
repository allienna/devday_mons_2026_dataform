# Résumé du Projet Dataform - DevDay Mons 2026

## 📁 Structure du Projet

```
devday_mons_2026_dataform/
├── 📄 README.md                    # Documentation architecture Lakehouse
├── 📄 SETUP.md                     # Guide d'installation et configuration
├── 📄 DEMO_GUIDE.md               # Scénario de présentation détaillé
├── 📄 dataform.json               # Configuration Dataform/BigQuery
├── 📄 package.json                # Dépendances npm
│
├── 📂 definitions/
│   ├── 📂 sources/
│   │   └── stackoverflow.js       # 🔶 Bronze: Sources externes déclarées
│   │
│   ├── 📂 staging/stackoverflow/
│   │   ├── stg_users.sqlx         # 🔷 Silver: Utilisateurs nettoyés
│   │   ├── stg_badges.sqlx        # 🔷 Silver: Badges standardisés
│   │   ├── stg_posts_questions.sqlx  # 🔷 Silver: Questions typées
│   │   └── stg_posts_answers.sqlx    # 🔷 Silver: Réponses typées
│   │
│   ├── 📂 marts/core/
│   │   ├── fct_posts.sqlx         # 🔶 Gold: Fact table posts unifiés
│   │   └── dim_users_stats.sqlx   # 🔶 Gold: Dimension métriques users
│   │
│   └── 📂 assertions/
│       └── assert_dim_users_stats_badge_count_is_valid.sqlx  # Tests qualité
│
└── 📂 includes/
    └── macros.js                  # Fonctions JavaScript réutilisables
```

## 🌳 Branches Git (Progression Pédagogique)

| Branche | Objectif | Modèles |
|---------|----------|---------|
| `main` | Architecture complète | Tous les layers avec optimisations |
| `step_01/first_request` | Première requête simple | 1 view directe sur Bronze |
| `step_02/modularize_query_with_refs` | Modularisation Bronze→Silver→Gold | staging + marts basiques |
| `step_03/modularize_query_with_refs_and_sources` | Sources déclaratives | Ajout descriptions sources |
| `step_04/testing` | Tests et qualité | + Assertions et validations |
| `step_05/documentation` | Documentation complète | + Métadonnées catalog |

## 🎯 Points Clés de l'Architecture

### Lakehouse Medallion Pattern

**🔶 Bronze Layer** (`definitions/sources/`)
- Données brutes sans transformation
- Sources publiques BigQuery (StackOverflow)
- Point d'entrée unique pour la data

**🔷 Silver Layer** (`definitions/staging/`)
- Nettoyage et standardisation
- Renommage colonnes, calculs simples
- Matérialisé en VIEWS (pas de duplication)

**🔶 Gold Layer** (`definitions/marts/`)
- Tables analytiques business-ready
- Agrégations et métriques complexes
- Optimisations: partitionnement + clustering
- Matérialisé en TABLES (performance)

### Fonctionnalités Dataform Démontrées

1. **Modularité et DAG**
   - `${ref("model")}` crée les dépendances automatiques
   - Ordre d'exécution géré par Dataform

2. **Optimisations BigQuery**
   ```javascript
   bigquery: {
     partitionBy: "DATE(created_at)",
     clusterBy: ["type", "owner_user_id"]
   }
   ```

3. **Réutilisabilité Code**
   - Macros JavaScript dans `includes/macros.js`
   - Logique partagée entre modèles

4. **Data Quality**
   - Assertions intégrées (uniqueKey, nonNull)
   - Tests métier personnalisés
   - Validation automatisée

5. **Documentation**
   - Descriptions inline des modèles
   - Métadonnées colonnes
   - Génération catalog automatique

## 📊 Dataset: StackOverflow Public Data

**Source**: `bigquery-public-data.stackoverflow`

**Tables utilisées**:
- `users` - Profils utilisateurs
- `badges` - Badges gagnés
- `posts_questions` - Questions postées
- `posts_answers` - Réponses apportées

**Use Case**: Analyser l'engagement des utilisateurs StackOverflow via métriques agrégées (badges, posts, ancienneté)

## 🚀 Quick Start

```bash
# Installation
cd devday_mons_2026_dataform
npm install

# Configuration (éditer avec vos credentials GCP)
vi dataform.json

# Compilation (vérification syntaxe)
dataform compile

# Exécution (via Dataform Console recommandé)
# https://console.cloud.google.com/bigquery/dataform
```

## 📖 Commandes Utiles

```bash
# Changer de branche pour voir la progression
git checkout step_01/first_request
git checkout step_02/modularize_query_with_refs
git checkout step_04/testing

# Voir le graphe de dépendances
dataform compile --json | jq '.tables[] | {name, dependencies}'

# Lister tous les modèles
dataform compile --json | jq '.tables[].name'
```

## 🎓 Ordre de Lecture Recommandé

Pour comprendre le projet:

1. **README.md** - Comprendre l'architecture Lakehouse
2. **definitions/sources/stackoverflow.js** - Bronze layer
3. **definitions/staging/stackoverflow/*.sqlx** - Silver layer
4. **definitions/marts/core/*.sqlx** - Gold layer
5. **includes/macros.js** - Réutilisabilité du code
6. **definitions/assertions/*.sqlx** - Tests qualité

Pour présenter:

1. **DEMO_GUIDE.md** - Scénario détaillé de présentation
2. **Branches Git step_01 → step_05** - Progression pédagogique

Pour installer:

1. **SETUP.md** - Guide complet d'installation

## 💡 Messages Clés pour la Démo

**Architecture Lakehouse = Data Lake + Data Warehouse**
- Flexibilité du Lake + Performance du Warehouse

**Pattern Medallion = Raffinement Progressif**
- Bronze (Raw) → Silver (Clean) → Gold (Analytics)

**Dataform = Transformation as Code**
- Versionning Git
- DAG automatique
- Tests intégrés
- Documentation inline

**BigQuery Optimizations = Performance + Coûts**
- Partitionnement réduit scan
- Clustering accélère filtres
- Views vs Tables = Storage vs Compute

## 📞 Support

- **Documentation complète**: README.md
- **Installation**: SETUP.md
- **Présentation**: DEMO_GUIDE.md
- **Dataform Docs**: https://cloud.google.com/dataform/docs

---

**Projet créé pour DevDay Mons 2026 - Démonstration Architecture Lakehouse avec Dataform**
