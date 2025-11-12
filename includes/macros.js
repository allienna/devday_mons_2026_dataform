// JavaScript macros for Dataform - equivalent to dbt Jinja macros

/**
 * Count posts of a specific type
 * @param {string} type - The post type (question or answer)
 * @returns {string} SQL fragment for counting posts
 */
function count_posts_if(type) {
  return `COUNT(DISTINCT
    IF(posts_all.type = "${type}",
       posts_all.post_id,
       NULL))`;
}

/**
 * Get the last posted timestamp for a specific post type
 * @param {string} type - The post type (question or answer)
 * @returns {string} SQL fragment for max timestamp
 */
function last_posted_post(type) {
  return `MAX(
    IF(posts_all.type = "${type}",
       posts_all.created_at,
       NULL))`;
}

module.exports = {
  count_posts_if,
  last_posted_post
};
