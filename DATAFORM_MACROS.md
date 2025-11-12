# Utilisation des Macros JavaScript dans Dataform

## ⚠️ Problème: "Could not resolve ../../includes/macros"

Cette erreur se produit car **Dataform ne supporte pas `require()` pour importer des fichiers JavaScript** comme on le ferait en Node.js.

## ✅ Solution: Macros Inline dans les Modèles

Dans Dataform, les fonctions JavaScript doivent être définies **directement dans chaque modèle** qui les utilise, dans un bloc `js { }`.

### Exemple Correct

```javascript
config {
  type: "table",
  schema: "dataform"
}

js {
  // Définir les fonctions JavaScript directement ici
  function count_posts_if(type) {
    return `COUNT(DISTINCT IF(posts_all.type = "${type}", posts_all.post_id, NULL))`;
  }

  function last_posted_post(type) {
    return `MAX(IF(posts_all.type = "${type}", posts_all.created_at, NULL))`;
  }
}

-- Maintenant vous pouvez utiliser ces fonctions dans votre SQL
SELECT
  user_id,
  ${count_posts_if('question')} AS question_count,
  ${count_posts_if('answer')} AS answer_count,
  ${last_posted_post('question')} AS last_question_at
FROM users
```

### ❌ Syntaxe Incorrecte (Ne fonctionne pas)

```javascript
// includes/macros.js
module.exports = {
  count_posts_if: function(type) { ... }
};

// definitions/marts/model.sqlx
js {
  const { count_posts_if } = require("../../includes/macros");  // ❌ ERREUR
}
```

## 🔧 Options pour Réutiliser du Code

### Option 1: Copier-Coller les Fonctions (Recommandé pour Simplicité)

Copiez les fonctions dans chaque modèle qui en a besoin.

**Avantages**:
- ✅ Fonctionne immédiatement
- ✅ Pas de dépendances externes
- ✅ Chaque modèle est autonome

**Inconvénients**:
- ❌ Duplication de code
- ❌ Modifications à faire dans plusieurs fichiers

### Option 2: Utiliser des Macros SQL (Approche dbt-like)

Dataform supporte les macros SQL via `includes/*.sqlx`:

**Créer `includes/macros.sqlx`**:
```sql
{
  # Pas de config block pour les includes
}

-- Macro SQL pour compter les posts
-- @param {string} type - Le type de post (question ou answer)
-- @returns {string} SQL fragment
function count_posts_if_sql(type) {
  return `COUNT(DISTINCT IF(type = '${type}', post_id, NULL))`;
}
```

**Utiliser dans un modèle**:
```javascript
SELECT
  user_id,
  ${count_posts_if_sql('question')} AS question_count
FROM posts
```

### Option 3: Utiliser des CTEs Réutilisables

Au lieu de macros, créez des modèles intermédiaires:

**`definitions/intermediate/post_metrics.sqlx`**:
```sql
config {
  type: "view",
  schema: "intermediate"
}

SELECT
  owner_user_id,
  COUNT(DISTINCT IF(type = 'question', post_id, NULL)) AS question_count,
  COUNT(DISTINCT IF(type = 'answer', post_id, NULL)) AS answer_count,
  MAX(IF(type = 'question', created_at, NULL)) AS last_question_at,
  MAX(IF(type = 'answer', created_at, NULL)) AS last_answer_at
FROM ${ref("fct_posts")}
GROUP BY owner_user_id
```

**Utiliser dans votre modèle final**:
```sql
SELECT
  users.user_id,
  metrics.question_count,
  metrics.answer_count
FROM ${ref("stg_users")} AS users
LEFT JOIN ${ref("post_metrics")} AS metrics
  ON users.user_id = metrics.owner_user_id
```

**Avantages**:
- ✅ Pas de duplication
- ✅ Logique testable indépendamment
- ✅ Meilleure performance (pré-calculé)

## 📁 Structure Recommandée

### Pour Votre Projet

```
definitions/
├── staging/          # Silver layer - nettoyage simple
│   └── stg_*.sqlx
│
├── intermediate/     # Transformations intermédiaires réutilisables
│   └── int_*.sqlx
│
└── marts/           # Gold layer - métriques business
    └── dim_*.sqlx
    └── fct_*.sqlx

includes/            # ⚠️ PAS pour les macros JavaScript
└── README.md        # Documentation uniquement
```

## 🎯 Que Faire avec includes/macros.js ?

### Option A: Le Supprimer

```bash
rm includes/macros.js
```

