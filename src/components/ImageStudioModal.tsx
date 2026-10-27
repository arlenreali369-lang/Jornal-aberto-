import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Palette, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Layers, 
  Type, 
  Flame, 
  Download,
  RefreshCw,
  Sliders,
  Eye
} from 'lucide-react';
import { generateEditorialAssistance } from '../services/geminiService.ts';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageDataUrl: string, caption?: string) => void;
  initialHeadline?: string;
  initialCategory?: string;
}

const PRESET_GRADIENTS = [
  { name: 'Noite & Índigo', from: '#0f172a', to: '#1e1b4b', accent: '#38bdf8' },
  { name: 'Alerta / Urgente', from: '#450a0a', to: '#7f1d1d', accent: '#f87171' },
  { name: 'Ouro & Carvão', from: '#18181b', to: '#27272a', accent: '#fbbf24' },
  { name: 'Esmeralda Editorial', from: '#064e3b', to: '#022c22', accent: '#34d399' },
  { name: 'Carmesim & Âmbar', from: '#581c87', to: '#831843', accent: '#fb923c' },
  { name: 'Minimalista Cinza', from: '#334155', to: '#1e293b', accent: '#e2e8f0' },
];

const CURATED_NEWS_PHOTOS = [
  {
    title: 'Aeroespacial & Exploração',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Exploração espacial e avanços da astrofísica moderna.'
  },
  {
    title: 'Cidades & Urbanismo',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Metrópole em transformação e infraestrutura urbana.'
  },
  {
    title: 'Sustentabilidade & Meio Ambiente',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Preservação de ecossistemas e clima.'
  },
  {
    title: 'Inteligência Artificial & Chips',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Computação avançada e processamento neural.'
  },
  {
    title: 'Economia & Finanças Globais',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Mercados de capitais e transações econômicas.'
  },
  {
    title: 'Cultura, Livros & Conhecimento',
    url: 'https://images.unsplash.com/photo-1507842229456-068369527f54?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Acervo cultural, bibliotecas e pensamento crítico.'
  },
  {
    title: 'Energia Limpa & Inovação',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Parques eólicos e matriz energética renovável.'
  },
  {
    title: 'Política & Diplomacia',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Debates parlamentares, plenário e decisões de Estado.'
  },
  {
    title: 'Esportes & Competições',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Atletismo, estádios e campeonatos esportivos.'
  },
  {
    title: 'Manifestação & Sociedade Civil',
    url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=1200&auto=format&fit=crop',
    caption: 'Foto ilustrativa: Engajamento cívico e vida comunitária.'
  }
];

