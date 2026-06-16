// api/schema.js — Génère un schéma SVG technique via Groq
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { projectDescription, projectType, steps, materials } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API manquante' });

  const stepTitles = (steps || []).slice(0, 5).map((s, i) => `${i+1}. ${s.title}`).join('\n');
  const matNames = (materials || []).slice(0, 6).map(m => m.name).join(', ');

  const prompt = `Tu es un ingénieur technique expert en schémas de construction DIY. Génère un schéma SVG technique professionnel et détaillé.

PROJET: ${projectDescription}
TYPE: ${projectType || 'bricolage général'}
ÉTAPES: ${stepTitles}
MATÉRIAUX PRINCIPAUX: ${matNames}

INSTRUCTIONS ABSOLUES pour le SVG:
- viewBox="0 0 820 500" xmlns="http://www.w3.org/2000/svg"
- Fond sombre: <rect width="820" height="500" fill="#0d1117"/>
- Titre en haut en blanc, police monospace
- Couleurs: contours #6366f1 (violet), annotations #f59e0b (or), éléments #43e97b (vert), textes #e2e8f0 (blanc)
- Style BLUEPRINT/PLAN TECHNIQUE professionnel
- Inclure OBLIGATOIREMENT: titre du projet, au moins 2 vues ou sections, cotes avec dimensions, légendes numérotées, flèches de montage

SELON LE TYPE DE PROJET:
- ÉLECTRICITÉ: schéma de câblage avec symboles normalisés (phase L=rouge, neutre N=bleu, terre PE=vert, symboles interrupteur/prise/disjoncteur)
- BOIS/MENUISERIE: vue éclatée isométrique avec pièces numérotées et dimensions en mm
- PLOMBERIE: schéma de circuit avec sens de circulation, robinets, raccords
- MAÇONNERIE/BÉTON: coupe verticale annotée montrant les couches (fondation/dalle/mur)
- ÉLECTRONIQUE: schéma de circuit avec composants
- JARDIN/TERRASSE: plan vue de dessus avec cotes et orientation N/S/E/O
- GÉNÉRAL: vue 3D isométrique du résultat final avec pièces identifiées

Minimum 15 éléments SVG distincts (rect, line, circle, path, text, etc.)
Réponds UNIQUEMENT avec le code SVG complet valide, commençant exactement par <svg et finissant par </svg>. Aucun texte avant ou après.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });
    if (!response.ok) { const e = await response.text(); return res.status(500).json({ error: e }); }
    const data = await response.json();
    let svg = data.choices?.[0]?.message?.content || '';
    // Clean up: extract just the SVG
    const start = svg.indexOf('<svg');
    const end = svg.lastIndexOf('</svg>');
    if (start !== -1 && end !== -1) {
      svg = svg.slice(start, end + 6);
    } else {
      return res.status(500).json({ error: 'SVG non généré' });
    }
    return res.status(200).json({ svg });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
