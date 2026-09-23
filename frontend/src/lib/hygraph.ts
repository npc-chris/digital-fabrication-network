export interface HygraphAuthor {
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface HygraphPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  htmlContent: string;
  coverImageUrl: string;
  publishedAt: string;
  readTime: string;
  category: string;
  badge: string;
  author: HygraphAuthor;
  tags: string[];
}

const getEndpoint = (): string => {
  return (
    process.env.HYGRAPH_ENDPOINT ||
    process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT ||
    ''
  ).trim();
};

const getAuthHeaders = (): Record<string, string> => {
  const token = (
    process.env.HYGRAPH_TOKEN ||
    process.env.NEXT_PUBLIC_HYGRAPH_TOKEN ||
    ''
  ).trim();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Recent Dispatch';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

const estimateReadTime = (content?: string): string => {
  if (!content) return '5 min read';
  const words = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

// Primary full query for standard Hygraph Blog schemas
const FULL_POSTS_QUERY = `
  query GetPosts {
    posts(orderBy: publishedAt_DESC, first: 20) {
      id
      title
      slug
      excerpt
      publishedAt
      createdAt
      coverImage {
        url
      }
      content {
        html
        markdown
        text
      }
      tags {
        name
        slug
      }
      author {
        name
        title
        picture {
          url
        }
      }
    }
  }
`;

// Minimal fallback query if user schema lacks relation fields
const MINIMAL_POSTS_QUERY = `
  query GetMinimalPosts {
    posts(first: 20) {
      id
      title
      slug
      excerpt
      publishedAt
      createdAt
      coverImage {
        url
      }
    }
  }
`;

const SINGLE_POST_FULL_QUERY = `
  query GetPostBySlug($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      slug
      excerpt
      publishedAt
      createdAt
      coverImage {
        url
      }
      content {
        html
        markdown
        text
      }
      tags {
        name
        slug
      }
      author {
        name
        title
        picture {
          url
        }
      }
    }
  }
`;

const SINGLE_POST_MINIMAL_QUERY = `
  query GetMinimalPostBySlug($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      slug
      excerpt
      publishedAt
      createdAt
      coverImage {
        url
      }
      content {
        html
        text
      }
    }
  }
`;

interface RawHygraphPostNode {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  createdAt?: string;
  coverImage?: { url?: string };
  content?: { html?: string; markdown?: string; text?: string } | string;
  tags?: Array<{ name?: string; slug?: string } | string>;
  author?: {
    name?: string;
    title?: string;
    picture?: { url?: string };
  };
}

const normalizePost = (raw: RawHygraphPostNode): HygraphPost => {
  let html = '';
  let rawText = '';

  if (typeof raw.content === 'string') {
    html = raw.content;
    rawText = raw.content;
  } else if (raw.content && typeof raw.content === 'object') {
    html = raw.content.html || raw.content.markdown || raw.content.text || '';
    rawText = raw.content.text || raw.content.html || '';
  }

  const tagList: string[] = (raw.tags || [])
    .map((t) => (typeof t === 'string' ? t : t?.name || t?.slug || ''))
    .filter(Boolean);

  return {
    id: raw.id || raw.slug || Math.random().toString(),
    slug: raw.slug || '',
    title: raw.title || 'Untitled Dispatch',
    excerpt:
      raw.excerpt ||
      (rawText ? rawText.slice(0, 160) + '...' : 'No excerpt provided.'),
    htmlContent: html,
    coverImageUrl:
      raw.coverImage?.url ||
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    publishedAt: formatDate(raw.publishedAt || raw.createdAt),
    readTime: estimateReadTime(rawText || html),
    category: tagList[0] || 'Engineering',
    badge: 'Field Report',
    author: {
      name: raw.author?.name || 'DFN Research Team',
      role: raw.author?.title || 'Digital Fabrication Network',
      avatarUrl: raw.author?.picture?.url,
    },
    tags: tagList,
  };
};

/**
 * Fetch all published blog posts from Hygraph.
 * Returns an empty array if endpoint is not configured or query fails.
 */
export async function getHygraphPosts(): Promise<HygraphPost[]> {
  const endpoint = getEndpoint();
  if (!endpoint) {
    return [];
  }

  try {
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query: FULL_POSTS_QUERY }),
      next: { revalidate: 60 },
    });

    let result = await response.json();

    // If full query fails (e.g. author or tags model not yet created), try minimal query
    if (result.errors && !result.data?.posts) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query: MINIMAL_POSTS_QUERY }),
        next: { revalidate: 60 },
      });
      result = await response.json();
    }

    if (result.errors || !result.data?.posts) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Hygraph posts query returned errors:', result.errors);
      }
      return [];
    }

    const posts: RawHygraphPostNode[] = result.data.posts;
    return posts.map(normalizePost);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch blog posts from Hygraph:', error);
    }
    return [];
  }
}

/**
 * Fetch a single blog post by its unique slug from Hygraph.
 */
export async function getHygraphPostBySlug(
  slug: string
): Promise<HygraphPost | null> {
  const endpoint = getEndpoint();
  if (!endpoint || !slug) {
    return null;
  }

  try {
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: SINGLE_POST_FULL_QUERY,
        variables: { slug },
      }),
      next: { revalidate: 60 },
    });

    let result = await response.json();

    if (result.errors && !result.data?.post) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query: SINGLE_POST_MINIMAL_QUERY,
          variables: { slug },
        }),
        next: { revalidate: 60 },
      });
      result = await response.json();
    }

    if (!result.data?.post) {
      return null;
    }

    return normalizePost(result.data.post);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Failed to fetch Hygraph post for slug "${slug}":`, error);
    }
    return null;
  }
}
