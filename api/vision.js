import Groq from 'groq-sdk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { image, note, projectTitle, projectType } = req.body || {};

  if (!image) {
    res.status(400).json({ error: 'Image requise' });
    return;
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Build image content — Groq vision supports base64 images
  const imageContent = image.startsWith('data:')
    ? { type: 'image_url', image_url: { url: image } }
    : { type: 'image_url', image_url: { url: image } };

  const systemPrompt = `Tu es un expert en bricolage et construction DIY. 
Tu analyses des photos de chantier et donnes des conseils pratiques, précis et bienveillants.
Réponds TOUJOURS en français. Sois concis (3-5 phrases max) mais utile.
Identifie ce que tu vois, évalue la qualité du travail, et suggère des améliorations si nécessaire.`;

  const userPrompt = `Projet : ${projectTitle || 'DIY'} (type : ${projectType || 'general'})
${note ? 'Note du chantier : ' + note : ''}

Analyse cette photo de chantier et donne tes observations et conseils.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            imageContent,
            { type: 'text', text: userPrompt }
          ]
        }
      ],
      temperature: 0.5,
      max_tokens: 400
    });

    const analysis = completion.choices[0]?.message?.content || '';
    res.status(200).json({ analysis });
  } catch (err) {
    console.error('Vision error:', err.message);
    // Fallback: text-only analysis if vision model unavailable
    try {
      const textCompletion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Projet : ${projectTitle || 'DIY'}. Note du chantier : ${note || 'Photo ajoutée'}. Donne un conseil général sur l'avancement de ce type de projet.` }
        ],
        temperature: 0.5,
        max_tokens: 300
      });
      const analysis = textCompletion.choices[0]?.message?.content || '';
      res.status(200).json({ analysis });
    } catch (err2) {
      res.status(500).json({ error: err2.message, analysis: null });
    }
  }
}
