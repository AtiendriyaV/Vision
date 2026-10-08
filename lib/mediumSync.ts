import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Article } from './types';
import { calculateReadTime } from './articleStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'articles.json');

const MEDIUM_FEED_URL = 'https://medium.com/feed/@atiendriyaverma';

/**
 * Converts Medium HTML article body into clean, elegant Markdown.
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove Medium analytics tracking pixel
  md = md.replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, '');

  // Remove XML / RSS specific noise
  md = md.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1');

  // Convert headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, quoteContent) => {
    const lines = quoteContent
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean);
    return '\n\n' + lines.map((l: string) => `> ${l}`).join('\n') + '\n\n';
  });

  // Convert lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, listContent) => {
    const items = [...listContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1].trim());
    return '\n\n' + items.map((item) => `* ${item}`).join('\n') + '\n\n';
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, listContent) => {
    const items = [...listContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1].trim());
    return '\n\n' + items.map((item, idx) => `${idx + 1}. ${item}`).join('\n') + '\n\n';
  });

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  // Bold & Italic
  md = md.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');

  // Links
  md = md.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images (preserve alt text if present)
  md = md.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '\n\n![$2]($1)\n\n');
  md = md.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, '\n\n![]($1)\n\n');

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/ /g, ' ');

  // Strip any leftover HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Normalize duplicate newlines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

/**
 * Formats pubDate string into human-readable month + year
 */
export function formatMediumDate(pubDateStr: string): string {
  try {
    const d = new Date(pubDateStr);
    if (isNaN(d.getTime())) return 'October 2026';
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return 'October 2026';
  }
}

/**
 * Creates clean URL friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Clean and capitalize category tag
 */
