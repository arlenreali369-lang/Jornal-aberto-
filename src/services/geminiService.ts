import { GoogleGenAI } from '@google/genai';

/**
 * Editorial AI Assistant using Gemini 3.8 Flash
 */
export async function generateEditorialAssistance(topic: string, promptType: 'headline' | 'summary' | 'full_article' | 'svg_illustration'): Promise<string> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : '');
  
  if (!apiKey) {
    // If no API key configured, provide smart generative editorial templates
    return getFallbackContent(topic, promptType);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = '';
    if (promptType === 'headline') {
      prompt = `Aja como um editor-chefe de jornal de prestígio. Escreva 3 opções de manchetes impactantes, éticas e precisas em português para o seguinte tema: "${topic}". Retorne apenas as 3 opções numeradas.`;
    } else if (promptType === 'summary') {
      prompt = `Escreva um subtítulo/linha-fina jornalística envolvente de no máximo duas frases em português para: "${topic}".`;
    } else if (promptType === 'full_article') {
      prompt = `Escreva uma matéria jornalística completa e bem apurada em português sobre "${topic}". Estruture com lead informativo, subtítulos em markdown (##), contexto e perspectivas futuras. Mantenha tom sério, profissional e envolvente.`;
    } else if (promptType === 'svg_illustration') {
      prompt = `Crie uma ilustração vetorial editorial em código SVG válido (retorne SOMENTE o código <svg>...</svg>, sem formatação markdown ou crases) com viewBox="0 0 800 450", paleta moderna de cores (azul meia-noite, âmbar, carmesim ou esmeralda), representando de forma artística e conceitual o tema: "${topic}". Use gradientes <linearGradient>, formas geométricas suaves e composição limpa.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    if (promptType === 'svg_illustration') {
      const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        return svgMatch[0];
      }
    }
    return text.trim();
  } catch (error) {
    console.warn('Gemini API call failed, using editorial generator:', error);
    return getFallbackContent(topic, promptType);
  }
}

function getFallbackContent(topic: string, promptType: 'headline' | 'summary' | 'full_article' | 'svg_illustration'): string {
  if (promptType === 'headline') {
    return `1. ${topic}: Transformações e Impactos no Cenário Contemporâneo\n2. Além do Óbvio: Como "${topic}" Está Moldando o Futuro\n3. Análise Exclusiva: O que Muda a Partir de Agora com ${topic}`;
  }
  if (promptType === 'summary') {
    return `Especialistas analisam os principais desdobramentos de ${topic} e apontam tendências que devem redefinir o setor nos próximos meses.`;
  }
  if (promptType === 'full_article') {
    return `O tema "${topic}" ganhou destaque central nos debates contemporâneos diante de recentes transformações no panorama global.\n\n### Contexto e Desdobramentos\n\nAnalistas e pesquisadores observam que a velocidade das mudanças exige novas abordagens regulatórias e de conscientização pública. A integração de novas ferramentas e metodologias tem aberto caminhos inéditos para solucionar impasses históricos.\n\n### O Que Esperar nos Próximos Meses\n\nÀ medida que a comunidade e os setores produtivos se adaptam, espera-se uma consolidação de padrões mais eficientes e transparentes, colocando as necessidades das pessoas no centro das decisões.`;
  }
  
  // Default creative SVG artwork for news banner
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#311042" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg)" />
    <circle cx="650" cy="120" r="180" fill="url(#accent)" opacity="0.25" filter="blur(40px)" />
    <circle cx="150" cy="350" r="140" fill="url(#glow)" opacity="0.3" filter="blur(30px)" />
    <g opacity="0.15" stroke="#ffffff" stroke-width="1">
      <line x1="0" y1="150" x2="800" y2="150" />
      <line x1="0" y1="300" x2="800" y2="300" />
      <line x1="200" y1="0" x2="200" y2="450" />
      <line x1="600" y1="0" x2="600" y2="450" />
    </g>
    <!-- Geometric editorial motifs -->
    <rect x="120" y="80" width="560" height="290" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" />
    <circle cx="280" cy="225" r="75" fill="none" stroke="url(#accent)" stroke-width="4" stroke-dasharray="8 4" />
    <polygon points="520,160 580,260 460,260" fill="url(#glow)" fill-opacity="0.4" stroke="#38bdf8" stroke-width="2" />
    <rect x="180" y="310" width="140" height="12" rx="6" fill="#f59e0b" opacity="0.8" />
    <rect x="340" y="310" width="280" height="12" rx="6" fill="#ffffff" opacity="0.3" />
    <text x="400" y="235" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="700" letter-spacing="3" text-anchor="middle">JORNAL ABERTO</text>
    <text x="400" y="265" fill="#94a3b8" font-family="sans-serif" font-size="13" letter-spacing="1" text-anchor="middle">REPORTAGEM ESPECIAL &bull; EDIÇÃO PÚBLICA</text>
  </svg>`;
}
