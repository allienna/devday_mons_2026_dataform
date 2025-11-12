// Bronze Layer: Raw data sources from public StackOverflow dataset
// This represents the "Bronze" layer in the Medallion architecture
// Data is ingested as-is from external sources without transformations

declare({
  database: "bigquery-public-data",
  schema: "stackoverflow",
  name: "badges"
});

declare({
  database: "bigquery-public-data",
  schema: "stackoverflow",
  name: "posts_answers"
});

declare({
  database: "bigquery-public-data",
  schema: "stackoverflow",
  name: "posts_questions"
});

declare({
  database: "bigquery-public-data",
  schema: "stackoverflow",
  name: "users"
});
