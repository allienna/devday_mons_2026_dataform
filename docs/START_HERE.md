# 🚀 START HERE - DevDay Mons 2026 Dataform Project

## Bienvenue!

Ce projet démontre une **architecture Lakehouse** avec le **pattern Medallion** (Bronze-Silver-Gold) en utilisant **Dataform** et **BigQuery**.

## 📚 Documentation Disponible

Selon votre besoin, consultez:

### 🎯 Pour Présenter / Démo
**→ [DEMO_GUIDE.md](DEMO_GUIDE.md)**
- Scénario de présentation détaillé (30 min)
- Talking points pour chaque section
- Requêtes SQL prêtes à copier-coller
- FAQ et messages clés

### 🏗️ Pour Comprendre l'Architecture
**→ [README.md](README.md)**
- Explication complète du pattern Medallion
- Architecture Bronze → Silver → Gold
- Concepts Lakehouse détaillés
- Bénéfices de l'approche

### ⚙️ Pour Installer et Configurer
**→ [SETUP.md](SETUP.md)**
- Guide d'installation pas à pas
- Configuration GCP/BigQuery
- Commandes de compilation et test
- Troubleshooting des problèmes courants

### 📋 Pour un Aperçu Rapide
**→ [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
- Structure du projet visualisée
- Résumé des branches Git
- Points clés à retenir
- Quick start commands

## 🌳 Branches Git - Progression Pédagogique

Le projet est organisé en **6 branches** qui montrent une évolution progressive:

```
main                                    # Architecture complète (point final)
├── step_01/first_request              # Première requête simple
├── step_02/modularize_query_with_refs # Modularisation Bronze→Silver→Gold
├── step_03/.../sources                # Sources déclaratives avec metadata
├── step_04/testing                    # Tests et qualité de données
└── step_05/documentation              # Documentation complète
```

### Navigation Rapide

```bash
# Voir toutes les branches
git branch -a

# Explorer la progression
git checkout step_01/first_request      # Commencer simple
git checkout step_02/modularize_query_with_refs
git checkout step_04/testing
git checkout main                       # Version complète
```

## 🎓 Parcours d'Apprentissage Recommandé

### 1️⃣ Première Découverte (15 min)
1. Lire [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. `git checkout step_01/first_request`
3. Ouvrir `definitions/marts/core/user_stats_simple.sqlx`
4. Comprendre la requête Bronze → simple view

### 2️⃣ Comprendre l'Architecture (30 min)
1. Lire [README.md](README.md) section "Architecture Lakehouse"
2. `git checkout step_02/modularize_query_with_refs`
3. Explorer:
   - `definitions/sources/stackoverflow.js` (Bronze)
   - `definitions/staging/stackoverflow/*.sqlx` (Silver)
   - `definitions/marts/core/dim_users_stats.sqlx` (Gold)

### 3️⃣ Approfondir les Fonctionnalités (30 min)
1. `git checkout main`
2. Étudier:
   - `includes/macros.js` (réutilisabilité)
   - `definitions/assertions/*.sqlx` (tests qualité)
   - Configurations BigQuery (partitioning, clustering)

### 4️⃣ Préparer une Démo (45 min)
1. Lire [DEMO_GUIDE.md](DEMO_GUIDE.md) intégralement
2. Suivre le scénario étape par étape
3. Tester les requêtes SQL dans BigQuery Console
4. Naviguer entre les branches pendant la démo

## 🚀 Quick Start

### Installation Minimale

```bash
# Cloner le projet
cd devday_mons_2026_dataform

# Installer dépendances
npm install

# Vérifier la structure
tree -L 2 -I node_modules
```

### Configuration GCP (Pour Exécution)

1. Éditer `dataform.json` avec vos credentials:
```json
{
  "defaultProject": "votre-projet-gcp",
  "defaultDataset": "aal_demo_devday_2026",
  "defaultLocation": "europe-west1"
}
```

2. Vérifier l'accès BigQuery:
```bash
bq ls bigquery-public-data:stackoverflow
```

### Compilation (Sans Exécution)

```bash
# Vérifier la syntaxe
npx dataform compile

# Voir les dépendances
npx dataform compile --json | jq '.tables[] | {name, dependencies}'
```

## 📊 Visualisation de l'Architecture

```
┌─────────────────────────────────────────────────────┐
│           LAKEHOUSE MEDALLION ARCHITECTURE          │
└─────────────────────────────────────────────────────┘

🔶 BRONZE LAYER (Sources)
   └─► bigquery-public-data.stackoverflow.*
       ├─► users              (table publique)
       ├─► badges             (table publique)
       ├─► posts_questions    (table publique)
       └─► posts_answers      (table publique)
                ↓

🔷 SILVER LAYER (Staging - Views)
   └─► aal_demo_devday_2026.stg_*
       ├─► stg_users          (renommage + calculs)
       ├─► stg_badges         (standardisation)
       ├─► stg_posts_questions (typage)
       └─► stg_posts_answers  (typage)
                ↓

🔶 GOLD LAYER (Marts - Tables Optimisées)
   └─► aal_demo_devday_2026.*
       ├─► fct_posts          (partitionné + clustérisé)
       └─► dim_users_stats    (métriques agrégées)
```

## 💡 Concepts Clés Démontrés

| Concept | Fichier Exemple | Description |
|---------|-----------------|-------------|
| Bronze Layer | `definitions/sources/stackoverflow.js` | Données brutes sans transformation |
| Silver Layer | `definitions/staging/stackoverflow/stg_users.sqlx` | Nettoyage et standardisation |
| Gold Layer | `definitions/marts/core/dim_users_stats.sqlx` | Métriques business agrégées |
| Partitionnement | `fct_posts.sqlx` ligne 8-10 | Optimisation scan BigQuery |
| Clustering | `fct_posts.sqlx` ligne 11 | Optimisation requêtes filtrées |
| Macros JS | `includes/macros.js` | Réutilisabilité du code |
| Tests Qualité | `definitions/assertions/*.sqlx` | Validation automatisée |
| DAG Automatique | `${ref("model")}` partout | Gestion des dépendances |

## 🎯 Cas d'Usage: Analyse StackOverflow

**Problématique**: Comprendre l'engagement des utilisateurs StackOverflow

**Données Sources**:
- Profils utilisateurs (age, date inscription)
- Badges gagnés (type, date)
- Questions posées (titre, date, auteur)
- Réponses apportées (contenu, date, auteur)

**Transformation**:
1. **Bronze**: Ingestion données publiques BigQuery
2. **Silver**: Nettoyage (renommage, calculs simples)
3. **Gold**: Agrégation métriques (badges, posts, ancienneté)

**Résultat**: Tables prêtes pour dashboard BI montrant l'engagement utilisateur

## 🔧 Commandes Essentielles

```bash
# Navigation branches
git checkout step_01/first_request
git checkout main

# Compilation
npx dataform compile

# Structure projet
tree -L 3 -I node_modules

# Dépendances d'un modèle
npx dataform compile --json | jq '.tables[] | select(.name == "dim_users_stats")'

# Tous les modèles
npx dataform compile --json | jq '.tables[].name'
```

## 📞 Besoin d'Aide?

| Question | Consulter |
|----------|-----------|
| Comment installer? | [SETUP.md](SETUP.md) |
| Comment présenter? | [DEMO_GUIDE.md](DEMO_GUIDE.md) |
| Qu'est-ce que Lakehouse? | [README.md](README.md) Section "Architecture Lakehouse" |
| Structure du projet? | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |
| Erreur compilation? | [SETUP.md](SETUP.md) Section "Résolution de Problèmes" |

## ✅ Checklist Avant Démo

- [ ] npm install exécuté
- [ ] dataform.json configuré avec projet GCP
- [ ] Accès BigQuery vérifié (`bq ls bigquery-public-data:stackoverflow`)
- [ ] Compilation testée (`npx dataform compile`)
- [ ] DEMO_GUIDE.md lu intégralement
- [ ] Requêtes SQL testées dans BigQuery Console
- [ ] Branches Git explorées (step_01 → main)
- [ ] Messages clés mémorisés

## 🎓 Ressources Externes

- [Documentation Dataform](https://cloud.google.com/dataform/docs)
- [Medallion Architecture](https://www.databricks.com/glossary/medallion-architecture)
- [BigQuery Partitioning](https://cloud.google.com/bigquery/docs/partitioned-tables)
- [StackOverflow Public Dataset](https://console.cloud.google.com/marketplace/product/stack-exchange/stack-overflow)

## 🌟 Points Forts du Projet

✨ **Architecture complète** Bronze-Silver-Gold
✨ **Progression pédagogique** via branches Git
✨ **Documentation exhaustive** (4 guides complets)
✨ **Code production-ready** avec tests et optimisations
✨ **Démo-friendly** avec scénario détaillé
✨ **Dataset public** reproductible sans setup complexe

---

**Bon apprentissage et bonne démonstration! 🚀**

*Projet créé pour DevDay Mons 2026*
