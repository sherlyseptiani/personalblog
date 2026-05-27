-- Posts table
CREATE TABLE posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  content     text NOT NULL,
  excerpt     text,
  pull_quote  text,
  category    text NOT NULL CHECK (category IN ('essay','craft','field','reading','systems')),
  tags        text[] DEFAULT '{}',
  read_time   text,
  issue       text,
  cover_art   jsonb,
  text_only   boolean DEFAULT false,
  featured    boolean DEFAULT false,
  published   boolean DEFAULT false,
  published_at timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Ideas/submissions table
CREATE TABLE ideas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content     text NOT NULL CHECK (char_length(content) <= 280),
  source_page text,
  post_slug   text REFERENCES posts(slug) ON DELETE SET NULL,
  ip_hash     text,
  created_at  timestamptz DEFAULT now()
);

-- Full-text search index on posts
ALTER TABLE posts ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX posts_published_idx ON posts(published, published_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
