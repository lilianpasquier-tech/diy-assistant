// api/generate.js — Vercel Serverless Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { projectDescription, projectType, budget, level, userChoices } = req.body;
  if (!projectDescription) return res.status(400).json({ error: 'Description du projet manquante' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API Groq non configurée sur le serveur' });

  const choicesText = userChoices && Object.keys(userChoices).length
    ? `\nCHOIX VALIDÉS PAR L'UTILISATEUR : ${JSON.stringify(userChoices)}\nAdapte le plan en conséquence.`
    : '';

  const prompt = `Tu es un expert polyvalent en projets DIY, construction, rénovation, menuiserie, électronique et mécanique.

Génère un plan COMPLET et TRÈS DÉTAILLÉ en JSON avec EXACTEMENT cette structure :

{
  "overview": "Résumé du projet en 2-3 phrases claires",
  "difficulty": { "level": "Débutant|Intermédiaire|Avancé|Expert", "explanation": "Pourquoi ce niveau" },
  "duration": "Durée totale ex: 2 jours",
  "constraints": ["Contrainte technique 1", "Contrainte 2", "Contrainte 3"],
  "preliminary_questions": [
    {
      "question": "Question décisive sur un choix structurant du projet",
      "why": "Impact concret de ce choix sur les matériaux, le coût, la durée ou la technique",
      "options": [
        { "label": "Option A (ex: Bois massif)", "impact": "Impact court : coût +30%, plus solide, nécessite rabotage", "materials_hint": ["planche chêne 27mm", "colle à bois PVA"] },
        { "label": "Option B (ex: Contreplaqué)", "impact": "Impact court : moins cher, plus rapide, suffisant pour usage intérieur", "materials_hint": ["contreplaqué bouleau 18mm", "placage adhésif"] }
      ]
    }
  ],
  "materials": [
    {
      "name": "Nom précis du matériau avec spécification",
      "quantity": 3,
      "unit": "m²",
      "priceMinUnit": 12,
      "priceMaxUnit": 18,
      "totalPriceMin": 36,
      "totalPriceMax": 54,
      "where_to_buy": "Leroy Merlin",
      "searchKeyword": "TERME PRÉCIS pour trouver CE produit sur Amazon.fr ou Leroy Merlin : ex 'planche pin raboté 200x20x2000mm'",
      "specifications": "Dimensions exactes, classe, norme CE, résistance, densité — tout ce qui permet de choisir le bon produit",
      "criticalPoints": "Ce qu'il NE faut PAS rater à l'achat : qualité minimale, piège courant, erreur d'acheteur"
    }
  ],
  "tools": [
    {
      "name": "Nom de l'outil",
      "isEssential": true,
      "category": "Mesure|Coupe|Perçage|Vissage|Soudure|Finition|Sécurité|Manutention|Électronique",
      "approxPriceMin": 20,
      "approxPriceMax": 80,
      "searchKeyword": "terme précis pour trouver cet outil sur Amazon.fr ex 'perceuse visseuse sans fil 18V Bosch'",
      "alternative": "Ce qu'on peut utiliser à la place si on ne possède pas cet outil"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Titre court de l'étape",
      "description": "Ce qu'on accomplit dans cette étape et pourquoi c'est important",
      "duration": "1h30",
      "phase": "Préparation|Construction|Assemblage|Finition|Vérification",
      "detailedInstructions": [
        "Avec [outil précis] : [action technique précise] [objet] [dimension/paramètre] — vérifier que [critère mesurable]",
        "Poser [matériau X] sur [support Y] en alignant [repère] avec [repère], laisser un jeu de [Xmm] pour [raison technique]",
        "Régler [outil] à [paramètre exact : vitesse/pression/température] pour [matériau/épaisseur]",
        "Appliquer [produit] en couche de [épaisseur] avec [outil], en suivant le fil du bois/sens de pose",
        "Contrôler avec [instrument de mesure] : tolérance acceptée ± [Xmm/degré]",
        "En cas d'erreur [problème courant] : [solution immédiate concrète]",
        "Nettoyer [outil/zone] avec [produit] avant de passer à l'étape suivante"
      ],
      "tips": "Astuce de pro qui fait gagner du temps ou améliore la qualité",
      "warnings": "Danger concret ou difficulté technique principale — être très précis",
      "validationCriteria": "TEST PRÉCIS à faire avant de passer à l'étape suivante : ex 'Vérifier l'équerrage avec équerre : diagonales égales ± 2mm'",
      "commonMistakes": "L'ERREUR la plus fréquente sur cette étape avec sa CONSÉQUENCE et comment l'éviter"
    }
  ],
  "safety": ["EPI requis + pourquoi", "Risque spécifique + geste de prévention"],
  "totalBudgetMin": 150,
  "totalBudgetMax": 280,
  "alternatives": ["Variante A : description et dans quel cas la préférer", "Variante B : ..."],
  "proTips": ["Astuce niveau pro 1", "Astuce 2"],
  "optimizations": ["Optimisation possible 1", "Optimisation 2"]
}

RÈGLES ABSOLUES :
- preliminary_questions.options doit TOUJOURS avoir "label", "impact" et "materials_hint"
- Minimum 3 preliminary_questions sur des choix structurants réels
- MINIMUM 7 detailedInstructions par étape — chacune commence par "Avec [outil]:" ou une action concrète
- Chaque instruction doit contenir des données techniques : dimensions, paramètres, tolérances, produits nommés
- searchKeyword = terme de recherche Amazon.fr ou Leroy Merlin TRÈS PRÉCIS avec marque/type/dimension si possible
- Les prix sont ceux du marché français 2024-2025
- phase = une des 5 valeurs exactes listées

Projet : ${projectDescription}
${projectType ? 'Type : ' + projectType : ''}
${budget ? 'Budget max : ' + budget + '€' : ''}
${level ? 'Niveau : ' + level : ''}
${choicesText}

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) { const err = await response.text(); return res.status(response.status).json({ error: 'Erreur API Groq : ' + err }); }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return res.status(500).json({ error: 'Réponse vide de Groq' });
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur : ' + err.message });
  }
}
