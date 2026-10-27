import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  PlusCircle, 
  Flame, 
  Heart, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Palette, 
  Sparkles, 
  Share2, 
  LogIn, 
  LogOut, 
  Filter,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  Sun,
  Moon,
  BookOpen
} from 'lucide-react';
import { NewsPost, NewsCategory } from './types/news.ts';
import { 
  subscribeToPosts, 
  seedInitialPostsIfEmpty, 
  toggleLikePost,
  checkIfUserLiked,
  getNewsPostById
} from './services/newsService.ts';
import { 
  auth, 
  signInWithPopup, 
  signOut, 
  googleProvider, 
  onAuthStateChanged, 
  User,
  testFirestoreConnection
} from './firebase/config.ts';
import CreateNewsModal from './components/CreateNewsModal.tsx';
import ArticleDetailView from './components/ArticleDetailView.tsx';
import WhatsAppShareModal, { WhatsAppIcon } from './components/WhatsAppShareModal.tsx';


export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Theme state: reading-focused dark mode and light mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jornal_aberto_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('jornal_aberto_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('jornal_aberto_theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation: Detail view
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  // WhatsApp Share Modal state
  const [postToShareWhatsApp, setPostToShareWhatsApp] = useState<NewsPost | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // URL Deep-Linking: Open article from ?materia=<id> or ?artigo=<id>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const materiaId = params.get('materia') || params.get('artigo');
    if (materiaId) {
      const found = posts.find((p) => p.id === materiaId);
      if (found) {
        setSelectedPost(found);
      } else if (!isLoading) {
        getNewsPostById(materiaId).then((p) => {
          if (p) setSelectedPost(p);
        });
      }
    }
  }, [posts, isLoading]);

  // Popstate listener for browser forward/back buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const materiaId = params.get('materia') || params.get('artigo');
      if (!materiaId) {
        setSelectedPost(null);
      } else {
        const found = posts.find((p) => p.id === materiaId);
        if (found) {
          setSelectedPost(found);
        } else {
          getNewsPostById(materiaId).then((p) => {
            if (p) setSelectedPost(p);
          });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts]);

  // Navigate to article with canonical ?materia= in URL
  const handleOpenPost = (post: NewsPost) => {
    setSelectedPost(post);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('materia', post.id);
      window.history.pushState({ materiaId: post.id }, '', url.toString());
    } catch (e) {
      console.warn('URL pushState notice:', e);
    }
  };

  // Back to feed and clean URL query param
  const handleBackToFeed = () => {
    setSelectedPost(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('materia');
      url.searchParams.delete('artigo');
      window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
    } catch (e) {
      console.warn('URL replace notice:', e);
    }
  };

  // Auth listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Initialize Firestore and subscribe to real-time posts
  useEffect(() => {
    testFirestoreConnection();
    seedInitialPostsIfEmpty();

    const unsubPosts = subscribeToPosts(
      (livePosts) => {
        setPosts(livePosts);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Realtime subscription notice:', err);
        setIsLoading(false);
      }
    );

    return () => {
      if (unsubPosts) unsubPosts();
    };
  }, []);


  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Filter and sort logic
  const filteredPosts = posts.filter((p) => {
    // Category filter
    if (selectedCategory === 'Destaques') {
      if (!p.featured && !p.breakingNews) return false;
    } else if (selectedCategory !== 'Todos') {
      if (p.category !== selectedCategory) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSubtitle = (p.subtitle || '').toLowerCase().includes(q);
      const matchAuthor = p.authorName.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSubtitle && !matchAuthor && !matchTags) return false;
    }

    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views + b.likes * 5) - (a.views + a.likes * 5);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Breaking news banner post
  const breakingPost = posts.find((p) => p.breakingNews);
  
  // Featured lead post for hero section
  const leadPost = sortedPosts.length > 0 ? sortedPosts[0] : null;
  const secondaryPosts = sortedPosts.slice(1);

  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#121316] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900 transition-colors duration-300">
      
      {/* 1. TOP UTILITY BAR */}
      <div className="border-b border-stone-200 dark:border-stone-800/80 bg-stone-900 dark:bg-[#0c0d0f] text-stone-300 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-mono text-stone-400 capitalize">
              {formattedDate}
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Base Pública Firestore Ativa &bull; Sincronização em Tempo Real
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick theme toggle in top bar */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-stone-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-mono transition-colors"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Leitura (Escuro)'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Modo Leitura</span>
                </>
              )}
            </button>

            <span className="text-stone-700">|</span>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                    alt={currentUser.displayName || 'Usuário'}
                    className="w-5 h-5 rounded-full object-cover border border-stone-600"
                  />
                  <span className="text-stone-200 font-medium">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-stone-400 hover:text-stone-100 flex items-center gap-1 text-[11px] underline transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1 rounded-lg transition-colors font-medium text-[11px]"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                Entrar com Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. EDITORIAL MASTHEAD */}
      <header className="border-b border-stone-300 dark:border-stone-800 bg-white dark:bg-[#18191d] shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo and Tagline */}
            <div 
              onClick={() => {
                handleBackToFeed();
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="text-center md:text-left cursor-pointer group"
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <span className="p-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-amber-400 group-hover:scale-105 transition-transform">
                  <Newspaper className="w-7 h-7" />
                </span>
                <h1 className="font-serif font-black text-4xl sm:text-5xl text-stone-950 dark:text-stone-100 tracking-tighter">
                  JORNAL ABERTO
                </h1>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">
                Rede Pública &bull; Jornalismo Colaborativo &bull; Imagens Livres
              </p>
            </div>

            {/* Actions: Theme Toggle & Write News */}
            <div className="flex items-center gap-3">
              {/* Reading Theme Toggle Button in Header */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Mudar para Modo Claro (Diurno)' : 'Mudar para Modo Leitura (Escuro Confortável)'}
                aria-label={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro focado na leitura'}
                className="px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700/80 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/90 dark:hover:bg-stone-700/90 text-stone-800 dark:text-stone-100 font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all active:scale-95 shadow-xs"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-stone-700" />
                    <span>Modo Leitura</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all group"
              >
                <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Publicar Notícia com Imagem</span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. BREAKING NEWS TICKER */}
        {breakingPost && (
          <div className="bg-red-700 text-white text-xs font-semibold px-4 sm:px-8 py-2.5 flex items-center gap-3 overflow-hidden">
            <span className="flex items-center gap-1 bg-white text-red-700 font-black px-2 py-0.5 rounded uppercase tracking-wider text-[11px] shrink-0 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              Plantão Urgente
            </span>
            <div 
              onClick={() => handleOpenPost(breakingPost)}
              className="truncate cursor-pointer hover:underline text-stone-100 font-serif text-sm flex-1"
            >
              <strong>{breakingPost.title}</strong> — {breakingPost.subtitle || 'Confira os desdobramentos na íntegra.'}
            </div>
          </div>
        )}
      </header>

      {/* 5. MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        
        {/* If an article is open in detail view */}
        {selectedPost ? (
          <ArticleDetailView
            post={selectedPost}
            onBack={handleBackToFeed}
            onDeleted={(deletedId) => {
              setPosts(prev => prev.filter(p => p.id !== deletedId));
              handleBackToFeed();
            }}
          />
        ) : (

          <div className="space-y-10 animate-fade-in">
            
            {/* Feed Subheader with Sorting & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-300 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-black text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
                  {selectedCategory === 'Todos' ? 'Edição Geral' : selectedCategory}
                </h2>
                <span className="text-xs font-mono text-stone-500 dark:text-stone-400 bg-stone-200/80 dark:bg-stone-800 px-2 py-0.5 rounded-full font-semibold">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'notícia' : 'notícias'} públicas
                </span>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 dark:text-stone-400 font-medium">Ordenar por:</span>
                <div className="flex rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-0.5">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      sortBy === 'recent'
                        ? 'bg-stone-900 dark:bg-amber-600 text-white'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Mais Recentes
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      sortBy === 'popular'
                        ? 'bg-stone-900 dark:bg-amber-600 text-white'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    Mais Populares
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {sortedPosts.length === 0 && !isLoading && (
              <div className="py-20 text-center bg-white dark:bg-[#18191d] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Newspaper className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-800 dark:text-stone-100">
                  Nenhuma notícia encontrada para este filtro
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                  {searchQuery 
                    ? `Não foram encontrados resultados para "${searchQuery}". Tente outros termos.`
                    : 'Esta editoria ainda não possui postagens cadastradas. Que tal ser o primeiro a publicar?'}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Criar e Ilustrar Notícia Agora
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="py-24 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <p className="text-sm font-serif text-stone-500 dark:text-stone-400">
                  Carregando matérias da base pública de notícias...
                </p>
              </div>
            )}

            {/* HERO LEAD STORY (Capitular) */}
            {leadPost && (
              <section className="bg-white dark:bg-[#18191d] rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-md hover:shadow-xl dark:shadow-black/50 transition-all overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Lead Image (created by author) */}
                  <div 
                    onClick={() => handleOpenPost(leadPost)}
                    className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto cursor-pointer overflow-hidden bg-stone-900"
                  >
                    <img
                      src={leadPost.coverImage}
                      alt={leadPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 dark:brightness-[0.93]"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {leadPost.breakingNews && (
                        <span className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-md">
                          URGENTE
                        </span>
                      )}
                      {leadPost.category && leadPost.category !== 'Sociedade' && (
                        <span className="px-3 py-1 rounded-md bg-stone-900/90 dark:bg-stone-950/90 backdrop-blur-md text-amber-400 text-xs font-bold uppercase tracking-wider shadow-md">
                          {leadPost.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lead Editorial Copy */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{leadPost.readTimeMinutes} min de leitura</span>
                        <span>&bull;</span>
                        <span>{leadPost.views} leitores</span>
                      </div>

                      <h3 
                        onClick={() => handleOpenPost(leadPost)}
                        className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-stone-950 dark:text-stone-100 leading-[1.15] cursor-pointer group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors"
                      >
                        {leadPost.title}
                      </h3>

                      {leadPost.subtitle && (
                        <p className="font-serif text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                          {leadPost.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Author & Footer Interactions */}
                    <div className="pt-6 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={leadPost.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                          alt={leadPost.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-200 block leading-tight">
                            {leadPost.authorName}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {new Date(leadPost.createdAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                        {/* WhatsApp Direct Share Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToShareWhatsApp(leadPost);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="Compartilhar matéria no WhatsApp com foto e enunciado"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        <span className="flex items-center gap-1 hover:text-rose-600 transition-colors">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {leadPost.likes}
                        </span>
                        <span className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                          {leadPost.comments?.length || 0}
                        </span>
                      </div>
                    </div>


                  </div>
                </div>
              </section>
            )}

            {/* SECONDARY STORIES GRID */}
            {secondaryPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {secondaryPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => handleOpenPost(post)}
                    className="bg-white dark:bg-[#18191d] rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs hover:shadow-lg dark:shadow-black/50 transition-all overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1 duration-200"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 dark:brightness-[0.93]"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {post.breakingNews && (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                            URGENTE
                          </span>
                        )}
                        {post.category && post.category !== 'Sociedade' && (
                          <span className="px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[10px] font-bold uppercase tracking-wider">
                            {post.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Copy */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                          <span>{post.readTimeMinutes} min de leitura</span>
                          <span>&bull;</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                        </div>

                        <h4 className="font-serif font-black text-xl text-stone-900 dark:text-stone-100 leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                          {post.title}
                        </h4>

                        {post.subtitle && (
                          <p className="font-serif text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                            {post.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Author & Metrics */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80'}
                            alt={post.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                          />
                          <span className="font-medium text-stone-700 dark:text-stone-300 text-xs truncate max-w-[120px]">
                            {post.authorName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-stone-400 font-medium">
                          {/* Quick WhatsApp Share from feed */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostToShareWhatsApp(post);
                            }}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Compartilhar no WhatsApp com imagem e enunciado"
                            aria-label="Compartilhar no WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                          </button>

                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-500" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-stone-400" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>

                    </div>
                  </article>
                ))}
              </div>
            )}


            {/* INVITATION CALLOUT BANNER */}
            <div className="p-8 rounded-3xl bg-stone-900 dark:bg-[#151619] text-stone-100 relative overflow-hidden shadow-xl border border-stone-800 dark:border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left z-10 max-w-xl">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold tracking-wide uppercase inline-flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Estúdio Visual & Base Pública
                </span>
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-stone-100">
                  Tem uma apuração ou história para contar?
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  Crie a arte da capa no nosso estúdio com tipografia de jornal ou gere ilustrações com inteligência artificial, e publique diretamente para todos os leitores.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm flex items-center gap-2 shrink-0 shadow-lg shadow-amber-500/25 transition-all z-10 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Minha Notícia
              </button>

              {/* Decorative background glow */}
              <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
            </div>

          </div>
        )}

      </main>

      {/* 6. EDITORIAL FOOTER */}
      <footer className="border-t border-stone-300 dark:border-stone-800 bg-stone-900 dark:bg-[#0c0d0f] text-stone-400 text-xs py-10 px-4 sm:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-serif font-bold text-base text-stone-100">
                Jornal Aberto
              </p>
              <p className="text-[11px] text-stone-500 font-mono">
                Plataforma Colaborativa de Notícias e Artes Jornalísticas com Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-stone-400 text-xs">
            <span>Base Pública Segura</span>
            <span>&bull;</span>
            <span>Armazenamento Otimizado</span>
            <span>&bull;</span>
            <span>Licença Aberta</span>
          </div>
        </div>
      </footer>

      {/* MODAL: CREATE NEWS & IMAGE */}
      <CreateNewsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(newId) => {
          // Look for newly created post or switch view
          const found = posts.find(p => p.id === newId);
          if (found) {
            handleOpenPost(found);
          }
        }}
      />

      {/* MODAL: WHATSAPP SHARE FROM FEED */}
      <WhatsAppShareModal
        post={postToShareWhatsApp}
        isOpen={Boolean(postToShareWhatsApp)}
        onClose={() => setPostToShareWhatsApp(null)}
      />

    </div>

  );
}
