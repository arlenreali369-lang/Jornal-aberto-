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
  Type
} from 'lucide-react';
import { NewsPost, NewsComment } from '../types/news.ts';
import { 
  toggleLikePost, 
  checkIfUserLiked, 
  addCommentToPost, 
  subscribeToComments, 
  deleteNewsPost,
  incrementPostViews
} from '../services/newsService.ts';
import { auth, signInWithPopup, googleProvider } from '../firebase/config.ts';

interface ArticleDetailViewProps {
  post: NewsPost;
  onBack: () => void;
  onDeleted?: (postId: string) => void;
}

export default function ArticleDetailView({ post, onBack, onDeleted }: ArticleDetailViewProps) {
  const [likesCount, setLikesCount] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const [comments, setComments] = useState<NewsComment[]>(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');

  // Increment view count on mount
  useEffect(() => {
    incrementPostViews(post.id);
  }, [post.id]);

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
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors group"
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
                : 'border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Parar Leitura' : 'Ouvir Notícia'}</span>
          </button>

          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center border border-stone-200 rounded-xl p-1 bg-white">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                fontSize === 'normal' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 text-sm rounded-lg font-bold transition-colors ${
                fontSize === 'large' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-1 text-base rounded-lg font-extrabold transition-colors ${
                fontSize === 'huge' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              A++
            </button>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
          </button>

          {/* Delete (if author) */}
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
        {post.breakingNews && (
          <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
            URGENTE
          </span>
        )}
        <span className="px-3 py-1 rounded-full bg-stone-900 text-stone-100 text-xs font-bold uppercase tracking-wider font-mono">
          {post.category}
        </span>
        <span className="text-xs text-stone-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes} min de leitura
        </span>
        <span className="text-xs text-stone-400">&bull;</span>
        <span className="text-xs text-stone-500">
          {post.views || 1} visualizações na base pública
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 leading-[1.15] mb-4">
        {post.title}
      </h1>

      {/* Subtitle / Linha-fina */}
      {post.subtitle && (
        <p className="font-serif text-lg sm:text-xl text-stone-600 leading-relaxed italic mb-6">
          {post.subtitle}
        </p>
      )}

      {/* Author and Date metadata */}
      <div className="flex items-center justify-between py-4 border-y border-stone-200 mb-8">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
            alt={post.authorName}
            className="w-11 h-11 rounded-full object-cover border border-stone-300 shadow-sm"
          />
          <div>
            <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              {post.authorName}
              <span className="text-xs text-stone-400 font-normal font-mono">{post.authorHandle || ''}</span>
            </div>
            <div className="text-xs text-stone-500 flex items-center gap-1">
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
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesCount}</span>
          </button>
        </div>
      </div>

      {/* FULL COVER IMAGE CREATED BY THE USER */}
      <figure className="mb-10">
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-stone-300 shadow-xl bg-stone-900">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        {post.coverCaption && (
          <figcaption className="text-xs text-stone-500 italic mt-2.5 px-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            {post.coverCaption}
          </figcaption>
        )}
      </figure>

      {/* ARTICLE BODY */}
      <div 
        className={`font-serif text-stone-800 leading-relaxed mb-12 space-y-6 ${
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
              <h3 key={index} className="font-serif font-black text-2xl sm:text-3xl text-stone-900 mt-8 mb-4 tracking-tight">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={index} className="font-serif font-black text-3xl sm:text-4xl text-stone-900 mt-10 mb-4 tracking-tight border-b pb-2">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={index} className="border-l-4 border-amber-600 pl-4 py-2 italic text-stone-700 bg-amber-50/40 rounded-r-xl my-6">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          return (
            <p key={index} className="text-stone-800">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-stone-200 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-3 font-mono">
            Tópicos e Tags Relacionadas:
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Appreciation Box */}
      <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl mb-12">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-base text-stone-100">Gostou desta reportagem?</h4>
          <p className="text-xs text-stone-400">
            Deixe sua curtida e apoie a circulação livre de informações na base pública do Jornal Aberto.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      <section className="pt-6 border-t border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-black text-2xl text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-700" />
            Comentários Públicos ({comments.length})
          </h3>
          <span className="text-xs font-mono text-stone-500">
            Atualizações em tempo real
          </span>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSendComment} className="mb-8">
          <div className="bg-white rounded-2xl border border-stone-300 p-4 shadow-sm focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={
                auth.currentUser
                  ? `Comentar como ${auth.currentUser.displayName || 'você'}...`
                  : 'Escreva um comentário público sobre esta matéria (será solicitado login Google)...'
              }
              className="w-full bg-transparent text-stone-900 text-sm placeholder-stone-400 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
              <span className="text-[11px] text-stone-400">
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
            <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
              Nenhum comentário publicado ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-stone-200"
                    />
                    <span className="font-bold text-xs text-stone-900">{comment.authorName}</span>
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
                <p className="text-stone-700 text-sm leading-relaxed pl-9">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

    </article>
  );
}