export function formatTag(tag: string): string {
  const map: Record<string, string> = {
    'ai': 'AI',
    'gen-ai': 'Generative AI',
    'fintech': 'FinTech',
    'rbi': 'RBI',
    'us-treasury': 'US Treasury',
    'macroeconomics': 'Macroeconomics',
    'economics': 'Economics',
    'finance': 'Finance',
    'investing': 'Investing',
    'india': 'Indian Economy',
    'banking': 'Banking',
    'accounting': 'Accounting & Audit',
    'life-lessons': 'Life Lessons',
    'mental-health': 'Mental Health',
    'psychology': 'Psychology',
    'inspiration': 'Inspiration',
    'quantum-computing': 'Quantum Computing',
    'technology': 'Technology',
    'data-science': 'Data Science',
    'infrastructure': 'Infrastructure',
    'logistics': 'Logistics',
  };

  const lower = tag.trim().toLowerCase();
  if (map[lower]) return map[lower];

  return tag
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export interface MediumExportResult {
  success: boolean;
  totalMediumArticles: number;
  newImported: number;
  updated: number;
  totalArticlesCount: number;
  articles: Article[];
  errors?: string[];
}

/**
 * Exports and synchronizes all public Medium articles from https://medium.com/@atiendriyaverma
 */
export async function exportMediumArticles(): Promise<MediumExportResult> {
  const errors: string[] = [];

  try {
    const response = await fetch(MEDIUM_FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Medium feed: HTTP ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const itemChunks = xml.split('<item>').slice(1);

    if (itemChunks.length === 0) {
      throw new Error('No articles found in Medium RSS feed');
    }

    // Load existing storage articles
    let existingArticles: Article[] = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        existingArticles = JSON.parse(raw);
      } catch (e) {
        console.warn('Could not read existing data/articles.json:', e);
      }
    }

    const mediumArticles: Article[] = [];

    for (const chunk of itemChunks) {
      try {
        // Extract title
        const titleMatch = chunk.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i);
        let rawTitle = titleMatch ? titleMatch[1].trim() : 'Untitled Article';

        // Extract raw HTML content
        const contentMatch = chunk.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);
        const rawHtml = contentMatch ? contentMatch[1] : '';

        // Check if title was truncated by Medium (ends with '…' or '...')
        if (rawTitle.endsWith('…') || rawTitle.endsWith('...')) {
          // Look for full title in content's first heading
          const firstHeadingMatch = rawHtml.match(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/i);
          if (firstHeadingMatch) {
            const headingClean = firstHeadingMatch[1].replace(/<[^>]+>/g, '').trim();
            if (headingClean.length > rawTitle.replace(/[….]/g, '').length) {
              rawTitle = headingClean;
            }
          }
        }

        // Extract canonical Medium link
        const linkMatch = chunk.match(/<link>([\s\S]*?)<\/link>/i);
        let cleanMediumUrl = 'https://medium.com/@atiendriyaverma';
        if (linkMatch) {
          cleanMediumUrl = linkMatch[1].trim().split('?')[0];
        }

        // Extract pubDate
        const pubDateMatch = chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const rawPubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
        const formattedDate = formatMediumDate(rawPubDate);
        const publishedAtISO = new Date(rawPubDate).toISOString();

        // Extract categories / tags
        const rawCats = [...chunk.matchAll(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/gi)].map(
          (m) => m[1].trim()
        );
        const formattedTags = Array.from(
          new Set([...rawCats.map(formatTag), 'Medium Publication'])
        ).slice(0, 6);

        // Convert HTML body to Markdown
        let markdownBody = htmlToMarkdown(rawHtml);

        // Extract first image if any
        let coverImage: string | undefined = undefined;
        const imgMatch = rawHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
        if (imgMatch && !imgMatch[1].includes('medium.com/_/stat')) {
          coverImage = imgMatch[1];
        }

        // Generate concise excerpt
        let excerpt = '';
        const paragraphs = markdownBody
          .split('\n\n')
          .filter((p) => !p.startsWith('#') && !p.startsWith('!') && !p.startsWith('>'))
          .map((p) => p.replace(/[*_#`[\]()]/g, '').trim())
          .filter((p) => p.length > 20);

        if (paragraphs.length > 0) {
          excerpt = paragraphs[0].slice(0, 180).trim() + '...';
        } else {
          excerpt = markdownBody.slice(0, 160).replace(/[*_#`[\]()]/g, '').trim() + '...';
        }

        const readTime = calculateReadTime(markdownBody);

        // Add attribution banner at bottom of markdown
        const attribution = `\n\n---\n\n*Originally published by Atiendriya Verma on Medium ([Read original on Medium](${cleanMediumUrl}))*`;
        if (!markdownBody.includes(cleanMediumUrl)) {
          markdownBody += attribution;
        }

        // Slug creation
        const slug = createSlug(rawTitle);

        const article: Article = {
          title: rawTitle,
          slug,
          date: formattedDate,
          excerpt,
          tags: formattedTags,
          readTime,
          author: 'Atiendriya Verma',
          coverImage,
          publishedAt: publishedAtISO,
          mediumUrl: cleanMediumUrl,
          content: markdownBody,
        };

        mediumArticles.push(article);
      } catch (err: any) {
        errors.push(`Error parsing article item: ${err.message}`);
      }
    }

    // Merge strategy:
    // For each medium article, find if a matching article exists by slug or similar title
    let newImported = 0;
    let updated = 0;

    const mergedList: Article[] = [...existingArticles];

    for (const medArt of mediumArticles) {
      const matchIndex = mergedList.findIndex(
        (a) =>
          a.slug === medArt.slug ||
          a.title.toLowerCase().trim() === medArt.title.toLowerCase().trim() ||
          (a.mediumUrl && a.mediumUrl === medArt.mediumUrl) ||
          (medArt.title.includes('US Treasury Yields') && a.title.includes('US 10-Year Bond Yields')) ||
          (medArt.title.includes('Raincoat Index') && a.title.includes('Raincoat Index')) ||
          (medArt.title.includes('Sugar Intervention') && a.title.includes('Sugar Intervention')) ||
          (medArt.title.includes('AI and Accounting') && a.title.includes('AI and Accounting')) ||
          (medArt.title.includes('Gen AI Workplace') && a.title.includes('Gen AI Workplace'))
      );

      if (matchIndex >= 0) {
        // Update existing article with latest Medium authentic content and link
        mergedList[matchIndex] = {
          ...mergedList[matchIndex],
          title: medArt.title,
          content: medArt.content,
          tags: Array.from(new Set([...mergedList[matchIndex].tags, ...medArt.tags])),
          readTime: medArt.readTime,
          mediumUrl: medArt.mediumUrl,
          publishedAt: medArt.publishedAt || mergedList[matchIndex].publishedAt,
          coverImage: medArt.coverImage || mergedList[matchIndex].coverImage,
        };
        updated++;
      } else {
        // Insert new article at beginning
        mergedList.unshift(medArt);
        newImported++;
      }
    }

    // Sort: newest publishedAt first (or preserve order)
    mergedList.sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });

    // Persist to data/articles.json
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(mergedList, null, 2), 'utf-8');

    return {
      success: true,
      totalMediumArticles: mediumArticles.length,
      newImported,
      updated,
      totalArticlesCount: mergedList.length,
      articles: mergedList,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      totalMediumArticles: 0,
      newImported: 0,
      updated: 0,
      totalArticlesCount: 0,
      articles: [],
      errors: [error.message || 'Unknown error exporting Medium articles'],
    };
  }
}