export default function ImageStudioModal({
  isOpen,
  onClose,
  onSelectImage,
  initialHeadline = '',
  initialCategory = ''
}: ImageStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'ai' | 'upload' | 'curated'>('canvas');
  
  // Canvas Studio State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [badgeText, setBadgeText] = useState<string>('');
  const [headlineText, setHeadlineText] = useState<string>(initialHeadline || 'MANCHETE DA REPORTAGEM');
  const [subText, setSubText] = useState<string>('Jornalismo Aberto &bull; Edição Pública');
  const [selectedGradient, setSelectedGradient] = useState(PRESET_GRADIENTS[0]);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [vignette, setVignette] = useState<number>(0.65);
  const [layoutStyle, setLayoutStyle] = useState<'editorial' | 'breaking' | 'minimal' | 'badge-top'>('editorial');
  const [uploadedBgImg, setUploadedBgImg] = useState<HTMLImageElement | null>(null);

  // AI Illustration State
  const [aiPrompt, setAiPrompt] = useState<string>(initialHeadline || 'Avanço da ciência espacial no século 21');
  const [aiSvgCode, setAiSvgCode] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Upload State
  const [previewUploadUrl, setPreviewUploadUrl] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState<string>('');

  // Synchronize when initial props change
  useEffect(() => {
    if (initialHeadline) {
      setHeadlineText(initialHeadline.toUpperCase());
      setAiPrompt(initialHeadline);
    }
    // Never force 'SOCIEDADE' or 'DESTAQUE' as badge on the cover image!
    if (
      initialCategory && 
      initialCategory.toLowerCase() !== 'sociedade' && 
      initialCategory.toLowerCase() !== 'destaque' &&
      initialCategory.toLowerCase() !== 'todos'
    ) {
      setBadgeText(initialCategory.toUpperCase());
    } else {
      setBadgeText('');
    }
  }, [initialHeadline, initialCategory]);

  // Redraw Canvas whenever parameters change
  useEffect(() => {
    if (activeTab === 'canvas' && canvasRef.current) {
      drawCanvas();
    }
  }, [badgeText, headlineText, subText, selectedGradient, showGrid, vignette, layoutStyle, uploadedBgImg, activeTab]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background (Gradient or Custom Image)
    if (uploadedBgImg) {
      ctx.drawImage(uploadedBgImg, 0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, selectedGradient.from);
      grad.addColorStop(1, selectedGradient.to);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Accent sphere
      const sphereGrad = ctx.createRadialGradient(width * 0.8, height * 0.3, 20, width * 0.8, height * 0.3, 260);
      sphereGrad.addColorStop(0, selectedGradient.accent + '66');
      sphereGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Technical / Newspaper gridlines if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, height * 0.25);
      ctx.lineTo(width, height * 0.25);
      ctx.moveTo(0, height * 0.75);
      ctx.lineTo(width, height * 0.75);
      // Vertical lines
      ctx.moveTo(width * 0.15, 0);
      ctx.lineTo(width * 0.15, height);
      ctx.moveTo(width * 0.85, 0);
      ctx.lineTo(width * 0.85, height);
      ctx.stroke();

      // Corner technical markers
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(30, 30, 6, 6);
      ctx.fillRect(width - 36, 30, 6, 6);
      ctx.fillRect(30, height - 36, 6, 6);
      ctx.fillRect(width - 36, height - 36, 6, 6);
    }

    // 3. Vignette & Bottom shadow overlay for legibility
    const darkGrad = ctx.createLinearGradient(0, 0, 0, height);
    darkGrad.addColorStop(0, `rgba(0, 0, 0, ${vignette * 0.4})`);
    darkGrad.addColorStop(0.5, `rgba(0, 0, 0, ${vignette * 0.3})`);
    darkGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.95, vignette * 1.3)})`);
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, width, height);

    // 4. Render Layout
    const cleanBadge = badgeText.trim().replace(/^sociedade$/i, '');
    if (layoutStyle === 'editorial' || layoutStyle === 'badge-top') {
      // Top bar
      const topY = 48;
      
      // Badge pill (only if non-empty and not Sociedade)
      if (cleanBadge) {
        ctx.fillStyle = selectedGradient.accent;
        const badgeW = Math.min(240, ctx.measureText(cleanBadge).width + 36);
        ctx.beginPath();
        ctx.roundRect(40, topY - 14, Math.max(100, badgeW), 28, 6);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(cleanBadge.toUpperCase(), 52, topY + 4);
      }

      // Source mark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('JORNAL ABERTO &bull; BASE PÚBLICA', width - 40, topY + 4);
      ctx.textAlign = 'left';

      // Headline Text (wrapped)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Newsreader", Georgia, serif';
      const maxW = width - 80;
      const words = (headlineText || 'MANCHETE DA REPORTAGEM').split(' ');
      let line = '';
      let y = height - 120;
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // Render max 3 lines from bottom
      const visibleLines = lines.slice(-3);
      y = height - 60 - (visibleLines.length * 42);

      visibleLines.forEach((l) => {
        ctx.fillText(l.trim(), 40, y);
        y += 42;
      });

      // Subtitle / Strap line
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(subText, 40, y + 6);

    } else if (layoutStyle === 'breaking') {
      // Breaking news banner at bottom
      const barH = 110;
      ctx.fillStyle = '#dc2626'; // Vivid red bar
      ctx.fillRect(0, height - barH, width, barH);

      // Ticker pill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30, height - barH + 18, 120, 26);
      ctx.fillStyle = '#dc2626';
      ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(badgeText.trim() ? badgeText.toUpperCase() : 'URGENTE', 42, height - barH + 36);

      // Ticker text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(headlineText.slice(0, 65), 165, height - barH + 37);

      // Subtitle ticker
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '500 14px "JetBrains Mono", monospace';
      ctx.fillText(subText, 32, height - barH + 75);

    } else if (layoutStyle === 'minimal') {
      // Centered classic front page
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.textAlign = 'center';
      ctx.fillStyle = selectedGradient.accent;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`— ${badgeText.toUpperCase() || 'EDITORIAL'} —`, width / 2, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Newsreader", Georgia, serif';
      ctx.fillText(headlineText.slice(0, 50), width / 2, height / 2 - 10);
      if (headlineText.length > 50) {
        ctx.fillText(headlineText.slice(50, 100), width / 2, height / 2 + 30);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(subText, width / 2, height - 70);
      ctx.textAlign = 'left';
    }
  };

  const handleApplyCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export compressed JPEG to keep data size ~80KB
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onSelectImage(dataUrl, `Capa gráfica criada no Estúdio Jornal Aberto: "${headlineText}"`);
    onClose();
  };

  const handleGenerateAiSvg = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const svg = await generateEditorialAssistance(aiPrompt, 'svg_illustration');
      setAiSvgCode(svg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiSvg = () => {
    if (!aiSvgCode) return;
    // Convert SVG to data URI
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(aiSvgCode)}`;
    onSelectImage(svgDataUrl, `Ilustração editorial vetorial gerada por IA sobre "${aiPrompt}"`);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas to scale down and compress
        const offCanvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = offCanvas.toDataURL('image/jpeg', 0.82);
          setPreviewUploadUrl(compressedDataUrl);

          // Also set as custom background image for canvas designer!
          setUploadedBgImg(img);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUpload = () => {
    if (!previewUploadUrl) return;
    onSelectImage(previewUploadUrl, uploadCaption.trim() || 'Foto enviada pelo autor da reportagem.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                Estúdio de Imagem & Capa da Notícia
              </h2>
              <p className="text-xs text-stone-400">
                Crie um cartaz editorial com tipografia, gere ilustrações com IA ou envie sua própria foto.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'canvas'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Designer de Capa Gráfica
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Ilustrador Vetorial (IA)
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload de Foto Local
          </button>

          <button
            onClick={() => setActiveTab('curated')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'curated'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Banco Jornalístico
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: CANVAS DESIGNER */}
          {activeTab === 'canvas' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Canvas Preview Area */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-stone-700 shadow-xl bg-stone-950 flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Renderização em tempo real (16:9 HD)
                  </span>
                  <span>Exportação ultra-leve para Firestore</span>
                </div>
              </div>

              {/* Controls Panel */}
              <div className="lg:col-span-5 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Estilo de Layout
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'editorial', label: 'Revista / Capa' },
                      { id: 'breaking', label: 'Urgente / Tarja' },
                      { id: 'minimal', label: 'Minimalista' }
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLayoutStyle(l.id as any)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          layoutStyle === l.id
                            ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                            : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Etiqueta / Selo (Badge)
                    </label>
                    {badgeText && (
                      <button
                        type="button"
                        onClick={() => setBadgeText('')}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Limpar / Deixar Sem Selo
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="Deixe vazio para não exibir nenhum selo"
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Sem Selo', 'URGENTE', 'POLÍTICA', 'ESPORTES', 'EXCLUSIVO'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setBadgeText(tag === 'Sem Selo' ? '' : tag)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          (tag === 'Sem Selo' && !badgeText) || badgeText === tag
                            ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                            : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Título na Imagem
                  </label>
                  <textarea
                    rows={2}
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    placeholder="Texto principal impresso na imagem..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Subtítulo / Rodapé
                  </label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Linha fina ou fonte..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Paleta de Cores de Fundo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_GRADIENTS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setSelectedGradient(p);
                          setUploadedBgImg(null);
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                          selectedGradient.name === p.name && !uploadedBgImg
                            ? 'border-amber-500 ring-1 ring-amber-500 bg-stone-800'
                            : 'border-stone-700 bg-stone-800/60 hover:bg-stone-700'
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                          style={{ background: `linear-gradient(135deg, ${p.from}, ${p.accent})` }}
                        />
                        <span className="text-[11px] truncate text-stone-300 font-medium">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showGrid} 
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-800 text-amber-500 focus:ring-amber-500"
                    />
                    Grade e marcas técnicas
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Vinheta:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="0.9"
                      step="0.05"
                      value={vignette}
                      onChange={(e) => setVignette(parseFloat(e.target.value))}
                      className="w-20 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI VECTOR ILLUSTRATOR */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="space-y-1 w-full md:w-3/4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    Descreva a temática para o Ilustrador Vetorial (IA)
                  </label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Satélite observando tempestade solar; inteligência artificial quântica; cidade sustentável..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3.5 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAiSvg}
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  {isGeneratingAi ? 'Gerando Arte...' : 'Gerar Ilustração'}
                </button>
              </div>

              {aiSvgCode ? (
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-stone-700 shadow-2xl bg-stone-950">
                    <div 
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: aiSvgCode }}
                    />
                  </div>
                  <p className="text-center text-xs text-stone-400">
                    Ilustração vetorial responsiva, nítida em qualquer resolução e sem compressão de pixels.
                  </p>
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-stone-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-stone-400">
                  <div className="p-4 rounded-full bg-stone-800/60 mb-3 text-amber-400">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-stone-200 text-base mb-1">
                    Nenhuma ilustração gerada ainda
                  </h3>
                  <p className="text-xs max-w-md text-stone-400">
                    Digite um tema jornalístico acima e clique em "Gerar Ilustração" para criar uma arte conceitual vetorial moderna exclusiva para sua capa.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOAD LOCAL */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-stone-700 hover:border-amber-500/60 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-stone-950/40 relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-stone-100 text-base mb-1">
                  Arraste sua foto aqui ou clique para selecionar
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mb-4">
                  Suporta JPG, PNG e WebP. O app otimiza e redimensiona automaticamente para garantir carregamento ultra-rápido no banco de dados público.
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-medium">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Compressão inteligente integrada
                </span>
              </div>

              {previewUploadUrl && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
                  <div className="md:col-span-6 aspect-[16/9] rounded-lg overflow-hidden border border-stone-700">
                    <img 
                      src={previewUploadUrl} 
                      alt="Pré-visualização do envio" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-6 space-y-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <Check className="w-4 h-4" /> Foto processada e pronta para publicação
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">
                        Legenda ou Crédito da Imagem
                      </label>
                      <input
                        type="text"
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="Ex: Foto: Arquivo Pessoal / Agência Local"
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Switch to canvas tab so user can overlay text onto their photo!
                        setActiveTab('canvas');
                      }}
                      className="text-left text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      &rarr; Abrir no Estúdio para colocar títulos ou tarja vermelha por cima desta foto
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CURATED GALLERY */}
          {activeTab === 'curated' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-400">
                Selecione uma imagem de alta qualidade do nosso acervo editorial curado para ilustrar sua notícia imediatamente:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CURATED_NEWS_PHOTOS.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectImage(photo.url, photo.caption);
                      onClose();
                    }}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-stone-800 bg-stone-950 hover:border-amber-500/80 transition-all hover:scale-[1.02] shadow-lg flex flex-col"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-stone-900">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-stone-200 group-hover:text-amber-400 transition-colors">
                        {photo.title}
                      </h5>
                      <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>

          {activeTab === 'canvas' && (
            <button
              type="button"
              onClick={handleApplyCanvas}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              Usar Imagem Criada
            </button>
          )}

          {activeTab === 'ai' && (
            <button
              type="button"
              onClick={handleApplyAiSvg}
              disabled={!aiSvgCode}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Adotar Ilustração na Notícia
            </button>
          )}

          {activeTab === 'upload' && (
            <button
              type="button"
              onClick={handleApplyUpload}
              disabled={!previewUploadUrl}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Confirmar Imagem Enviada
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
