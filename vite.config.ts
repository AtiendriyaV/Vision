import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Set standard CORS & JSON headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        res.setHeader('Content-Type', 'application/json');

        const dataDir = path.resolve(process.cwd(), 'data');
        const dataFile = path.join(dataDir, 'articles.json');

        const readArticles = () => {
          try {
            if (fs.existsSync(dataFile)) {
              return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
            }
          } catch {}
          return [];
        };

        const writeArticles = (items: any[]) => {
          try {
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(dataFile, JSON.stringify(items, null, 2), 'utf-8');
          } catch (e) {
            console.warn('Failed to write articles file:', e);
          }
        };

        // Parse JSON body if present
        let body: any = {};
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            if (rawBody.trim()) {
              body = JSON.parse(rawBody);
            }
          } catch {}
        }

        const urlPath = req.url.split('?')[0];

        if (urlPath === '/api/health') {
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        }

        if (urlPath === '/api/verify-key') {
          const key = process.env.ADMIN_SECRET_KEY || 'Vermakk@1972';
          if (body.passcode?.trim() === key.trim()) {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: 'Authorized' }));
          }
          res.statusCode = 401;
          return res.end(JSON.stringify({ success: false, message: 'Invalid Admin Password' }));
        }

        if (urlPath === '/api/articles' && req.method === 'GET') {
          const articles = readArticles();
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, count: articles.length, articles }));
        }

        if ((urlPath === '/api/publish' || urlPath === '/api/articles') && (req.method === 'POST' || req.method === 'PUT')) {
          let { title, slug, content, tags, excerpt, passcode } = body;
          const key = process.env.ADMIN_SECRET_KEY || 'Vermakk@1972';
          if (passcode && passcode.trim() !== key.trim()) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, message: 'Unauthorized: Invalid Admin Password' }));
          }

          if (!content?.trim()) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Article content cannot be empty' }));
          }

          if (!title?.trim()) {
            const headingMatch = content.match(/^#\s+(.+)$/m);
            if (headingMatch) {
              title = headingMatch[1].replace(/[*_`]/g, '').trim();
            }
          }

          title = (title || '')
            .replace(/_{2,4}BOLD_START_{2,4}([\s\S]*?)_{2,4}BOLD_END_{2,4}/gi, '$1')
            .replace(/_{2,4}(BOLD|ITALIC|CODE)_(START|END)_{2,4}/gi, '')
            .replace(/^th#+\s*/i, '')
            .trim();

          content = (content || '')
            .replace(/_{2,4}BOLD_START_{2,4}([\s\S]*?)_{2,4}BOLD_END_{2,4}/gi, '**$1**')
            .replace(/_{2,4}ITALIC_START_{2,4}([\s\S]*?)_{2,4}ITALIC_END_{2,4}/gi, '*$1*')
            .replace(/_{2,4}CODE_START_{2,4}([\s\S]*?)_{2,4}CODE_END_{2,4}/gi, '`$1`')
            .replace(/_{2,4}(BOLD|ITALIC|CODE)_(START|END)_{2,4}/gi, '')
            .replace(/^th#+\s*/gm, '# ')
            .trim();

          if (!title) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Article title is required' }));
          }

          const cleanSlug =
            slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
            title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

          const words = content.trim().split(/\s+/).filter(Boolean).length;
          const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

          const articleObj = {
            title,
            slug: cleanSlug,
            date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            excerpt: excerpt?.trim() || content.slice(0, 160).replace(/[#*`_]/g, '') + '...',
            tags: tags && tags.length > 0 ? tags : ['Equity Research'],
            readTime,
            author: body.author || 'Atiendriya Verma',
            content,
            publishedAt: new Date().toISOString(),
          };

          const articles = readArticles();
          const existingIdx = articles.findIndex((a: any) => a.slug === cleanSlug || (body.originalSlug && a.slug === body.originalSlug));
          if (existingIdx >= 0) {
            articles[existingIdx] = { ...articles[existingIdx], ...articleObj };
          } else {
            articles.unshift(articleObj);
          }
          writeArticles(articles);

          res.statusCode = 200;
          return res.end(JSON.stringify({
            success: true,
            message: `Article "${title}" successfully published!`,
            article: articleObj,
            isUpdate: existingIdx >= 0,
          }));
        }

        // Any other /api route returns JSON 404, never 405
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
