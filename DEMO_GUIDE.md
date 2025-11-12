# Guide de Démonstration - DevDay Mons 2026

## 🎯 Objectif de la Démo

Illustrer l'architecture Lakehouse avec le pattern Medallion (Bronze-Silver-Gold) en utilisant Dataform et BigQuery, en montrant l'évolution progressive d'un projet de transformation de données.

## ⏱️ Timing (30 minutes)

| Section | Durée | Branche |
|---------|-------|---------|
| 1. Introduction Architecture | 5 min | main |
| 2. Bronze Layer | 4 min | main |
| 3. Silver Layer (Staging) | 6 min | step_02 |
| 4. Gold Layer (Marts) | 8 min | step_02 + main |
| 5. Testing & Quality | 4 min | step_04 |
| 6. Q&A | 3 min | - |

## 📋 Checklist Pré-Démo

### Technique
- [ ] Projet Dataform connecté à BigQuery
- [ ] Données StackOverflow publiques accessibles
- [ ] `npm install` exécuté sur toutes les branches
- [ ] Compilation testée sur branche `main`
- [ ] BigQuery Console ouverte dans un onglet
- [ ] Dataform Console ouverte dans un onglet
- [ ] Terminal prêt avec le bon répertoire

### Présentation
- [ ] Slides de contexte préparés (si applicable)
- [ ] Schéma d'architecture Medallion prêt à montrer
- [ ] Exemples de requêtes SQL copiés
- [ ] Notes des points clés à souligner

## 🎬 Scénario Détaillé

### 1. Introduction (5 min)

**Slide/Contexte**: Expliquer le besoin

> "Nous avons des données StackOverflow brutes et nous voulons créer des tableaux analytiques pour comprendre l'engagement des utilisateurs."

**Montrer le schéma architectural**:

```
🔶 BRONZE → 🔷 SILVER → 🔶 GOLD
Raw Data → Clean Data → Analytics
```

**Points clés**:
- Lakehouse = Data Lake + Data Warehouse
- Medallion = 3 couches de raffinement progressif
- Dataform = orchestration des transformations

**Commande**:
```bash
cd devday_mons_2026_dataform
git branch -a  # Montrer la progression par branches
```

---

### 2. Bronze Layer - Données Brutes (4 min)

**Checkout**: `git checkout main`

**Ouvrir**: `definitions/sources/stackoverflow.js`

**Points à montrer**:
```javascript
declare({
  database: "bigquery-public-data",  // ← Dataset public
  schema: "stackoverflow",
  name: "users",
  description: "Raw StackOverflow user profile data"
});
```

**Démonstration dans BigQuery Console**:
```sql
-- Montrer les données brutes (Bronze)
SELECT id, age, creation_date, display_name
FROM `bigquery-public-data.stackoverflow.users`
WHERE creation_date > '2020-01-01'
LIMIT 10;
```

**Points clés à souligner**:
- ✅ Données "as-is" sans transformation
- ✅ Source de vérité
- ✅ Historique complet disponible
- ❌ Pas optimisé pour analyse
- ❌ Schéma technique, pas business

**Transition**: "Maintenant nettoyons ces données..."

---

### 3. Silver Layer - Données Nettoyées (6 min)

**Checkout**: `git checkout step_02/modularize_query_with_refs`

**Ouvrir**: `definitions/staging/stackoverflow/stg_users.sqlx`

**Points à montrer**:
```sql
SELECT
    id AS user_id,              -- ← Renommage pour clarté
    age,
    creation_date,
    ROUND(TIMESTAMP_DIFF(...)) AS user_tenure  -- ← Calcul métier
FROM
    ${ref("bigquery-public-data", "stackoverflow", "users")}
```

**Démonstration dans BigQuery Console**:
```sql
-- Comparer Bronze vs Silver
-- Bronze (brut)
SELECT id, creation_date FROM `bigquery-public-data.stackoverflow.users` LIMIT 5;

-- Silver (nettoyé)
SELECT user_id, creation_date, user_tenure FROM `aal_demo_devday_2026.stg_users` LIMIT 5;
```

**Points clés à souligner**:
- ✅ Colonnes renommées pour clarté (`id` → `user_id`)
- ✅ Types de données standardisés
- ✅ Calculs métier simples (`user_tenure`)
- ✅ Matérialisé en VIEW (pas de stockage dupliqué)
- ✅ Référencement via `${ref()}` crée le DAG

