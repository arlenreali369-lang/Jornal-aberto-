import { NewsPost } from '../types/news.ts';

export const INITIAL_POSTS: NewsPost[] = [
  {
    id: 'noticia-1',
    title: 'Nova Geração de Telescópios Espaciais Revela Atmosfera de Exoplaneta Rochoso',
    subtitle: 'Observações de alta sensibilidade detectaram compostos de carbono e vapor em planeta situado a 48 anos-luz da Terra.',
    category: 'Ciência',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Representação artística do exoplaneta orbitando sua estrela hospedeira em zona potencialmente habitável.',
    authorName: 'Dra. Helena Martins',
    authorHandle: '@helena.astro',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    tags: ['Astronomia', 'Exoplanetas', 'Descoberta', 'Espaço'],
    likes: 142,
    views: 1890,
    featured: true,
    breakingNews: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    readTimeMinutes: 4,
    comments: [
      {
        id: 'c1',
        authorName: 'Carlos Eduardo',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        content: 'Um salto astronômico incrível! A espectroscopia tem avançado muito mais rápido do que esperávamos.',
        createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      },
      {
        id: 'c2',
        authorName: 'Beatriz Lima',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        content: 'Parabéns pela cobertura clara e objetiva do artigo. Muito empolgante!',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      }
    ],
    content: `Uma equipe internacional de astrofísicos anunciou nesta manhã a detecção confirmada de assinaturas atmosféricas complexas no exoplaneta designado LHS-475b. Utilizando novos métodos de refinamento espectral, os instrumentos registraram variações luminosas que indicam a presença de dióxido de carbono e traços consistentes de vapor d'água.

### Um passo decisivo para a astrobiologia

Até recentemente, analisar atmosferas de planetas rochosos com dimensões semelhantes às da Terra constituía um dos maiores gargalos tecnológicos da ciência espacial. Enquanto gigantes gasosos produzem sinais fáceis de calibrar, mundos com crosta sólida exigem medições de precisão nanométrica durante o trânsito planetário.

"O que estamos observando não é apenas um gráfico de absorção estelar; é a evidência palpável de que exoplanetas rochosos conseguem reter atmosferas secundárias mesmo diante da atividade de sua estrela mãe", declarou o líder da pesquisa em coletiva.

### Próximos desdobramentos

As próximas campanhas de observação, agendadas para o segundo semestre, se concentrarão em mapear a distribuição térmica entre o lado diurno e noturno do planeta. Esses dados permitirão aos climatologistas planetários simular correntes de ar e estimar a pressão na superfície com margem de erro inferior a 5%.`
  },
  {
    id: 'noticia-2',
    title: 'Cidades Sustentáveis: Como Corredores Verdes Reduzem em até 4°C o Calor Urbano',
    subtitle: 'Estudo em 12 capitais demonstra que a integração de flora nativa em avenidas e coberturas atenua significativamente as ilhas de calor.',
    category: 'Meio Ambiente',
    coverImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Exemplo de avenida arborizada com jardins de chuva e ciclovia integrada em projeto de requalificação urbana.',
    authorName: 'Thiago Valverde',
    authorHandle: '@t.valverde',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    tags: ['Urbanismo', 'Sustentabilidade', 'Clima', 'Cidades'],
    likes: 98,
    views: 1240,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    readTimeMinutes: 3,
    comments: [
      {
        id: 'c3',
        authorName: 'Mariana Rocha',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
        content: 'Minha rua ganhou árvores recentemente e a diferença de sensação térmica é imediata!',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      }
    ],
    content: `O avanço do asfalto e das superfícies impermeabilizadas nos grandes centros urbanos intensificou o fenômeno das ilhas de calor, onde a temperatura em áreas densas pode superar em até 6°C a de bairros periféricos arborizados.

Uma pesquisa abrangente divulgada pelo Instituto de Climatologia Urbana revelou que intervenções pontuais, mas conectadas — os chamados "corredores ecológicos" —, conseguiram reduzir em média 3,8°C a temperatura ambiente ao nível dos pedestres.

### Além da sombra: a evapotranspiração

Diferente de estruturas artificiais de sombreamento, as árvores nativas realizam evapotranspiração contínua, bombeando umidade para a camada inferior da atmosfera. Além disso, a substituição de canteiros de concreto por jardins de chuva melhora a drenagem pluvial, reduzindo riscos de alagamentos durante tempestades de verão.`
  },
  {
    id: 'noticia-3',
    title: 'Modelos Abertos de Inteligência Artificial Redefinem o Desenvolvimento de Software',
    subtitle: 'Comunidades globais aceleram adoção de agentes locais que funcionam diretamente em hardware pessoal sem envio de dados a servidores externos.',
    category: 'Tecnologia',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Visualização de circuitos neurais e processamento de dados em nós de computação distribuída.',
    authorName: 'Renata Albuquerque',
    authorHandle: '@renata.tech',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    tags: ['IA', 'OpenSource', 'Programação', 'Futuro'],
    likes: 215,
    views: 3120,
    featured: true,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 520).toISOString(),
    readTimeMinutes: 5,
    comments: [
      {
        id: 'c4',
        authorName: 'Lucas Ferraz',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
        content: 'Rodar modelos diretamente no chip M3/M4 ou em placas RTX com total privacidade é o caminho sem volta.',
        createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
      }
    ],
    content: `O ecossistema de desenvolvimento assistido por inteligência artificial passa por uma transformação silenciosa, porém profunda: a migração de chamadas de API centralizadas para modelos compactos e altamente otimizados executados localmente.

### Eficiência e soberania de código

Empresas que lidam com propriedade intelectual sensível e conformidade com leis de proteção de dados relutavam em alimentar sistemas de terceiros com suas bases de código. Com os novos pesos abertos quantizados em 4 bits, programadores conseguem autocompletar e debugar lógicas complexas com latência quase nula e custo operacional previsível.`
  },
  {
    id: 'noticia-4',
    title: 'Bienal Internacional de Artes Celebra Encontro entre Gravura Tradicional e Arte Computacional',
    subtitle: 'Exposição reúne mais de 150 obras em diálogo entre xilogravuras clássicas e instalações interativas geradas por algoritmos generativos.',
    category: 'Cultura',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Visitantes interagem com projeção imersiva de pigmentos dinâmicos em galeria central.',
    authorName: 'Mateus Siqueira',
    authorHandle: '@mateus.arte',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    tags: ['Arte', 'Exposição', 'Cultura', 'Design'],
    likes: 76,
    views: 890,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 800).toISOString(),
    readTimeMinutes: 3,
    comments: [],
    content: `A interseção entre o toque manual da matriz entalhada na madeira e a frieza matemática do código fonte é o tema central da nova edição da Bienal. Curadores destacam que a tecnologia não substitui a sensibilidade artística, mas atua como um amplificador de possibilidades expressivas.`
  },
  {
    id: 'noticia-5',
    title: 'Transição Energética: Investimentos em Fontes Renováveis Superam Combustíveis Fósseis pelo 3º Ano',
    subtitle: 'Energia solar distribuída e baterias de escala utilitária impulsionam nova marca econômica no setor produtivo.',
    category: 'Economia',
    coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop',
    coverCaption: 'Parque fotovoltaico integrado a pastagens em modelo de agrivoltaísmo no interior do país.',
    authorName: 'Patrícia Prado',
    authorHandle: '@patricia.economia',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    tags: ['Economia', 'EnergiaSolar', 'Mercado', 'Finanças'],
    likes: 112,
    views: 1430,
    featured: false,
    breakingNews: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
    readTimeMinutes: 4,
    comments: [],
    content: `Os investimentos globais em tecnologias de descarbonização e infraestrutura limpa atingiram a marca de 1,8 trilhão de dólares nos últimos doze meses. O relatório aponta que a paridade de rede alcançada por módulos fotovoltaicos de silício e o barateamento de acumuladores de lítio tornaram a opção sustentável economicamente mais competitiva em mais de 80% das praças avaliadas.`
  }
];
