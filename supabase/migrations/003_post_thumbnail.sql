-- Add post_thumbnail column and populate from first image in content.
-- Handles both HTML (<img src="...">) and Markdown (![alt](url)) content.
-- Cannot detect broken URLs from SQL — those are left for a client-side fallback.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_thumbnail text;

UPDATE posts
SET post_thumbnail = COALESCE(
  -- 1. HTML: <img ... src="url" ...> or src='url'
  (regexp_match(content, $re$<img[^>]+src=['"]([^'"]+)['"]$re$))[1],
  -- 2. Markdown: ![alt](url)
  (regexp_match(content, $re$!\[[^\]]*\]\(([^)]+)\)$re$))[1]
)
WHERE content IS NOT NULL;

-- Normalise empty strings → NULL
UPDATE posts
SET post_thumbnail = NULL
WHERE post_thumbnail = '';