**Ouvrir**: `definitions/staging/stackoverflow/stg_badges.sqlx`

Montrer la même logique pour les badges.

**Transition**: "Maintenant créons nos tables analytiques..."

---

### 4. Gold Layer - Données Business-Ready (8 min)

**Checkout**: Rester sur `step_02` puis passer à `main` pour version complète

#### 4A. Version Simple (step_02)

**Ouvrir**: `definitions/marts/core/dim_users_stats.sqlx` (version step_02)

```sql
with users as (
    select * from ${ref("stg_users")}  -- ← Réf Silver
),
badges as (
    select * from ${ref("stg_badges")}  -- ← Réf Silver
)
SELECT
    users.user_id,
    COUNT(DISTINCT badges.badge_id) AS badge_count,  -- ← Agrégation
    ...
GROUP BY 1, 2, 3, 4
```

**Points clés**:
- ✅ Join de plusieurs sources Silver
- ✅ Agrégations business
- ✅ Matérialisé en TABLE (performance)

#### 4B. Version Complète avec Optimisations (main)

**Checkout**: `git checkout main`

**Ouvrir**: `definitions/marts/core/fct_posts.sqlx`

**Montrer la configuration**:
```javascript
config {
  type: "table",
  bigquery: {
    partitionBy: "DATE(created_at)",      // ← Partitionnement
    clusterBy: ["type", "owner_user_id"]  // ← Clustering
  }
}
```

**Démonstration Performance dans BigQuery**:
```sql
-- Requête optimisée grâce au partitionnement
SELECT type, COUNT(*) as count
FROM `aal_demo_devday_2026.fct_posts`
WHERE DATE(created_at) = '2024-01-15'  -- ← Utilise partition
  AND type = 'question'                 -- ← Utilise cluster
GROUP BY type;

-- BigQuery affichera "Bytes processed: XXX" (réduit)
```

**Ouvrir**: `definitions/marts/core/dim_users_stats.sqlx` (version complète)

**Montrer les macros JavaScript**:
```javascript
js {
  const { count_posts_if, last_posted_post } = require("../../includes/macros");
}

${count_posts_if('question')} AS question_count,  // ← Macro JS
${count_posts_if('answer')} AS answer_count
```

**Ouvrir**: `includes/macros.js`

```javascript
function count_posts_if(type) {
  return `COUNT(DISTINCT IF(posts_all.type = "${type}", posts_all.post_id, NULL))`;
}
```

**Points clés à souligner**:
- ✅ **Partitionnement**: réduit scan de données (économie + vitesse)
- ✅ **Clustering**: optimise filtres fréquents
- ✅ **Macros JS**: réutilisabilité du code (DRY principle)
- ✅ **Agrégations complexes**: métriques business prêtes pour BI

**Démonstration Finale - Requête Analytique**:
```sql
-- Analyse complète de l'engagement utilisateur (Gold Layer)
SELECT
  user_tenure,
  COUNT(*) as user_count,
  AVG(badge_count) as avg_badges,
  AVG(question_count) as avg_questions,
  AVG(answer_count) as avg_answers
FROM `aal_demo_devday_2026.dim_users_stats`
GROUP BY user_tenure
ORDER BY user_tenure;

-- Résultat: insights business directement exploitables!
```

**Transition**: "Et comment garantir la qualité de ces données?"

---

### 5. Testing & Data Quality (4 min)

**Checkout**: `git checkout step_04/testing`

**Ouvrir**: `definitions/marts/core/dim_users_stats.sqlx`

**Montrer les assertions intégrées**:
```javascript
config {
  assertions: {
    uniqueKey: ["user_id"],  // ← Test d'unicité
    nonNull: ["user_id"]     // ← Test de non-nullité
  }
}
```

**Ouvrir**: `definitions/assertions/assert_dim_users_stats_badge_count_is_valid.sqlx`

**Montrer l'assertion métier**:
```sql
-- Test métier personnalisé
SELECT badge_count
FROM ${ref("dim_users_stats")}
WHERE badge_count < 0  -- ← Ne devrait jamais arriver!
```

**Démonstration**:
```bash
# Dans Dataform Console ou CLI
dataform test

# Résultat attendu: ✅ All tests passed
```

**Points clés à souligner**:
- ✅ Tests automatisés dans le pipeline
- ✅ Validations intégrées (unique, not_null)
- ✅ Tests métier personnalisés
- ✅ Détection précoce d'anomalies
- ✅ Confiance dans les données Gold

