import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Palette, 
  Image as ImageIcon, 
  Tag, 
  Flame, 
  Star, 
  User as UserIcon, 
  AlertCircle,
  CheckCircle2,
  FileText,
  Wand2
} from 'lucide-react';
import { auth, signInWithPopup, googleProvider } from '../firebase/config.ts';
import { createNewsPost } from '../services/newsService.ts';
import { NewsCategory, CreatePostPayload } from '../types/news.ts';
import { generateEditorialAssistance } from '../services/geminiService.ts';
import ImageStudioModal from './ImageStudioModal.tsx';

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (postId: string) => void;
}

const CATEGORIES: Exclude<NewsCategory, 'Todos' | 'Destaques'>[] = [
  'Política',
  'Economia',
  'Tecnologia',
  'Ciência',
  'Cultura',
  'Esportes',
  'Mundo',
  'Meio Ambiente',
  'Sociedade'
];

export default function CreateNewsModal({
  isOpen,
  onClose,
  onPostCreated
}: CreateNewsModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Exclude<NewsCategory, 'Todos' | 'Destaques'>>('Tecnologia');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [coverCaption, setCoverCaption] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('Tecnologia, Notícias');
  const [authorName, setAuthorName] = useState(auth.currentUser?.displayName || 'Redator Colaborador');
  const [breakingNews, setBreakingNews] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Studio Modal
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // AI Assistant states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectImageFromStudio = (imgUrl: string, caption?: string) => {
    setCoverImage(imgUrl);
    if (caption) setCoverCaption(caption);
  };

  const handleAiAssistance = async (type: 'headline' | 'summary' | 'full_article') => {
    const inputTopic = title || subtitle || 'Tendências da tecnologia moderna';
    setIsAiLoading(true);
    setStatusMessage(null);
    try {
      const result = await generateEditorialAssistance(inputTopic, type);
      if (type === 'headline') {
        const lines = result.split('\n').filter(l => l.trim().length > 0);
        setAiSuggestions(lines);
      } else if (type === 'summary') {
        setSubtitle(result);
      } else if (type === 'full_article') {
        setContent(result);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Não foi possível consultar o assistente de redação no momento.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user.displayName) {
        setAuthorName(res.user.displayName);
      }
    } catch (err) {
      console.error('Google Sign-in error:', err);
      setStatusMessage({ type: 'error', text: 'Falha no login com Google. Tente novamente.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!auth.currentUser) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Por favor, conecte-se com sua conta Google acima para publicar na base de dados pública.' 
      });
      return;
    }

    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'A notícia precisa ter uma manchete/título.' });
      return;
    }

    if (!content.trim()) {
      setStatusMessage({ type: 'error', text: 'O corpo da matéria não pode estar vazio.' });
      return;
    }

    if (!coverImage) {
      setStatusMessage({ type: 'error', text: 'Crie ou envie uma imagem no Estúdio de Capa para ilustrar a notícia.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(/[,#]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload: CreatePostPayload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        category,
        coverImage,
        coverCaption: coverCaption.trim(),
        authorName: authorName.trim() || auth.currentUser.displayName || 'Jornalista Colaborador',
        authorAvatar: auth.currentUser.photoURL || undefined,
        tags: tags.length ? tags : [category],
        breakingNews,
        featured,
      };

      const newPostId = await createNewsPost(payload);
      setStatusMessage({ type: 'success', text: 'Notícia publicada com sucesso na base de dados pública!' });
      setTimeout(() => {
        onPostCreated(newPostId);
        onClose();
      }, 700);
    } catch (error) {
      console.error(error);
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Falha ao gravar no Firestore. Verifique suas permissões.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-md animate-fade-in">
        <div className="bg-stone-50 dark:bg-[#18191d] text-stone-900 dark:text-stone-100 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1b1f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
                  Nova Notícia &bull; Redação Pública
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                  Escreva e ilustre sua notícia para que todos os leitores da rede possam visualizar em tempo real.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Auth Banner if not logged in */}
            {!auth.currentUser ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Para enviar para o banco de dados público com segurança e autoria verificada, conecte sua conta Google:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 transition-colors shadow-sm"
                >
                  Entrar com Google
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <img 
                    src={auth.currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'} 
                    alt="Perfil" 
                    className="w-6 h-6 rounded-full object-cover border border-stone-300" 
                  />
                  <span>
                    Publicando como: <strong className="text-stone-900">{auth.currentUser.displayName || auth.currentUser.email}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                  Autenticado &bull; Acesso de Escrita
                </span>
              </div>
            )}

            {/* Title & AI Headline Helper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Manchete Principal *
                </label>
                <button
                  type="button"
                  onClick={() => handleAiAssistance('headline')}
                  disabled={isAiLoading}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Sugerir Manchetes (IA)
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Cientistas desenvolvem nova técnica para reciclar baterias em escala industrial"
                className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-900 font-serif font-bold text-lg placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-sm"
              />

              {aiSuggestions.length > 0 && (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1.5 text-xs text-stone-800">
                  <span className="font-bold text-amber-900 block">Sugestões de Manchete (clique para aplicar):</span>
                  {aiSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTitle(sug.replace(/^\d+[\.\)]\s*/, '').replace(/["']/g, ''));
                        setAiSuggestions([]);
                      }}
                      className="block text-left w-full hover:bg-amber-100/70 p-1.5 rounded transition-colors text-stone-700 font-serif"
                    >
                      &bull; {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitle / Linha-fina */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Subtítulo / Linha-Fina
                </label>
                <button
                  type="button"
                  onClick={() => handleAiAssistance('summary')}
                  disabled={isAiLoading || !title}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar Resumo da Manchete
                </button>
              </div>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Uma frase complementar contextualizando a notícia para o leitor..."
                className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-sm"
              />
            </div>

            {/* Category and Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Editoria / Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={breakingNews}
                    onChange={(e) => setBreakingNews(e.target.checked)}
                    className="rounded border-stone-300 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="flex items-center gap-1 text-red-700">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    Plantão Urgente (Breaking)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="flex items-center gap-1 text-amber-800">
                    <Star className="w-3.5 h-3.5 text-amber-600" />
                    Destacar na Capa
                  </span>
                </label>
              </div>
            </div>

            {/* COVER IMAGE SECTION - KEY REQUIREMENT */}
            <div className="space-y-3 p-4 rounded-2xl bg-amber-50/40 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-700" />
                    Imagem de Capa da Notícia *
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Você pode desenhar um cartaz no Canvas, gerar ilustrações com IA ou enviar sua foto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStudioOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Palette className="w-4 h-4" />
                  {coverImage ? 'Alterar no Estúdio' : 'Abrir Estúdio de Imagem'}
                </button>
              </div>

              {coverImage ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-3 rounded-xl border border-stone-200">
                  <div className="md:col-span-5 aspect-[16/9] rounded-lg overflow-hidden border border-stone-200 bg-stone-900 shadow-inner">
                    <img 
                      src={coverImage} 
                      alt="Capa selecionada" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Imagem gerada e anexada com sucesso
                    </span>
                    <input
                      type="text"
                      value={coverCaption}
                      onChange={(e) => setCoverCaption(e.target.value)}
                      placeholder="Legenda ou crédito da foto (opcional)..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsStudioOpen(true)}
                        className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline"
                      >
                        Editar ou gerar outra capa
                      </button>
                      <span className="text-stone-300">|</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remover imagem
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsStudioOpen(true)}
                  className="border-2 border-dashed border-amber-300 hover:border-amber-500 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white/60 group"
                >
                  <div className="p-3 rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform mb-2">
                    <Palette className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-stone-800">
                    Clique para Criar ou Enviar a Imagem de Capa
                  </span>
                  <p className="text-xs text-stone-500 mt-1 max-w-md">
                    Use o Designer de Capas com gradientes e tipografia de jornal, o gerador de arte vetorial ou faça upload do seu arquivo.
                  </p>
                </div>
              )}
            </div>

            {/* Article Body Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Corpo da Notícia / Reportagem *
                </label>
                <button
                  type="button"
                  onClick={() => handleAiAssistance('full_article')}
                  disabled={isAiLoading || !title}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Rascunhar Matéria Completa (IA)
                </button>
              </div>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva a apuração, fatos, citações de fontes e desdobramentos. Suporta títulos com '###' e parágrafos normais..."
                className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800 font-serif text-base leading-relaxed placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-sm"
              />
            </div>

            {/* Tags and Author info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Tags (separadas por vírgula)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Inovação, Brasil, Clima, Economia"
                    className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Nome do Autor / Correspondente
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Seu nome ou pseudônimo jornalístico"
                    className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Status alerts */}
            {statusMessage && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium ${
                statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                {isSubmitting ? 'Enviando para a Base Pública...' : 'Publicar Notícia Agora'}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Embedded Image Studio Modal */}
      <ImageStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSelectImage={handleSelectImageFromStudio}
        initialHeadline={title || 'Manchete em Foco'}
        initialCategory={category}
      />
    </>
  );
}
