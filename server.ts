import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Read Firebase config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function startServer() {
  const app = express();

  let vite: any = null;
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
  }

  // Endpoint to serve article image directly as binary (crucial for base64/data URIs or crawlers)
  app.get('/api/materia-image/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).send('Missing article ID');
      }

      const postDoc = await getDoc(doc(db, 'posts', id));
      if (!postDoc.exists()) {
        // Fallback default image
        return res.redirect(302, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop');
      }

      const data = postDoc.data();
      const coverImage: string = data.coverImage || '';

      if (coverImage.startsWith('data:image/')) {
        const matches = coverImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          const imgBuffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', imgBuffer.length);
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
          return res.status(200).end(imgBuffer);
        }
      }

      if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
        return res.redirect(302, coverImage);
      }

      // Default fallback
      return res.redirect(302, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop');
    } catch (err) {
      console.error('Error serving article image:', err);
      return res.redirect(302, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop');
    }
  });

  // Handle all HTML page requests with dynamic Open Graph injection for WhatsApp / social bots
  app.get('*', async (req: Request, res: Response, next) => {
    const url = req.originalUrl;

    // Skip non-page requests (assets, files with extensions)
    if (url.includes('.') && !url.includes('.html') && !url.includes('?')) {
      return next();
    }

    try {
      // Check if this request is for a specific article
      // Can be query parameter ?materia=ID or ?artigo=ID or path /materia/ID
      let materiaId: string | null = (req.query.materia as string) || (req.query.artigo as string) || null;
      if (!materiaId && url.startsWith('/materia/')) {
        materiaId = url.split('/materia/')[1]?.split('?')[0] || null;
      }

      // Determine public origin
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
      const origin = `${proto}://${host}`;

      // Read template index.html
      let templatePath = isProd 
        ? path.resolve(__dirname, 'dist', 'index.html') 
        : path.resolve(__dirname, 'index.html');
      
      let html = fs.readFileSync(templatePath, 'utf-8');

      if (!isProd && vite) {
        html = await vite.transformIndexHtml(url, html);
      }

      // If viewing a specific article, fetch and inject its REAL image, headline and description
      if (materiaId) {
        try {
          const postDoc = await getDoc(doc(db, 'posts', materiaId));
          if (postDoc.exists()) {
            const post = postDoc.data();
            const title = post.title || 'Notícia - Jornal Aberto';
            const subtitle = post.subtitle || post.content?.substring(0, 160) || '';
            const coverImage = post.coverImage || '';

            // Build exact public image URL
            let publicImageUrl = coverImage;
            if (coverImage.startsWith('data:image/')) {
              // Convert data URI to the server's public binary image endpoint
              publicImageUrl = `${origin}/api/materia-image/${encodeURIComponent(materiaId)}`;
            } else if (!coverImage.startsWith('http://') && !coverImage.startsWith('https://')) {
              publicImageUrl = `${origin}/api/materia-image/${encodeURIComponent(materiaId)}`;
            }

            const pageCanonicalUrl = `${origin}/?materia=${encodeURIComponent(materiaId)}`;
            const safeTitle = escapeHtml(title);
            const safeDesc = escapeHtml(subtitle);

            // Replace <title>
            html = html.replace(/<title>.*?<\/title>/gi, `<title>${safeTitle} - Jornal Aberto</title>`);

            // Replace meta description
            html = html.replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${safeDesc}" />`);

            // Replace Open Graph meta tags
            html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${safeTitle} - Jornal Aberto" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${safeDesc}" />`);
            html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/gi, `<meta property="og:image" content="${publicImageUrl}" />`);
            html = html.replace(/<meta property="og:image:alt" content=".*?"\s*\/?>/gi, `<meta property="og:image:alt" content="${safeTitle}" />`);

            
            // Twitter cards
            html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${safeTitle} - Jornal Aberto" />`);
            html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${safeDesc}" />`);
            html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/gi, `<meta name="twitter:image" content="${publicImageUrl}" />`);

            // Inject canonical og:url and secure image tags right before </head>
            const ogExtraTags = `
    <!-- Dynamic Open Graph for WhatsApp & Social Crawlers -->
    <meta property="og:url" content="${pageCanonicalUrl}" />
    <meta property="og:image:secure_url" content="${publicImageUrl}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="article" />
</head>`;
            html = html.replace('</head>', ogExtraTags);

          }
        } catch (postErr) {
          console.warn('Could not inject article metadata for SSR:', postErr);
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jornal Aberto Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
