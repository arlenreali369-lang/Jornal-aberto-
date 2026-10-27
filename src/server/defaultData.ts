import { NewsPost } from '../types/news.ts';

export const INITIAL_POSTS: NewsPost[] = [
  // --- POLÍTICA (ESPÍRITO SANTO & BRASIL) ---
  {
    id: 'politica-es-fundo-soberano',
    title: 'Governo do ES e Ales Destinam Recursos Recordes de Royalties para Obras Municipais e Saneamento',
    subtitle: 'Acordo entre Executivo e Legislativo direciona receitas do Fundo Soberano para macrodrenagem, contenção de encostas e expansão de escolas de tempo integral.',
    category: 'Política',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Plenário da Assembleia Legislativa do Espírito Santo (Ales) e Palácio Anchieta em Vitória.',
    authorName: 'André Bastos (Correspondente ES)',
    authorHandle: '@andre.politica',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    tags: ['Política', 'Espírito Santo', 'Ales', 'Vitória', 'Infraestrutura'],
    likes: 194,
    views: 2680,
    featured: true,
    breakingNews: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    readTimeMinutes: 4,
    comments: [
      {
        id: 'c-pol-1',
        authorName: 'Juliana Vieira',
        content: 'O Fundo Soberano do ES é uma referência de planejamento intergeracional para o restante do país.',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      }
    ],
    content: `Em uma sessão extraordinária no Palácio Domingos Martins, a Assembleia Legislativa do Estado do Espírito Santo (Ales) e o Governo Estadual chancelaram a nova destinação orçamentária dos rendimentos do Fundo Soberano para o biênio.\n\n### Investimentos Prioritários na Grande Vitória e no Interior\n\nO plano contempla obras de saneamento básico e prevenção de cheias nas bacias hidrográficas dos rios Santa Maria da Vitória e Jucu, beneficiando diretamente os municípios de Vitória, Vila Velha, Serra e Cariacica.\n\n"Nosso compromisso é transformar a riqueza finita do petróleo em ativos permanentes de educação, infraestrutura e sustentabilidade que fiquem de legado para as próximas gerações de capixabas", enfatizou a liderança do governo estadual.\n\n### Transparência e Acompanhamento Cívico\n\nTodos os editais licitatórios contarão com monitoramento conjunto do Tribunal de Contas do Estado (TCE-ES) e painéis públicos de dados abertos para prestação de contas aos cidadãos.`
  },
  {
    id: 'politica-br-reforma-fiscal',
    title: 'Congresso e Executivo Consolidam Acordo para Acelerar Votação da Lei de Diretrizes Orçamentárias',
    subtitle: 'Comissões mistas em Brasília alinham investimentos em transportes, transição energética e piso constitucional da saúde.',
    category: 'Política',
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Cúpulas do Congresso Nacional durante deliberação orçamentária em Brasília.',
    authorName: 'Patrícia Prado (Brasília)',
    authorHandle: '@patricia.politica',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    tags: ['Política', 'Brasil', 'Congresso', 'Brasília', 'Orçamento'],
    likes: 148,
    views: 2130,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    readTimeMinutes: 4,
    comments: [],
    content: `Representantes das principais bancadas do Congresso Nacional concluíram a rodada de consultas que estabelece as metas fiscais e o cronograma prioritário de votações.\n\nO texto aprovado garante a preservação dos aportes federais em rodovias interestaduais e na modernização do sistema de inteligência da segurança pública, além de regras claras para o controle de renúncias fiscais setoriais.`
  },

  // --- TECNOLOGIA (ESPÍRITO SANTO & BRASIL) ---
  {
    id: 'tecnologia-es-hub-inovacao',
    title: 'Polo Tecnológico do ES: Vitória e Vila Velha Atraem Novas Startups com Hubs de Inteligência Artificial e Logística',
    subtitle: 'Ecossistema capixaba, impulsionado pelo Base27 e FindesLab, registra alta de 34% em investimentos privados para soluções portuárias e agtechs.',
    category: 'Tecnologia',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Ambiente de inovação e pesquisa aplicada no polo tecnológico da Grande Vitória.',
    authorName: 'Renata Albuquerque (Tecnologia)',
    authorHandle: '@renata.tech',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    tags: ['Tecnologia', 'Espírito Santo', 'Inovação', 'Startups', 'Vitória'],
    likes: 226,
    views: 3410,
    featured: true,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    readTimeMinutes: 4,
    comments: [
      {
        id: 'c-tech-1',
        authorName: 'Marcos Caldeira',
        content: 'O Espírito Santo está se consolidando como um dos pólos de logística tech mais fortes da América Latina.',
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      }
    ],
    content: `O ecossistema capixaba de inovação alcançou marcas expressivas no último trimestre. Com a expansão de programas de aceleração sediados na orla de Vitória e nos centros empresariais de Vila Velha e Serra, empreendedores locais têm desenvolvido sistemas baseados em inteligência artificial preditiva voltados a operações portuárias de alta tonelagem e rastreamento de safras de café.\n\n### Integração com Grandes Indústrias\n\nGrandes players instalados no Espírito Santo estão contratando soluções diretamente de startups formadas por pesquisadores da Ufes e do Ifes, encurtando o tempo entre o protótipo acadêmico e a implementação nas cadeias globais de suprimentos.`
  },
  {
    id: 'tecnologia-br-chips-ia',
    title: 'Brasil Fortalece Indústria de Semicondutores e Inaugura Novo Centro de Computação Quântica e IA',
    subtitle: 'Laboratórios nacionais recebem investimentos para desenvolver processadores especializados em eficiência energética e modelos abertos.',
    category: 'Tecnologia',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Placas de circuito e semicondutores de alto desempenho em laboratório nacional.',
    authorName: 'Felipe Santana',
    authorHandle: '@felipe.hardware',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    tags: ['Tecnologia', 'Brasil', 'Semicondutores', 'IA', 'Computação'],
    likes: 182,
    views: 2890,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    readTimeMinutes: 3,
    comments: [],
    content: `O Ministério da Ciência, Tecnologia e Inovação confirmou a ativação de uma nova linha piloto para prototipagem de semicondutores avançados.\n\nA iniciativa visa preparar o país para a crescente demanda por processamento de inteligência artificial de borda, capacitando centenas de pós-graduandos em microeletrônica e sistemas ciberfísicos.`
  },

  // --- ECONOMIA (ESPÍRITO SANTO & BRASIL) ---
  {
    id: 'economia-es-portos-exportacao',
    title: 'Portos do Espírito Santo Registram Movimentação Histórica e Lideram Exportações de Café Conilon e Rochas Ornamentais',
    subtitle: 'Complexos portuários de Tubarão, Capuaba e Portocel movimentam bilhões e consolidam liderança capixaba em comércio exterior.',
    category: 'Economia',
    coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Terminal de granéis e navios cargueiros no complexo portuário do Espírito Santo.',
    authorName: 'Patrícia Prado (Economia)',
    authorHandle: '@patricia.economia',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    tags: ['Economia', 'Espírito Santo', 'Portos', 'Exportação', 'CaféConilon'],
    likes: 215,
    views: 3120,
    featured: true,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    readTimeMinutes: 4,
    comments: [
      {
        id: 'c-eco-1',
        authorName: 'Eduardo Guimarães',
        content: 'O agronegócio de café do ES unido à logística portuária eficiente é o motor do nosso crescimento econômico.',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      }
    ],
    content: `Os portos instalados no litoral capixaba atingiram novo ápice operacional nos primeiros meses do ano. Dados da Secretaria de Comércio Exterior apontam que o Espírito Santo registrou alta nas remessas de blocos e chapas polidas de rochas ornamentais para a Europa e Estados Unidos, ao passo que os embarques de café conilon atingiram cotas sem precedentes nos terminais de Vitória.\n\n### Eficiência Logística e Atração de Cargas\n\nA desburocratização de desembaraço aduaneiro e os incentivos fiscais competitivos colocam o Espírito Santo como o corredor logístico preferencial de mercadorias de alto valor agregado no Centro-Leste brasileiro.`
  },
  {
    id: 'economia-br-balanca-comercial',
    title: 'Balança Comercial Brasileira Supera Expectativas com Superávit Histórico e Controle Inflacionário',
    subtitle: 'Safra recorde de grãos, expansão do setor de serviços e estabilidade cambial impulsionam confiança dos investidores internacionais.',
    category: 'Economia',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Mercado financeiro e indicadores econômicos em alta nos centros financeiros do Brasil.',
    authorName: 'Lucas Ferraz',
    authorHandle: '@lucas.mercado',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
    tags: ['Economia', 'Brasil', 'ComércioExterior', 'Mercado', 'Finanças'],
    likes: 167,
    views: 2340,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    readTimeMinutes: 4,
    comments: [],
    content: `O saldo da balança comercial brasileira acumulou novo recorde de superávit no fechamento do período. Com forte demanda internacional por commodities agrícolas e minerais e desaceleração do custo de insumos importados, analistas econômicos revisaram para cima as projeções de crescimento do PIB nacional para o ano.`
  },

  // --- ESPORTES (ESPÍRITO SANTO & BRASIL) ---
  {
    id: 'esportes-es-capixabao-vi-rio',
    title: 'Clássico Vi-Rio e Copa Espírito Santo Mobilizam Estádios Kleber Andrade e Salvador Costa',
    subtitle: 'Rio Branco, Desportiva, Vitória-ES e Porto Vitória protagonizam fase decisiva do futebol capixaba com ingressos esgotados.',
    category: 'Esportes',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Torcida comparece em peso ao Estádio Estadual Kleber Andrade em Cariacica.',
    authorName: 'Camila Nogueira (Esportes)',
    authorHandle: '@camila.esportes',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    tags: ['Esportes', 'Espírito Santo', 'Capixabão', 'Futebol', 'Cariacica'],
    likes: 178,
    views: 2490,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    readTimeMinutes: 3,
    comments: [],
    content: `A atmosfera em torno do futebol capixaba voltou a ganhar contornos de celebração popular. O confronto decisivo no Kleber Andrade reuniu famílias e torcedores organizados que vibraram com uma partida decidida nos minutos de acréscimo.`
  },
  {
    id: 'esportes-br-brasileirao-rodada',
    title: 'Brasileirão e Copa do Brasil: Rodada Decisiva Define Liderança e Classificados Continentais',
    subtitle: 'Confrontos nos principais palcos do país mantêm emoção até os minutos finais da rodada.',
    category: 'Esportes',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Grandes partidas agitam arenas esportivas em todo o Brasil.',
    authorName: 'Mateus Siqueira',
    authorHandle: '@mateus.esportes',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    tags: ['Esportes', 'Brasil', 'Brasileirão', 'Futebol', 'Competição'],
    likes: 190,
    views: 2870,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
    readTimeMinutes: 3,
    comments: [],
    content: `A rodada deste fim de semana no Campeonato Brasileiro foi marcada por viradas eletrizantes e grande equilíbrio técnico nos jogos de topo e fuga da zona de rebaixamento.`
  },

  // --- CIÊNCIA & MEIO AMBIENTE ---
  {
    id: 'ciencia-exoplaneta',
    title: 'Nova Geração de Telescópios Revela Atmosfera Complexa em Exoplaneta Rochoso',
    subtitle: 'Instrumentos espaciais detectam vapor e moléculas orgânicas em planeta a 48 anos-luz da Terra.',
    category: 'Ciência',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Representação artística do exoplaneta em zona habitável.',
    authorName: 'Dra. Helena Martins',
    authorHandle: '@helena.astro',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    tags: ['Ciência', 'Astronomia', 'Espaço', 'Descoberta'],
    likes: 142,
    views: 1890,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    readTimeMinutes: 4,
    comments: [],
    content: `Uma equipe internacional de astrofísicos anunciou a detecção confirmada de assinaturas atmosféricas complexas em planeta rochoso similar à Terra.`
  }
];
