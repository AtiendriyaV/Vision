import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  fetchArticles, 
  saveArticle, 
  getArticleBySlug, 
  deleteArticle, 
  calculateReadTime,
  refreshCache 
} from './lib/articleStore';
import { exportMediumArticles } from './lib/mediumSync';
import { PublishArticlePayload } from './lib/types';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// CORS middleware & preflight handler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// System health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fetch all articles
app.get('/api/articles', async (req, res) => {
  try {
    const forceRevalidate = req.query.revalidate === 'true';
    const articles = await fetchArticles(forceRevalidate);
    res.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch articles' });
  }
});

// Fetch a single article by slug
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch article' });
  }
});

// Verify Admin Passcode or auto-check
app.post('/api/verify-key', (req, res) => {
  const { passcode } = req.body || {};
  const configuredKey = process.env.ADMIN_SECRET_KEY || 'Vermakk@1972';
  if (!passcode || passcode.trim() !== configuredKey.trim()) {
    return res.status(401).json({ success: false, message: 'Invalid Admin Password' });
  }
  return res.json({ success: true, message: 'Authorized' });
});

// Reusable Publish or Update article handler
async function handlePublishRequest(req: express.Request, res: express.Response) {
  try {
    const payload: PublishArticlePayload & { originalSlug?: string; passcode?: string } = req.body || {};
    let { title, slug, originalSlug, content, tags, excerpt, passcode } = payload;

    const configuredKey = process.env.ADMIN_SECRET_KEY || 'Vermakk@1972';
    if (passcode && passcode.trim() !== configuredKey.trim()) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Password' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Article content cannot be empty' });
    }

    // Auto-extract title from content if not provided
    if (!title || !title.trim()) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        title = headingMatch[1].replace(/[*_`]/g, '').trim();
      }
    }

    // Sanitize any legacy tokens in title and content
    title = (title || '')
      .replace(/_{2,4}BOLD_START_{2,4}([\s\S]*?)_{2,4}BOLD_END_{2,4}/gi, '$1')
      .replace(/_{2,4}(BOLD|ITALIC|CODE)_(START|END)_{2,4}/gi, '')
      .replace(/^th#+\s*/i, '')
      .trim();

    content = content
      .replace(/_{2,4}BOLD_START_{2,4}([\s\S]*?)_{2,4}BOLD_END_{2,4}/gi, '**$1**')
      .replace(/_{2,4}ITALIC_START_{2,4}([\s\S]*?)_{2,4}ITALIC_END_{2,4}/gi, '*$1*')
      .replace(/_{2,4}CODE_START_{2,4}([\s\S]*?)_{2,4}CODE_END_{2,4}/gi, '`$1`')
      .replace(/_{2,4}(BOLD|ITALIC|CODE)_(START|END)_{2,4}/gi, '')
      .replace(/^th#+\s*/gm, '# ')
      .trim();

    if (!title) {
      return res.status(400).json({ success: false, message: 'Article title is required' });
    }

    const cleanSlug =
      slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const readTime = payload.readTime || calculateReadTime(content);
    const finalTags = tags && tags.length > 0 ? tags : ['Equity Research'];
    const finalExcerpt = excerpt?.trim() || content.slice(0, 160).replace(/[#*`_]/g, '') + '...';

    const result = await saveArticle({
      title,
      slug: cleanSlug,
      originalSlug: originalSlug?.trim() || (req.params?.slug ? req.params.slug.trim() : undefined),
      content,
      tags: finalTags,
      excerpt: finalExcerpt,
      readTime,
      author: payload.author || 'Atiendriya Verma',
      mediumUrl: payload.mediumUrl,
      fontFamily: payload.fontFamily,
      fontSize: payload.fontSize,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Publish API error:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Internal server error during publishing',
    });
  }
}

// Publish or Update article endpoints (supports POST, PUT, PATCH)
app.post('/api/publish', handlePublishRequest);
app.put('/api/publish', handlePublishRequest);
app.post('/api/articles', handlePublishRequest);
app.put('/api/articles/:slug', handlePublishRequest);

// Synchronize / Export Medium Articles
app.post('/api/sync-medium', async (req, res) => {
  try {
    const result = await exportMediumArticles();
    refreshCache();
    res.json(result);
  } catch (err: any) {
    console.error('Sync Medium error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to export/sync Medium articles',
    });
  }
});

// Delete article by slug (Admin)
app.delete('/api/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const deleted = await deleteArticle(slug);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, message: 'Article successfully removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ensure any unknown /api/* requests return JSON rather than falling through to static/Vite which causes 405 Method Not Allowed
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.path} not found` });
});

// Setup Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Atiendriya Verma Blog] Server running on http://0.0.0.0:${PORT}`);
});
