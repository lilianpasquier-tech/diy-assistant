// api/chat.js — Chat contextuel Groq pour l'assistant DIY
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { messages, projectContext } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'Messages manquants' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API Groq non configurée' });

  const systemContent = projectContext
    ? `Tu es un expert DIY/bricolage. Réponds en français, de façon concise et pratique (max 200 mots). Tu connais ce projet : ${projectContext}`
    : `Tu es un expert DIY/bricolage. Réponds en français, de façon concise et pratique (max 200 mots).`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemContent }, ...messages],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'Réponse vide' });
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
