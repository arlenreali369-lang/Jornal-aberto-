import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  PlusCircle, 
  Search, 
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
  Bookmark
} from 'lucide-react';
import { NewsPost, NewsCategory } from './types/news.ts';
import { 
  subscribeToPosts, 
  seedInitialPostsIfEmpty, 
  toggleLikePost,
  checkIfUserLiked
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

const CATEGORIES: NewsCategory[] = [
  'Todos',
  'Destaques',
  'Tecnologia',
  'Ciência',
  'Cultura',
  'Economia',
  'Mundo',
  'Meio Ambiente',
  'Sociedade'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Navigation: Detail view
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* 1. TOP UTILITY BAR */}
      <div className="border-b border-stone-200 bg-stone-900 text-stone-300 text-xs py-2 px-4 sm:px-8">
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
      <header className="border-b border-stone-300 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo and Tagline */}
            <div 
              onClick={() => {
                setSelectedPost(null);
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="text-center md:text-left cursor-pointer group"
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <span className="p-2 rounded-xl bg-stone-900 text-amber-400 group-hover:scale-105 transition-transform">
                  <Newspaper className="w-7 h-7" />
                </span>
                <h1 className="font-serif font-black text-4xl sm:text-5xl text-stone-950 tracking-tighter">
                  JORNAL ABERTO
                </h1>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500">
                Rede Pública &bull; Jornalismo Colaborativo &bull; Imagens Livres
              </p>
            </div>

            {/* Actions: Write News & Create Image */}
            <div className="flex items-center gap-3">
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
              onClick={() => setSelectedPost(breakingPost)}
              className="truncate cursor-pointer hover:underline text-stone-100 font-serif text-sm flex-1"
            >
              <strong>{breakingPost.title}</strong> — {breakingPost.subtitle || 'Confira os desdobramentos na íntegra.'}
            </div>
          </div>
        )}

        {/* 4. CATEGORY NAVIGATION & SEARCH */}
        <div className="border-t border-stone-200 bg-stone-50/80 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-2.5">
            
            {/* Categories */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedPost(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat && !selectedPost
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar notícias, tags ou autor..."
                className="w-full bg-white border border-stone-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  &times;
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 5. MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        
        {/* If an article is open in detail view */}
        {selectedPost ? (
          <ArticleDetailView
            post={selectedPost}
            onBack={() => setSelectedPost(null)}
            onDeleted={(deletedId) => {
              setPosts(prev => prev.filter(p => p.id !== deletedId));
              setSelectedPost(null);
            }}
          />
        ) : (
          <div className="space-y-10 animate-fade-in">
            
            {/* Feed Subheader with Sorting & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-300">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-black text-2xl text-stone-900 tracking-tight">
                  {selectedCategory === 'Todos' ? 'Edição Geral' : selectedCategory}
                </h2>
                <span className="text-xs font-mono text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full font-semibold">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'notícia' : 'notícias'} públicas
                </span>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 font-medium">Ordenar por:</span>
                <div className="flex rounded-lg border border-stone-300 bg-white p-0.5">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      sortBy === 'recent'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Mais Recentes
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      sortBy === 'popular'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Mais Populares
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {sortedPosts.length === 0 && !isLoading && (
              <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 shadow-sm p-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Newspaper className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-800">
                  Nenhuma notícia encontrada para este filtro
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
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
                <p className="text-sm font-serif text-stone-500">
                  Carregando matérias da base pública de notícias...
                </p>
              </div>
            )}

            {/* HERO LEAD STORY (Capitular) */}
            {leadPost && (
              <section className="bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-xl transition-all overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Lead Image (created by author) */}
                  <div 
                    onClick={() => setSelectedPost(leadPost)}
                    className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto cursor-pointer overflow-hidden bg-stone-900"
                  >
                    <img
                      src={leadPost.coverImage}
                      alt={leadPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {leadPost.breakingNews && (
                        <span className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-md">
                          URGENTE
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-md bg-stone-900/90 backdrop-blur-md text-amber-400 text-xs font-bold uppercase tracking-wider shadow-md">
                        {leadPost.category}
                      </span>
                    </div>
                  </div>

                  {/* Lead Editorial Copy */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{leadPost.readTimeMinutes} min de leitura</span>
                        <span>&bull;</span>
                        <span>{leadPost.views} leitores</span>
                      </div>

                      <h3 
                        onClick={() => setSelectedPost(leadPost)}
                        className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-stone-950 leading-[1.15] cursor-pointer group-hover:text-amber-800 transition-colors"
                      >
                        {leadPost.title}
                      </h3>

                      {leadPost.subtitle && (
                        <p className="font-serif text-sm sm:text-base text-stone-600 leading-relaxed line-clamp-3">
                          {leadPost.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Author & Footer Interactions */}
                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={leadPost.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                          alt={leadPost.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <span className="font-bold text-xs text-stone-900 block leading-tight">
                            {leadPost.authorName}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {new Date(leadPost.createdAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold text-stone-500">
                        <span className="flex items-center gap-1 hover:text-rose-600 transition-colors">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {leadPost.likes}
                        </span>
                        <span className="flex items-center gap-1 hover:text-stone-900 transition-colors">
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
                    onClick={() => setSelectedPost(post)}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1 duration-200"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {post.breakingNews && (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                            URGENTE
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-xs text-stone-200 text-[10px] font-bold uppercase tracking-wider">
                          {post.category}
                        </span>
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

                        <h4 className="font-serif font-black text-xl text-stone-900 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
                          {post.title}
                        </h4>

                        {post.subtitle && (
                          <p className="font-serif text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {post.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Author & Metrics */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80'}
                            alt={post.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-stone-200"
                          />
                          <span className="font-medium text-stone-700 text-xs truncate max-w-[120px]">
                            {post.authorName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-stone-400 font-medium">
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
            <div className="p-8 rounded-3xl bg-stone-900 text-stone-100 relative overflow-hidden shadow-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
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
      <footer className="border-t border-stone-300 bg-stone-900 text-stone-400 text-xs py-10 px-4 sm:px-8 mt-16">
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
            setSelectedPost(found);
          }
        }}
      />

    </div>
  );
}