C'était une tentative de reproduire le comportement dbt, mais Dataform fonctionne différemment.

### Option B: Le Garder comme Documentation

Renommer en `includes/macros.md` et l'utiliser comme référence:

```markdown
# Macros JavaScript Disponibles

## count_posts_if(type)

Compte les posts d'un type spécifique.

**Usage**:
```javascript
js {
  function count_posts_if(type) {
    return `COUNT(DISTINCT IF(posts_all.type = "${type}", posts_all.post_id, NULL))`;
  }
}

SELECT ${count_posts_if('question')} AS question_count
```

## last_posted_post(type)

Retourne le timestamp du dernier post d'un type donné.

**Usage**:
```javascript
js {
  function last_posted_post(type) {
    return `MAX(IF(posts_all.type = "${type}", posts_all.created_at, NULL))`;
  }
}

SELECT ${last_posted_post('question')} AS last_question_at
```
```

## 🔍 Alternatives Avancées

### Utiliser des Variables dans dataform.json

Pour des valeurs réutilisables simples:

**`dataform.json`**:
```json
{
  "warehouse": "bigquery",
  "defaultDatabase": "aal-demo-devday-2025",
  "defaultSchema": "dataform",
  "vars": {
    "min_date": "2008-01-01",
    "source_project": "bigquery-public-data"
  }
}
```

**Dans vos modèles**:
```sql
SELECT *
FROM ${ref(dataform.projectConfig.vars.source_project, "stackoverflow", "users")}
WHERE creation_date > '${dataform.projectConfig.vars.min_date}'
```

### Créer des Fonctions JavaScript Globales (Expérimental)

Dataform peut exécuter du JavaScript dans `workflow_settings.yaml` (fonctionnalité avancée):

```yaml
# workflow_settings.yaml
defaultConfig:
  vars:
    global_functions: |
      function formatDate(date) {
        return `FORMAT_TIMESTAMP('%Y-%m-%d', ${date})`;
      }
```

## 📚 Comparaison dbt vs Dataform

| Aspect | dbt | Dataform |
|--------|-----|----------|
| **Macros** | Jinja2 `{% macro %}` | JavaScript `js { }` inline |
| **Imports** | `{% import %}` | ❌ Pas de `require()` |
| **Réutilisabilité** | macros/ directory | Copier-coller ou CTEs |
| **Langage** | Jinja + SQL | JavaScript + SQL |

## ✅ Solution Appliquée au Projet

J'ai mis à jour les modèles pour **définir les fonctions inline**:

### `dim_users_stats.sqlx`

```javascript
js {
  function count_posts_if(type) {
    return `COUNT(DISTINCT IF(posts_all.type = "${type}", posts_all.post_id, NULL))`;
  }

  function last_posted_post(type) {
    return `MAX(IF(posts_all.type = "${type}", posts_all.created_at, NULL))`;
  }
}
```

### `fct_posts.sqlx`

Supprimé le bloc `js { }` car il n'est pas utilisé dans ce modèle.

## 🎓 Bonnes Pratiques

1. **Définir les fonctions là où elles sont utilisées**
   - Chaque modèle contient ses propres fonctions
   - Plus verbeux mais plus clair

2. **Préférer les CTEs pour la logique complexe**
   - Créer des modèles intermédiaires
   - Meilleure testabilité et lisibilité

3. **Documenter les patterns**
   - Garder une doc des fonctions courantes
   - Faciliter le copier-coller

4. **Utiliser des variables pour les constantes**
   - Dans `dataform.json` → `vars`
   - Accessible via `dataform.projectConfig.vars`

## 🐛 Erreurs Courantes et Solutions

### "Could not resolve ../../includes/macros"
**Solution**: Définir les fonctions inline dans le bloc `js { }`

### "Unexpected token 'export'"
**Solution**: Ne pas utiliser `module.exports`, définir directement les fonctions

### "Function not defined"
**Solution**: S'assurer que le bloc `js { }` est avant l'utilisation de `${fonction()}`

### "Cannot use import statement"
**Solution**: Pas d'imports possibles, copier le code nécessaire

## 📖 Ressources

- [Dataform JavaScript Documentation](https://cloud.google.com/dataform/docs/javascript-api)
- [Dataform SQL Templating](https://cloud.google.com/dataform/docs/sql-templating)
- [Migration Guide: dbt to Dataform](https://cloud.google.com/dataform/docs/migrate-from-dbt)

---

**Les modèles ont été corrigés et devraient maintenant compiler sans erreur!** ✅
