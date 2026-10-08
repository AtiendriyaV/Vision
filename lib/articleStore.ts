import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Article, PublishArticlePayload } from './types';
import { SEED_ARTICLES } from './seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'articles.json');

// In-memory cache fallback in case of environment constraints
let articlesCache: Article[] = [];

/**
 * Ensures data directory and JSON storage file exist
 */
function initializeStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_ARTICLES, null, 2), 'utf-8');
      articlesCache = [...SEED_ARTICLES];
    } else {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        articlesCache = parsed;
      } else {
        articlesCache = [...SEED_ARTICLES];
      }
    }
  } catch (err) {
    console.warn('Filesystem storage init warning (using in-memory fallback):', err);
    if (articlesCache.length === 0) {
      articlesCache = [...SEED_ARTICLES];
    }
  }
}

/**
 * Persists current cache to disk
 */
function persistStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(articlesCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist articles to disk, maintained in memory:', err);
  }
}

// Initialise storage on load
initializeStorage();

/**
 * Estimates reading time from content words
 */
export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}

/**
 * Formats current date for new or updated articles
 */
export function formatArticleDate(): string {
  const date = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Fetch all articles from storage
 */
export async function fetchArticles(forceRevalidate = false): Promise<Article[]> {
  if (forceRevalidate || articlesCache.length === 0) {
    initializeStorage();
  }
  return [...articlesCache];
}

/**
 * Fetch single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await fetchArticles();
  return articles.find((a) => a.slug === slug) || null;
}

/**
 * Reloads articles cache from data file or seed
 */
export function refreshCache(): Article[] {
  initializeStorage();
  return [...articlesCache];
}

/**
 * Creates or updates an article in the repository
 */
export async function saveArticle(payload: {
  title: string;
  slug: string;
  originalSlug?: string;
  content: string;
  tags: string[];
  excerpt: string;
  readTime?: string;
  author?: string;
  mediumUrl?: string;
  coverImage?: string;
}): Promise<{
  success: boolean;
  message: string;
  article: Article;
  isUpdate: boolean;
}> {
  const { title, slug, originalSlug, content, tags, excerpt, mediumUrl, coverImage } = payload;
  const readTime = payload.readTime || calculateReadTime(content);
  const author = payload.author || 'Atiendriya Verma';

  const cleanSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let existingIndex = -1;
  if (originalSlug) {
    existingIndex = articlesCache.findIndex((a) => a.slug === originalSlug);
  }
  if (existingIndex < 0) {
    existingIndex = articlesCache.findIndex((a) => a.slug === cleanSlug);
  }

  let updatedArticle: Article;
  let isUpdate = false;

  if (existingIndex >= 0) {
    // Update existing article
    const existing = articlesCache[existingIndex];
    updatedArticle = {
      ...existing,
      title: title.trim(),
      slug: cleanSlug,
      content: content.trim(),
      tags: tags && tags.length > 0 ? tags : existing.tags,
      excerpt: excerpt.trim() || existing.excerpt,
      readTime,
      author,
      mediumUrl: mediumUrl !== undefined ? mediumUrl : existing.mediumUrl,
      coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
      publishedAt: new Date().toISOString(),
    };
    articlesCache[existingIndex] = updatedArticle;
    isUpdate = true;
  } else {
    // Insert new article at the top
    updatedArticle = {
      title: title.trim(),
      slug: cleanSlug,
      date: formatArticleDate(),
      excerpt: excerpt.trim(),
      tags: tags && tags.length > 0 ? tags : ['Equity Research'],
      readTime,
      author,
      content: content.trim(),
      mediumUrl,
      coverImage,
      publishedAt: new Date().toISOString(),
    };
    articlesCache = [updatedArticle, ...articlesCache];
  }

  persistStorage();

  return {
    success: true,
    message: isUpdate
      ? `Article "${updatedArticle.title}" successfully updated!`
      : `Article "${updatedArticle.title}" successfully published!`,
    article: updatedArticle,
    isUpdate,
  };
}

/**
 * Deletes an article by slug
 */
export async function deleteArticle(slug: string): Promise<boolean> {
  const initialLength = articlesCache.length;
  articlesCache = articlesCache.filter((a) => a.slug !== slug);
  if (articlesCache.length !== initialLength) {
    persistStorage();
    return true;
  }
  return false;
}
