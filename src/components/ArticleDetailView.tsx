import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageSquare, 
  Clock, 
  Calendar, 
  User as UserIcon, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Send, 
  Bookmark, 
  Check, 
  Sparkles,
  Type,
  Edit3,
  Palette,
  X
} from 'lucide-react';
import { NewsPost, NewsComment, NewsCategory } from '../types/news.ts';
import { 
  toggleLikePost, 
  checkIfUserLiked, 
  addCommentToPost, 
  subscribeToComments, 
  deleteNewsPost,
  incrementPostViews,
  updateNewsPost
} from '../services/newsService.ts';
import { auth, signInWithPopup, googleProvider } from '../firebase/config.ts';
import ImageStudioModal from './ImageStudioModal.tsx';
import WhatsAppShareModal, { WhatsAppIcon } from './WhatsAppShareModal.tsx';
import { updateArticleOpenGraphMeta, openWhatsAppShare } from '../utils/shareUtils.ts';

interface ArticleDetailViewProps {
  post: NewsPost;
  onBack: () => void;
  onDeleted?: (postId: string) => void;
}

export default function ArticleDetailView({ post, onBack, onDeleted }: ArticleDetailViewProps) {
  const [currentPost, setCurrentPost] = useState<NewsPost>(post);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  
  const [comments, setComments] = useState<NewsComment[]>(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');

  // Edit post states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<string>(
    post.category === 'Sociedade' ? 'Política' : post.category
  );
  const [editCoverImage, setEditCoverImage] = useState<string>(post.coverImage);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Increment view count on mount and update Open Graph tags for WhatsApp sharing
  useEffect(() => {
    incrementPostViews(post.id);
    updateArticleOpenGraphMeta(currentPost);

    return () => {
      updateArticleOpenGraphMeta(null);
    };
  }, [post.id, currentPost]);


  // Check if current user liked
  useEffect(() => {
    let isMounted = true;
    checkIfUserLiked(post.id).then((liked) => {
      if (isMounted) setHasLiked(liked);
    });
    return () => {
      isMounted = false;
    };
  }, [post.id]);

  // Subscribe to real-time comments for this article
  useEffect(() => {
    const unsubscribe = subscribeToComments(
      post.id,
      (liveComments) => {
        setComments(liveComments);
      },
      (err) => console.warn('Comments subscription note:', err)
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [post.id]);

  // Stop speech if unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleLike = async () => {
    if (!auth.currentUser) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch {
        return;
      }
    }

    setIsLiking(true);
    try {
      const nowLiked = await toggleLikePost(post.id);
      setHasLiked(nowLiked);
      setLikesCount(prev => (nowLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!auth.currentUser) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch {
        return;
      }
    }

    setIsPostingComment(true);
    try {
      await addCommentToPost(post.id, commentInput);
      setCommentInput('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${post.title}. ${post.subtitle || ''}. ${post.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza de que deseja remover esta notícia da base pública?')) return;
    try {
      await deleteNewsPost(post.id);
      if (onDeleted) onDeleted(post.id);
      onBack();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erro ao excluir a publicação. Você precisa ser o autor original.');
    }
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await updateNewsPost(post.id, {
        category: editCategory as any,
        coverImage: editCoverImage
      });
      setCurrentPost(prev => ({
        ...prev,
        category: editCategory as any,
        coverImage: editCoverImage
      }));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update error:', err);
      alert('Erro ao atualizar notícia. Verifique sua conexão.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const isAuthor = auth.currentUser && (post as any).authorId === auth.currentUser.uid;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Feed Principal
        </button>

        <div className="flex items-center gap-2">
          {/* Read Aloud */}
          <button
            onClick={toggleSpeech}
            title={isSpeaking ? 'Pausar leitura em voz alta' : 'Ouvir matéria com narração de voz'}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSpeaking
                ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-200'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Parar Leitura' : 'Ouvir Notícia'}</span>
          </button>

          {/* Edit Category or Cover */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Editar Categoria ou Trocar Capa"
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Editar Matéria / Capa</span>
          </button>

          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center border border-stone-200 dark:border-stone-700 rounded-xl p-1 bg-white dark:bg-stone-800/80">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                fontSize === 'normal'
                  ? 'bg-stone-900 dark:bg-amber-600 text-white'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 text-sm rounded-lg font-bold transition-colors ${
                fontSize === 'large'
                  ? 'bg-stone-900 dark:bg-amber-600 text-white'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-1 text-base rounded-lg font-extrabold transition-colors ${
                fontSize === 'huge'
                  ? 'bg-stone-900 dark:bg-amber-600 text-white'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              A++
            </button>
          </div>

          {/* WhatsApp Share */}
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Compartilhar no WhatsApp com imagem e enunciado"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
          </button>


          {/* Delete (if author) */}
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Excluir esta publicação da base de dados pública"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pill and Breaking stamp */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {currentPost.breakingNews && (
          <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
            URGENTE
          </span>
        )}
        {currentPost.category && currentPost.category !== 'Sociedade' && (
          <span className="px-3 py-1 rounded-full bg-stone-900 dark:bg-stone-800 text-stone-100 text-xs font-bold uppercase tracking-wider font-mono">
            {currentPost.category}
          </span>
        )}
        <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {currentPost.readTimeMinutes} min de leitura
        </span>
        <span className="text-xs text-stone-400 dark:text-stone-600">&bull;</span>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {currentPost.views || 1} visualizações na base pública
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 dark:text-stone-100 leading-[1.15] mb-4">
        {post.title}
      </h1>

      {/* Subtitle / Linha-fina */}
      {post.subtitle && (
        <p className="font-serif text-lg sm:text-xl text-stone-600 dark:text-stone-300 leading-relaxed italic mb-6">
          {post.subtitle}
        </p>
      )}

      {/* Author and Date metadata */}
      <div className="flex items-center justify-between py-4 border-y border-stone-200 dark:border-stone-800 mb-8">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
            alt={post.authorName}
            className="w-11 h-11 rounded-full object-cover border border-stone-300 dark:border-stone-700 shadow-sm"
          />
          <div>
            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
              {post.authorName}
              <span className="text-xs text-stone-400 dark:text-stone-500 font-normal font-mono">{post.authorHandle || ''}</span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Publicado em {formattedDate}
            </div>
          </div>
        </div>

        {/* Like & Comment Quick Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              hasLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount}</span>
          </button>
        </div>
      </div>

      {/* FULL COVER IMAGE CREATED BY THE USER */}
      <figure className="mb-10">
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-800 shadow-xl bg-stone-900">
          <img
            src={currentPost.coverImage}
            alt={currentPost.title}
            className="w-full h-full object-cover dark:brightness-[0.93]"
          />
        </div>
        {post.coverCaption && (
          <figcaption className="text-xs text-stone-500 dark:text-stone-400 italic mt-2.5 px-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            {post.coverCaption}
          </figcaption>
        )}
      </figure>

      {/* WhatsApp Feature Share Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-stone-950 flex items-center justify-center shrink-0 shadow-md">
            <WhatsAppIcon className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Compartilhar matéria no WhatsApp
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                Foto + Enunciado
              </span>
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Gera a mensagem com manchete formatada, linha-fina, imagem de capa e link direto.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsWhatsAppModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/25 transition-all shrink-0 cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 text-stone-950" />
          <span>Enviar no WhatsApp</span>
        </button>
      </div>


      {/* ARTICLE BODY */}
      <div 
        className={`font-serif text-stone-800 dark:text-stone-200 leading-relaxed mb-12 space-y-6 ${
          fontSize === 'large' 
            ? 'text-xl sm:text-2xl leading-[1.7]' 
            : fontSize === 'huge'
            ? 'text-2xl sm:text-3xl leading-[1.8]'
            : 'text-lg sm:text-xl leading-[1.7]'
        }`}
      >
        {post.content.split('\n\n').map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={index} className="font-serif font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 mt-8 mb-4 tracking-tight">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={index} className="font-serif font-black text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 mt-10 mb-4 tracking-tight border-b border-stone-200 dark:border-stone-800 pb-2">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={index} className="border-l-4 border-amber-600 dark:border-amber-500 pl-4 py-2 italic text-stone-700 dark:text-stone-300 bg-amber-50/40 dark:bg-amber-950/20 rounded-r-xl my-6">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          return (
            <p key={index} className="text-stone-800 dark:text-stone-200">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-3 font-mono">
            Tópicos e Tags Relacionadas:
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Appreciation Box */}
      <div className="p-6 rounded-2xl bg-stone-900 dark:bg-[#151619] text-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-stone-800 dark:border-stone-800/80 mb-12">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-base text-stone-100">Gostou desta reportagem?</h4>
          <p className="text-xs text-stone-400">
            Deixe sua curtida e apoie a circulação livre de informações na base pública do Jornal Aberto.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
            title="Compartilhar matéria com amigos e grupos no WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 text-stone-950" />
            <span>Compartilhar no WhatsApp</span>
          </button>

          <button
            onClick={handleToggleLike}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              hasLiked
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
            {hasLiked ? 'Curtido por você' : 'Curtir Notícia'} ({likesCount})
          </button>
        </div>

      </div>

      {/* COMMENTS SECTION */}
      <section className="pt-6 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-black text-2xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-700 dark:text-amber-500" />
            Comentários Públicos ({comments.length})
          </h3>
          <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
            Atualizações em tempo real
          </span>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSendComment} className="mb-8">
          <div className="bg-white dark:bg-[#18191d] rounded-2xl border border-stone-300 dark:border-stone-800 p-4 shadow-sm focus-within:border-amber-600 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={
                auth.currentUser
                  ? `Comentar como ${auth.currentUser.displayName || 'você'}...`
                  : 'Escreva um comentário público sobre esta matéria (será solicitado login Google)...'
              }
              className="w-full bg-transparent text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 mt-2">
              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                Respeite as diretrizes de convivência comunitária.
              </span>
              <button
                type="submit"
                disabled={isPostingComment || !commentInput.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                {isPostingComment ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs">
              Nenhum comentário publicado ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-white dark:bg-[#18191d] border border-stone-200 dark:border-stone-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                    />
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-200">{comment.authorName}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed pl-9">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Edit Modal to update category or cover image */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#18191d] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                Editar Categoria e Capa da Notícia
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Escolha a Nova Categoria / Tema:
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-stone-100 font-medium focus:outline-none focus:border-amber-600"
              >
                {['Política', 'Esportes', 'Tecnologia', 'Ciência', 'Cultura', 'Economia', 'Mundo', 'Meio Ambiente'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Cover Image Preview & Studio Button */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Imagem de Capa Atual:
              </label>
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-300 dark:border-stone-800 bg-stone-900 mb-3">
                <img
                  src={editCoverImage}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsStudioOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Palette className="w-4 h-4" />
                Abrir Estúdio para Criar / Trocar Capa (Sem Selo)
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Studio Modal for updating cover image */}
      <ImageStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSelectImage={(newImgUrl) => {
          setEditCoverImage(newImgUrl);
        }}
        initialHeadline={currentPost.title}
        initialCategory=""
      />

      {/* WhatsApp Share Modal with rich preview */}
      <WhatsAppShareModal
        post={currentPost}
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

    </article>

  );
}
