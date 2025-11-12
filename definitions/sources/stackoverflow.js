// Step 03: Declarative source definitions
// Bronze Layer: Raw data sources from public StackOverflow dataset
// This represents the "Bronze" layer in the Medallion architecture
// Data is ingested as-is from external sources without transformations

// Formal source declarations make data lineage explicit and improve documentation

declare({
  database: "bigquery-public-data",
  schema: "stackoverflow",
  name: "badges",
  description: "Raw badges awarded to StackOverflow users"
});

declare({
  database: "bigquery-public-data",
  schema: "stackoverflow",
  name: "users",
  description: "Raw StackOverflow user profile data"
});
