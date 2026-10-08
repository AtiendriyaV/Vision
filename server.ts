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
  calculateReadTime 
} from './lib/articleStore';
import { PublishArticlePayload } from './lib/types';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

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
  const { passcode } = req.body;
  const configuredKey = process.env.ADMIN_SECRET_KEY || 'Vermakk@1972';
  if (!passcode || passcode.trim() !== configuredKey.trim()) {
    return res.status(401).json({ success: false, message: 'Invalid Admin Password' });
  }
  return res.json({ success: true, message: 'Authorized' });
});

// Publish or Update article
app.post('/api/publish', async (req, res) => {
  try {
    const payload: PublishArticlePayload & { originalSlug?: string; passcode?: string } = req.body;
    const { title, slug, originalSlug, content, tags, excerpt, passcode } = payload;

    const configuredKey = process.env.ADMIN_SECRET_KEY || 'Vermakk@1972';
    if (passcode && passcode.trim() !== configuredKey.trim()) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Password' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Article title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Article content cannot be empty' });
    }

    const cleanSlug =
      slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const readTime = payload.readTime || calculateReadTime(content);
    const finalTags = tags && tags.length > 0 ? tags : ['Equity Research'];
    const finalExcerpt = excerpt?.trim() || content.slice(0, 160).replace(/[#*`_]/g, '') + '...';

    const result = await saveArticle({
      title: title.trim(),
      slug: cleanSlug,
      originalSlug: originalSlug?.trim(),
      content: content.trim(),
      tags: finalTags,
      excerpt: finalExcerpt,
      readTime,
      author: payload.author || 'Atiendriya Verma',
    });

    res.json(result);
  } catch (err: any) {
    console.error('Publish API error:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Internal server error during publishing',
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