---

### 6. Visualisation du DAG et Data Lineage (Bonus si temps)

**Dans Dataform Console**:
- Montrer le graphe de dépendances visuel
- Highlight les chemins: Bronze → Silver → Gold

**Ou via CLI**:
```bash
dataform compile --json | jq '.tables[] | {name, type, dependencies}'
```

**Points clés**:
- ✅ Dataform gère automatiquement l'ordre d'exécution
- ✅ Impact analysis: changement upstream → effets downstream visibles
- ✅ Data lineage complète et auditable

---

## 🎓 Messages Clés à Retenir

### Architecture Lakehouse

1. **Bronze = Raw Data**
   - Données brutes sans transformation
   - Source de vérité
   - Historique complet

2. **Silver = Clean Data**
   - Nettoyage et standardisation
   - Renommage, typage, filtres basiques
   - Base pour réutilisation

3. **Gold = Business-Ready**
   - Agrégations et métriques
   - Optimisations (partitionnement, clustering)
   - Prêt pour BI et reporting

### Bénéfices Dataform

- **Modularité**: Découpage en modèles réutilisables
- **DAG automatique**: Gestion des dépendances
- **Code comme source**: Versionning Git
- **Tests intégrés**: Qualité de données garantie
- **JavaScript natif**: Pas de syntaxe propriétaire

### Performance BigQuery

- **Partitionnement**: Scan réduit = coûts réduits
- **Clustering**: Requêtes filtrées plus rapides
- **Views vs Tables**: Trade-off storage/compute

## 💡 Questions Fréquentes

### "Pourquoi 3 couches et pas 2?"

> Le pattern Medallion permet une séparation claire des responsabilités:
> - Bronze: ingestion sans logique
> - Silver: transformations réutilisables
> - Gold: logique métier spécifique
>
> Cela facilite la maintenance et le debugging.

### "Quelle est la différence entre Dataform et dbt?"

> Similaires dans l'approche (transformation SQL as code), mais:
> - Dataform: JavaScript natif, intégration GCP native
> - dbt: Jinja templating, multi-cloud
> - Les deux suivent le pattern Medallion et le DAG

### "Faut-il toujours 3 couches?"

> Non! Adaptez selon le besoin:
> - Projet simple: Bronze → Gold directement
> - Conformité stricte: Ajoutez une couche Platinum
> - L'important est la clarté, pas le dogme

### "Comment gérer les données sensibles?"

> BigQuery offre:
> - Column-level security (policy tags)
> - Row-level security (RLS)
> - Data masking
> - Dataform peut documenter ces politiques dans les modèles

## 🔍 Ressources Post-Démo

Diriger les participants vers:

1. **README.md**: Architecture détaillée et concepts
2. **SETUP.md**: Installation et configuration
3. **Branches Git**: Explorer la progression step-by-step
4. **Documentation Dataform**: https://cloud.google.com/dataform/docs
5. **StackOverflow Dataset**: https://console.cloud.google.com/marketplace/product/stack-exchange/stack-overflow

## 📝 Notes de Présentation

### Ce qu'il faut FAIRE:
- ✅ Montrer du code réel, pas juste des slides
- ✅ Exécuter des requêtes dans BigQuery Console
- ✅ Expliquer le "pourquoi", pas juste le "comment"
- ✅ Utiliser des exemples concrets (engagement utilisateur)
- ✅ Montrer les bénéfices business, pas juste techniques

### Ce qu'il faut ÉVITER:
- ❌ Passer trop de temps sur la configuration
- ❌ Montrer des erreurs non préparées
- ❌ Jargon technique sans explication
- ❌ Aller trop vite dans les explications
- ❌ Ignorer les questions pour "tenir le timing"

## 🎯 Adaptations Possibles

### Version courte (15 min):
- Sauter step_01 et step_03
- Aller directement: Bronze → Silver (step_02) → Gold (main) → Tests (step_04)

### Version longue (45 min):
- Ajouter live coding d'un nouveau modèle
- Montrer la création d'une nouvelle métrique
- Debugging d'un test qui échoue
- Intégration avec un outil BI (Looker/Data Studio)

### Version workshop (90 min):
- Participants suivent en live
- Exercices guidés sur chaque branche
- Challenge: créer leur propre métrique Gold

---

**Bonne présentation! 🚀**
