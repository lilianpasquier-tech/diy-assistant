// api/generate.js — Vercel Serverless Function
// Proxy sécurisé vers l'API Groq (gratuit : 14 400 req/jour, Llama 3.3 70B)

export default async function handler(req, res) {
  // CORS headers — permet l'accès depuis le navigateur
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { projectDescription, projectType, budget, level } = req.body;

  if (!projectDescription) {
    return res.status(400).json({ error: 'Description du projet manquante' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API Groq non configurée sur le serveur' });
  }

  const prompt = `Tu es un expert polyvalent en projets DIY et construction. Tu maîtrises :
- La construction et rénovation (maçonnerie, plomberie, électricité, peinture, carrelage)
- La menuiserie et le travail du bois
- L'électronique (Arduino, Raspberry Pi, capteurs, câblage)
- La mécanique et la soudure
- Les projets créatifs et artisanaux

Pour chaque projet, tu génères une réponse structurée en JSON avec exactement ces sections :
1. overview : résumé du projet (2-3 phrases)
2. difficulty : objet avec { level: "Débutant|Intermédiaire|Avancé", explanation: "..." }
3. duration : temps estimé total (ex: "2 jours")
4. materials : liste des matériaux avec pour chacun { name, quantity, unit, estimatedPrice (nombre en €), where_to_buy }
5. tools : liste des outils { name, owned_or_buy ("à acheter" ou "probablement disponible"), approxPrice (si à acheter) }
6. steps : guide étape par étape [{ stepNumber, title, description, duration, tips, warnings }]
7. safety : tableau de conseils de sécurité (strings)
8. totalBudgetMin : budget minimum en € (nombre)
9. totalBudgetMax : budget maximum en € (nombre)
10. alternatives : tableau de 2-3 alternatives (strings)
11. proTips : tableau de 3-5 astuces de pro (strings)

Projet à planifier : ${projectDescription}
${projectType ? `Type de projet : ${projectType}` : ''}
${budget ? `Budget disponible : ${budget}€` : ''}
${level ? `Niveau du bricoleur : ${level}` : ''}

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown.`;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Erreur API Groq : ${err}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'Réponse vide de Groq' });
    }

    // Parse JSON — on nettoie au cas où il y aurait des backticks
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Erreur serveur : ${err.message}` });
  }
}
