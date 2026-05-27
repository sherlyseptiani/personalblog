#!/usr/bin/env node

/**
 * Blogger to Supabase SQL Generator
 * Parses blog_posts.json and generates INSERT statements
 */

const fs = require('fs');
const path = require('path');

// Category remapping for specific posts
const CATEGORY_OVERRIDES = {
  // title substring -> new category
  'A world made of two words': 'language',
  "Why You Should Read Books": 'perspective',
  "Queen Elizabeth II's Diamond Jubilee": 'perspective'
};

// Categories that should be remapped to 'others'
const CATEGORIES_TO_OTHERS = [
  'aviation', 'chinese', 'advertisement', 'british', 'government', 'technology'
];

// Function to get category from tags
// Uses the first tag as the category, with special overrides
function getCategoryFromTags(tags, title) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return 'uncategorized';
  }

  // Check for title-based override first
  for (const [titlePattern, newCategory] of Object.entries(CATEGORY_OVERRIDES)) {
    if (title && title.includes(titlePattern)) {
      return newCategory;
    }
  }

  // Get primary tag (excluding 'slider')
  const primaryTag = tags.find(t => t.toLowerCase() !== 'slider') || tags[0];
  const category = primaryTag.toLowerCase().replace(/\s+/g, '-');

  // Check if it should go to 'others'
  if (CATEGORIES_TO_OTHERS.includes(category)) {
    return 'others';
  }

  return category;
}

// Function to generate excerpt from content
function generateExcerpt(content, maxLength = 200) {
  if (!content) return '';

  // Remove HTML tags
  const textOnly = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (textOnly.length <= maxLength) {
    return textOnly;
  }

  // Try to end at a sentence boundary
  const truncated = textOnly.slice(0, maxLength);
  const lastSentence = truncated.match(/^.+[.!?](?=\s|$)/);

  if (lastSentence) {
    return lastSentence[0];
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

// Function to extract pull quote from content
function extractPullQuote(content) {
  if (!content) return null;

  // Try to find emphasized text (bold, italic, or highlighted)
  const patterns = [
    // <span style="background-color: #...">text</span>
    /<span[^>]*background-color[^>]*>([^<]+)<\/span>/i,
    // <b>text</b> or <strong>text</strong>
    /<(?:b|strong)[^>]*>([^<]+)<\/(?:b|strong)>/i,
    // <em>text</em> or <i>text</i>
    /<(?:em|i)[^>]*>([^<]+)<\/(?:em|i)>/i,
    // First paragraph that's reasonably long
    /<p[^>]*>([^<]{50,200})<\/p>/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim().length > 30) {
      const quote = match[1].trim();
      // Clean up the quote
      return quote
        .replace(/\s+/g, ' ')
        .replace(/^["'"'"]+|["'"'"]+$/g, '')
        .slice(0, 300);
    }
  }

  return null;
}

// Function to calculate read time
function calculateReadTime(content) {
  if (!content) return 5;

  // Remove HTML tags and count words
  const textOnly = content.replace(/<[^>]+>/g, ' ');
  const wordCount = textOnly.split(/\s+/).filter(w => w.length > 0).length;

  // Average reading speed: 200 WPM
  const minutes = Math.ceil(wordCount / 200);

  return Math.max(3, minutes); // Minimum 3 minutes
}

// Function to check if image URL is valid (not broken)
function isValidImageUrl(url) {
  if (!url) return false;

  // Check for common broken image indicators
  const brokenPatterns = [
    /example\.com/,
    /placeholder/,
    /dummy/,
    /fake/,
    /^data:/, // Skip data URIs for now
  ];

  for (const pattern of brokenPatterns) {
    if (pattern.test(url)) return false;
  }

  return url.startsWith('http://') || url.startsWith('https://');
}

// Function to escape SQL string
function escapeSql(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Function to generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Main processing function
function generateSQL() {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'blog_posts.json');
  const outputPath = process.argv[3] || path.join(__dirname, 'blogger_import_complete.sql');

  console.log(`Reading from: ${jsonPath}`);
  console.log(`Writing to: ${outputPath}`);

  // Read and parse JSON
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(jsonContent);

  if (!data.posts || !Array.isArray(data.posts)) {
    throw new Error('Invalid JSON format: expected { posts: [...] }');
  }

  const posts = data.posts;
  console.log(`Found ${posts.length} total posts`);

  // Filter out DRAFT posts
  const livePosts = posts.filter(p => p.status === 'LIVE');
  console.log(`Found ${livePosts.length} LIVE posts (skipping ${posts.length - livePosts.length} DRAFT)`);

  // Generate SQL
  let sql = `-- Blogger to Supabase Migration
-- Generated: ${new Date().toISOString()}
-- Total posts: ${livePosts.length}

BEGIN;

-- Delete existing dummy posts (optional - comment out if you want to keep them)
-- DELETE FROM posts WHERE created_at > NOW() - INTERVAL '30 days';

`;

  let featuredCount = 0;
  const maxFeatured = 3;

  for (let i = 0; i < livePosts.length; i++) {
    const post = livePosts[i];

    // Skip if missing required fields
    if (!post.title || !post.slug) {
      console.warn(`Skipping post with missing title/slug: ${post.blogger_id || 'unknown'}`);
      continue;
    }

    // Determine if featured (first 3 posts)
    const isFeatured = featuredCount < maxFeatured;
    if (isFeatured) featuredCount++;

    // Map fields
    const id = generateUUID();
    const title = post.title;
    const slug = post.slug;
    const content = post.content || '';
    const excerpt = generateExcerpt(content);
    const pullQuote = extractPullQuote(content);
    const category = getCategoryFromTags(post.tags, title);
    const tags = post.tags || [];
    const readTime = calculateReadTime(content);
    const publishedAt = post.published_at || post.created_at;
    const createdAt = post.created_at || post.published_at;
    const updatedAt = post.updated_at || post.published_at;

    // Handle cover art
    let coverArt = null;
    if (isValidImageUrl(post.featured_image)) {
      coverArt = JSON.stringify({ image_url: post.featured_image });
    } else {
      // Use palette-based cover art as fallback
      coverArt = JSON.stringify({ p1: '#6f9bd1', p2: '#c08a64' });
    }

    // Build INSERT statement
    sql += `INSERT INTO posts (
    id, title, slug, content, excerpt, pull_quote, category, tags,
    read_time, issue, cover_art, text_only, featured, published,
    published_at, created_at, updated_at
) VALUES (
    '${id}',
    '${escapeSql(title)}',
    '${escapeSql(slug)}',
    '${escapeSql(content)}',
    '${escapeSql(excerpt)}',
    ${pullQuote ? `'${escapeSql(pullQuote)}'` : 'NULL'},
    '${category}',
    ARRAY[${tags.map(t => `'${escapeSql(t)}'`).join(', ')}],
    ${readTime},
    NULL,
    '${escapeSql(coverArt)}',
    false,
    ${isFeatured},
    true,
    '${publishedAt}',
    '${createdAt}',
    '${updatedAt}'
);\n\n`;

    console.log(`Processed: ${title.slice(0, 50)}... (${category}, ${readTime} min)`);
  }

  sql += `COMMIT;

-- Migration complete
-- Imported ${livePosts.length} posts
`;

  // Write SQL file
  fs.writeFileSync(outputPath, sql);

  console.log(`\n✅ SQL file generated: ${outputPath}`);
  console.log(`   Total posts: ${livePosts.length}`);
  console.log(`   Featured: ${featuredCount}`);
}

// Run if called directly
if (require.main === module) {
  try {
    generateSQL();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { generateSQL };
