import { NewsPost } from '../types/news.ts';

/**
 * Returns canonical link for a specific news post
 */
export function getArticleUrl(postId: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?materia=${encodeURIComponent(postId)}`;
}

/**
 * Returns the exact public image URL for a post
 * Converts base64/data URIs to the server endpoint so WhatsApp crawler can load it
 */
export function getArticleImageUrl(post: NewsPost): string {
  if (!post.coverImage) {
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop';
  }
  if (post.coverImage.startsWith('http://') || post.coverImage.startsWith('https://')) {
    return post.coverImage;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/materia-image/${encodeURIComponent(post.id)}`;
  }
  return post.coverImage;
}

/**
 * Generates the formatted WhatsApp message text
 * Contains:
 * - Bold headline (Enunciado da matéria)
 * - Subtitle / lead
 * - Cover image link so recipients can view / download the real image
 * - Direct link to read on Jornal Aberto
 */
export function formatWhatsAppMessage(post: NewsPost): string {
  const articleUrl = getArticleUrl(post.id);
  const imageUrl = getArticleImageUrl(post);
  const headline = post.title.trim();
  const subtitle = post.subtitle?.trim();
  const categoryTag = post.category && post.category !== 'Sociedade' ? `[${post.category.toUpperCase()}] ` : '';

  const parts: string[] = [];

  // Enunciado / Headline with news emoji
  parts.push(`📰 *${categoryTag}${headline}*`);

  // Linha fina / Subtítulo / Resumo
  if (subtitle) {
    parts.push(`_${subtitle}_`);
  }

  // Imagem da matéria (link direto da foto da capa)
  if (imageUrl) {
    parts.push(`📸 *Foto da matéria:*\n${imageUrl}`);
  }

  // Link para a matéria completa
  parts.push(`👉 *Leia a reportagem completa no Jornal Aberto:*\n${articleUrl}`);

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
 * Opens WhatsApp directly in web or app
 */
export function openWhatsAppShare(post: NewsPost): void {
  const url = getWhatsAppShareUrl(post);
  // Using window.open with _blank or direct location
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened || opened.closed || typeof opened.closed === 'undefined') {
    window.location.href = url;
  }
}

/**
 * Attempts native Web Share API (especially on mobile devices)
 * Passing title, text, and direct url
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
    // Fallback for older browsers
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
 * Helper to update dynamic Open Graph tags in DOM
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
