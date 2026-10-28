import { NewsPost } from '../types/news.ts';

const PUBLIC_FALLBACK_URL = 'https://ais-pre-ybfuuxyqh56ztqekqemt3w-462521878786.us-east1.run.app';

/**
 * Returns canonical, publicly accessible link for a specific news post.
 * Always resolves to the public shared URL (ais-pre-) so anyone clicking on WhatsApp can read it.
 */
export function getArticleUrl(postId: string): string {
  if (typeof window === 'undefined') {
    return `${PUBLIC_FALLBACK_URL}/?materia=${encodeURIComponent(postId.trim())}`;
  }

  let origin = window.location.origin;

  // Convert private development container URL to the public shared URL
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  } else if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    origin = PUBLIC_FALLBACK_URL;
  }

  const cleanId = encodeURIComponent(postId.trim());
  return `${origin}/?materia=${cleanId}`;
}

/**
 * Returns the exact public image URL for an article.
 * If stored as base64 data URI, converts to the public server image endpoint.
 */
export function getArticleImageUrl(post: NewsPost): string {
  const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop';
  
  if (!post.coverImage) {
    return defaultImage;
  }

  if (post.coverImage.startsWith('http://') || post.coverImage.startsWith('https://')) {
    return post.coverImage;
  }

  let origin = typeof window !== 'undefined' ? window.location.origin : PUBLIC_FALLBACK_URL;
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  } else if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    origin = PUBLIC_FALLBACK_URL;
  }

  return `${origin}/api/materia-image/${encodeURIComponent(post.id.trim())}`;
}

/**
 * Generates the clean WhatsApp message text.
 * Contains:
 * - Bold headline (Enunciado da matéria) with category
 * - Subtitle / lead
 * - Single direct article link
 * (WhatsApp automatically scans this single link and generates the rich card with the article's real image and headline)
 */
export function formatWhatsAppMessage(post: NewsPost): string {
  const articleUrl = getArticleUrl(post.id);
  const headline = post.title.trim();
  const subtitle = post.subtitle?.trim();
  const categoryTag = post.category && post.category !== 'Sociedade' ? `[${post.category.toUpperCase()}] ` : '';

  const parts: string[] = [];

  // Enunciado / Headline
  parts.push(`📰 *${categoryTag}${headline}*`);

  // Linha fina / Subtítulo / Resumo
  if (subtitle) {
    parts.push(`_${subtitle}_`);
  }

  // Link único para a matéria completa
  parts.push(`👉 *Leia a matéria completa e veja as imagens no Jornal Aberto:*\n${articleUrl}`);

  return parts.join('\n\n');
}

/**
 * Creates the WhatsApp URL for direct click-to-chat
 */
export function getWhatsAppShareUrl(post: NewsPost): string {
  const message = formatWhatsAppMessage(post);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp safely in a new tab without breaking the iframe
 */
export function openWhatsAppShare(post: NewsPost): void {
  const url = getWhatsAppShareUrl(post);
  try {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      // Fallback via anchor element to avoid iframe navigation block
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.warn('Fallback anchor for WhatsApp share:', err);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Attempts native Web Share API (especially on mobile devices)
 */
export async function shareNative(post: NewsPost): Promise<boolean> {
  const articleUrl = getArticleUrl(post.id);
  const shareData: ShareData = {
    title: post.title,
    text: post.subtitle ? `${post.title} — ${post.subtitle}` : post.title,
    url: articleUrl,
  };

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share error, falling back:', err);
      }
      return false;
    }
  }
  return false;
}

/**
 * Copies formatted text with link to clipboard
 */
export async function copyShareTextToClipboard(post: NewsPost): Promise<boolean> {
  const text = formatWhatsAppMessage(post);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return false;
  }
}

/**
 * Copies canonical link to clipboard
 */
export async function copyArticleLinkToClipboard(post: NewsPost): Promise<boolean> {
  const url = getArticleUrl(post.id);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return false;
  }
}

/**
 * Updates dynamic Open Graph tags in DOM
 */
export function updateArticleOpenGraphMeta(post: NewsPost | null): void {
  if (typeof document === 'undefined') return;

  const defaultTitle = 'Jornal Aberto - Portal Público de Notícias';
  const defaultDesc = 'Crie, ilustre e publique notícias com imagens em uma base pública colaborativa para toda a comunidade ler e interagir.';
  const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop';
  const defaultUrl = window.location.origin;

  const title = post ? `${post.title} | Jornal Aberto` : defaultTitle;
  const desc = post ? (post.subtitle || post.content.substring(0, 160)) : defaultDesc;
  const image = post ? getArticleImageUrl(post) : defaultImage;
  const url = post ? getArticleUrl(post.id) : defaultUrl;

  document.title = title;

  const setMeta = (property: string, content: string, isName = false) => {
    const attr = isName ? 'name' : 'property';
    let el = document.querySelector(`meta[${attr}="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', desc, true);
  setMeta('og:title', title);
  setMeta('og:description', desc);
  setMeta('og:image', image);
  setMeta('og:url', url);
  setMeta('og:type', post ? 'article' : 'website');
  setMeta('twitter:card', 'summary_large_image', true);
  setMeta('twitter:title', title, true);
  setMeta('twitter:description', desc, true);
  setMeta('twitter:image', image, true);
}
