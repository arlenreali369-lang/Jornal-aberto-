import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Share2, 
  Smartphone, 
  Image as ImageIcon 
} from 'lucide-react';
import { NewsPost } from '../types/news.ts';
import { 
  getWhatsAppShareUrl, 
  openWhatsAppShare, 
  formatWhatsAppMessage, 
  getArticleUrl, 
  getArticleImageUrl,
  copyShareTextToClipboard,
  shareNative
} from '../utils/shareUtils.ts';


interface WhatsAppShareModalProps {
  post: NewsPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.669-.699c.969.584 1.777.876 2.791.876h.005c3.182 0 5.768-2.586 5.769-5.766.001-3.182-2.585-5.763-5.765-5.763zm3.385 8.165c-.14.394-.813.754-1.129.799-.317.045-.724.062-2.348-.614-1.742-.725-2.868-2.493-2.955-2.61-.087-.116-.709-.944-.709-1.8 0-.856.449-1.278.609-1.452.16-.174.348-.218.464-.218.116 0 .232 0 .333.006.107.006.25.04.39.377.145.348.493 1.203.536 1.29.043.087.072.189.014.305-.058.116-.087.189-.174.29-.087.102-.183.227-.261.305-.087.087-.178.181-.077.355.101.174.45 1.482 1.399 2.327.949.845 1.547 1.042 1.838 1.159.29.116.464.101.638-.101.174-.203.754-.884.957-1.189.203-.305.406-.255.679-.153.273.102 1.728.814 2.025.962.298.148.497.222.569.345.072.123.072.714-.068 1.108z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.178L2 22l4.981-1.306C8.423 21.554 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.637 0-3.177-.492-4.471-1.334l-.321-.208-2.96.774.788-2.887-.229-.364C3.882 14.939 3.364 13.513 3.364 12c0-4.762 3.874-8.636 8.636-8.636 4.762 0 8.636 3.874 8.636 8.636 0 4.762-3.874 8.636-8.636 8.636z" />
    </svg>
  );
}

export default function WhatsAppShareModal({ post, isOpen, onClose }: WhatsAppShareModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !post) return null;

  const articleUrl = getArticleUrl(post.id);
  const shareMessage = formatWhatsAppMessage(post);

  const handleOpenWhatsApp = () => {
    openWhatsAppShare(post);
  };

  const handleCopyMessage = async () => {
    const ok = await copyShareTextToClipboard(post);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleCopyLinkOnly = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(articleUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const success = await shareNative(post);
    if (!success) {
      // Fallback directly to WhatsApp
      handleOpenWhatsApp();
    }
  };

  const handleDownloadImage = () => {
    if (!post.coverImage) return;
    const a = document.createElement('a');
    a.href = getArticleImageUrl(post);
    a.download = `jornal-aberto-${post.id}-imagem.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-[#18191d] w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with WhatsApp branding */}
        <div className="bg-[#128C7E] dark:bg-[#075E54] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Compartilhar no WhatsApp
              </h3>
              <p className="text-xs text-white/80">
                Enunciado, imagem e link direto formatados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body & Live WhatsApp Simulation */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Como a mensagem aparecerá no WhatsApp:
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Imagem + Enunciado Inclusos
              </span>
            </div>

            {/* WhatsApp Chat Bubble Mockup */}
            <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-2xl border border-stone-300 dark:border-stone-800 shadow-inner">
              <div className="max-w-sm ml-auto bg-[#D9FDD3] dark:bg-[#005c4b] text-stone-900 dark:text-stone-100 rounded-2xl rounded-tr-xs p-3.5 shadow-sm space-y-2.5 text-xs sm:text-sm">
                
                {/* Image Preview within WhatsApp Bubble */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-200/50 dark:border-white/10 shadow-xs">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] backdrop-blur-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-amber-400" />
                    Capa da Matéria
                  </div>
                </div>

                {/* Enunciado (Headline) & Subtitle in WhatsApp format */}
                <div className="space-y-1">
                  <p className="font-bold text-stone-950 dark:text-white leading-snug">
                    📰 {post.category && post.category !== 'Sociedade' ? `[${post.category.toUpperCase()}] ` : ''}
                    {post.title}
                  </p>
                  {post.subtitle && (
                    <p className="text-stone-700 dark:text-stone-300 text-xs italic leading-relaxed">
                      {post.subtitle}
                    </p>
                  )}
                </div>

                {/* Rich Link Preview Box in WhatsApp */}
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10 text-[11px] space-y-1">
                  <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold block truncate">
                    👉 jornalaberto.com.br/?materia={post.id.substring(0, 16)}...
                  </span>
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] block">
                    Toque para ler a íntegra, ver fotos e comentar
                  </span>
                </div>

                {/* Time stamp */}
                <div className="text-right text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} &bull; Enviado ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5">
            {/* 1. Main Action: Direct WhatsApp Launch */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-stone-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/30 transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 text-stone-950" />
              <span>Abrir e Enviar no WhatsApp Agora</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-75" />
            </button>

            {/* 2. Secondary Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Copy Full Message */}
              <button
                onClick={handleCopyMessage}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  copiedText
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800/60'
                }`}
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-600" />
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>

              {/* Native Mobile Share */}
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800/60 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span>Compartilhar Nativo</span>
              </button>
            </div>

            {/* 3. Utility row: Copy Link & Download image */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <button
                onClick={handleCopyLinkOnly}
                className="hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link copiado!' : 'Copiar apenas link direto'}</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors"
                title="Baixar imagem em alta resolução para enviar como foto no WhatsApp"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Imagem da Capa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="bg-stone-50 dark:bg-[#121316] border-t border-stone-200 dark:border-stone-800 px-6 py-3 text-[11px] text-stone-500 dark:text-stone-400 font-mono text-center">
          Dica: No WhatsApp, cole o link e aguarde 2 segundos para o cartão com foto se formar antes de apertar Enviar.
        </div>
      </div>
    </div>
  );
}
