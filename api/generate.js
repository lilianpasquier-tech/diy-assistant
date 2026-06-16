// api/generate.js — Vercel Serverless Function
// Proxy sécurisé vers l'API Groq (gratuit : 14 400 req/jour, Llama 3.3 70B)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { projectDescription, projectType, budget, level } = req.body;
  if (!projectDescription) return res.status(400).json({ error: 'Description du projet manquante' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API Groq non configurée sur le serveur' });

  const prompt = `Tu es un expert polyvalent en projets DIY et construction. Tu maîtrises la construction, rénovation, menuiserie, électronique, mécanique et tous les projets créatifs.

Génère un plan COMPLET et TRÈS DÉTAILLÉ en JSON avec EXACTEMENT cette structure (respecte tous les champs) :

{
  "overview": "Résumé du projet en 2-3 phrases",
  "difficulty": { "level": "Débutant|Intermédiaire|Avancé", "explanation": "Pourquoi ce niveau de difficulté" },
  "duration": "Temps estimé total ex: 2 jours",
  "constraints": ["Contrainte technique importante 1", "Contrainte 2"],
  "preliminary_questions": [
    { "question": "Question sur un choix ou variante important", "why": "Impact de ce choix sur le projet", "options": ["Option A concise", "Option B concise"] }
  ],
  "materials": [
    {
      "name": "Nom précis du matériau",
      "quantity": 3,
      "unit": "m²",
      "priceMinUnit": 12,
      "priceMaxUnit": 18,
      "totalPriceMin": 36,
      "totalPriceMax": 54,
      "where_to_buy": "Leroy Merlin",
      "searchKeyword": "terme de recherche précis en français pour cet article",
      "specifications": "Caractéristiques techniques : dimensions, classe, norme, matière, résistance",
      "criticalPoints": "Points importants à ne pas négliger : qualité minimale, précautions, erreurs à éviter"
    }
  ],
  "tools": [
    {
      "name": "Nom de l'outil",
      "isEssential": true,
      "category": "Mesure|Coupe|Perçage|Vissage|Soudure|Finition|Sécurité|Manutention|Électronique",
      "owned_or_buy": "à acheter|probablement disponible",
      "approxPriceMin": 20,
      "approxPriceMax": 80,
      "searchKeyword": "terme de recherche précis pour cet outil",
      "alternative": "Alternative si on ne possède pas cet outil"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Titre court de l'étape",
      "description": "Description générale de ce que l'on fait dans cette étape",
      "duration": "30 min",
      "detailedInstructions": [
        "Sous-étape 1 : action précise et concrète avec détails techniques",
        "Sous-étape 2 : action suivante avec dimensions ou paramètres exacts",
        "Sous-étape 3 : vérification ou finalisation"
      ],
      "tips": "Astuce pratique pour réussir cette étape",
      "warnings": "Danger ou difficulté principale à anticiper",
      "validationCriteria": "Comment vérifier que l'étape est correctement terminée avant de passer à la suite",
      "commonMistakes": "Erreur la plus fréquente commise par les débutants sur cette étape"
    }
  ],
  "safety": ["Consigne de sécurité 1", "Consigne de sécurité 2"],
  "totalBudgetMin": 150,
  "totalBudgetMax": 280,
  "alternatives": ["Alternative ou variante 1", "Alternative 2"],
  "proTips": ["Astuce de pro 1", "Astuce 2"],
  "optimizations": ["Amélioration ou optimisa