// api/generate.js — Vercel Serverless Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { projectDescription, projectType, budget, level, userChoices, projectConfig } = req.body;
  if (!projectDescription) return res.status(400).json({ error: 'Description du projet manquante' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Clé API Groq non configurée sur le serveur' });

  const choicesText = userChoices && Object.keys(userChoices).length
    ? `\nCHOIX VALIDÉS PAR L'UTILISATEUR : ${JSON.stringify(userChoices)}\nAdapte le plan en conséquence.`
    : '';

  const prompt = `Tu es un EXPERT PLURIDISCIPLINAIRE de niveau professionnel en : électronique embarquée, mécanique, robotique, impression 3D, menuiserie, électricité, plomberie, domotique, maçonnerie et projets DIY complexes.

Génère un PROGRAMME PROFESSIONNEL COMPLET pour amateur passionné. JSON strict avec EXACTEMENT cette structure :

{
  "title": "Titre accrocheur du projet",
  "overview": "Description technique complète du projet : ce que c'est, comment ça fonctionne, ses performances, ses spécificités techniques — 4-5 phrases riches",
  "hero_keyword": "english keyword 3-5 words for Unsplash photo of the FINISHED project, ex: 'electric motocross bike offroad' or 'handmade oak dining table workshop'",
  "difficulty": { "level": "Débutant|Intermédiaire|Avancé|Expert", "explanation": "Explication précise des compétences requises" },
  "duration": "Durée totale réaliste avec détail par phase",
  "constraints": ["Contrainte technique précise 1", "Contrainte 2", "Contrainte 3", "Contrainte 4"],

  "project_phases": {
    "study": {
      "title": "Phase 1 — Étude et Conception",
      "duration": "X jours/semaines",
      "description": "Objectifs de cette phase",
      "tasks": [
        "Définir les spécifications : [liste de specs techniques à définir pour CE projet spécifique]",
        "Rechercher les normes applicables : [normes spécifiques au projet : CE, UL, IP, etc.]",
        "Faire un schéma fonctionnel : [blocs fonctionnels spécifiques à ce projet]",
        "Dimensionner les composants critiques : [calculs spécifiques : puissance, charge, résistance, etc.]",
        "Valider la faisabilité avec un prototype ou maquette rapide"
      ],
      "deliverables": ["Cahier des charges", "Schéma de principe", "Liste de matériaux validée", "Budget détaillé"]
    },
    "design": {
      "title": "Phase 2 — Conception Détaillée",
      "duration": "X jours",
      "description": "Conception complète avant toute réalisation",
      "tasks": [
        "Dessiner les plans cotés avec [logiciel adapté : FreeCAD / Fusion360 / LibreCAD / KiCAD]",
        "Créer les fichiers d'impression 3D (STL/3MF) pour [pièces spécifiques à imprimer]",
        "Réaliser le schéma électrique / électronique complet",
        "Définir le planning de fabrication avec les dépendances entre tâches",
        "Commander les composants avec délai de livraison anticipé"
      ],
      "software_tools": [
        { "name": "Nom du logiciel", "purpose": "À quoi il sert sur ce projet", "free": true, "url": "https://..." }
      ],
      "deliverables": ["Plans CAO 3D", "Schéma électrique", "Fichiers STL pour impression", "Nomenclature complète"]
    },
    "preparation": {
      "title": "Phase 3 — Préparation et Approvisionnement",
      "duration": "X jours",
      "tasks": [
        "Vérifier la livraison de tous les composants selon la liste",
        "Préparer l'espace de travail : [besoins spécifiques en surface, éclairage, alimentation électrique]",
        "Calibrer et vérifier les outils : [outils à calibrer avant utilisation]",
        "Réaliser des tests unitaires sur les composants critiques avant assemblage",
        "Marquer et préparer les pièces selon le plan de débit"
      ]
    },
    "realization": {
      "title": "Phase 4 — Réalisation",
      "duration": "X jours",
      "description": "Construction proprement dite, étape par étape",
      "key_milestones": [
        "Jalon 1 : [Premier assemblage structurel ou sous-ensemble critique terminé]",
        "Jalon 2 : [Premier test fonctionnel partiel]",
        "Jalon 3 : [Assemblage complet avant finition]",
        "Jalon 4 : [Test final complet]"
      ]
    },
    "testing": {
      "title": "Phase 5 — Tests, Validation et Mise au Point",
      "duration": "X jours",
      "tests": [
        { "test": "Nom du test", "method": "Protocole précis du test", "success_criteria": "Valeur ou observation attendue", "tools_needed": "Instruments de mesure nécessaires" }
      ]
    },
    "use_maintenance": {
      "title": "Phase 6 — Utilisation et Maintenance",
      "first_use": ["Étape de première mise en service 1", "Étape 2", "Étape 3"],
      "regular_maintenance": [
        { "frequency": "Avant chaque utilisation|Mensuel|Annuel", "task": "Tâche de maintenance précise", "duration": "Xmin" }
      ],
      "troubleshooting": [
        { "symptom": "Symptôme observable", "likely_cause": "Cause probable", "solution": "Solution pas à pas" }
      ]
    }
  },

  "preliminary_questions": [
    {
      "question": "Question décisive sur un choix structurant",
      "why": "Impact concret sur le coût, la technique, les matériaux",
      "options": [
        { "label": "Option A", "impact": "Impact concis : coût, difficulté, performance", "materials_hint": ["matériau spécifique 1", "matériau 2"] },
        { "label": "Option B", "impact": "Impact concis", "materials_hint": ["matériau 1", "matériau 2"] }
      ]
    }
  ],

  "materials": [
    {
      "name": "Nom précis avec référence/spécification",
      "quantity": 1,
      "unit": "pièce|m|m²|kg|L|rouleau",
      "priceMinUnit": 10,
      "priceMaxUnit": 20,
      "totalPriceMin": 10,
      "totalPriceMax": 20,
      "where_to_buy": "Amazon FR|Leroy Merlin|Brico Dépôt|Aliexpress|RS Components|Mouser|Farnell",
      "searchKeyword": "terme de recherche EXACT et PRÉCIS pour Amazon.fr ou Leroy Merlin incluant marque/modèle/dimension si connu",
      "image_keyword": "3-4 english words for product photo search ex: 'hydraulic brake lever motorcycle' or '18v lithium battery pack'",
      "specifications": "Caractéristiques techniques complètes : dimensions, tension, courant, résistance, classe, IP, norme, marque recommandée",
      "criticalPoints": "ERREUR D'ACHAT fréquente à éviter + ce qui fait la différence entre un bon et mauvais produit",
      "is_most_expensive": false
    }
  ],

  "tools": [
    {
      "name": "Nom complet de l'outil",
      "isEssential": true,
      "category": "Mesure|Coupe|Perçage|Vissage|Soudure|Électronique|Finition|Sécurité|Manutention|Fabrication numérique|Hydraulique",
      "approxPriceMin": 20,
      "approxPriceMax": 150,
      "searchKeyword": "terme précis Amazon.fr ex 'multimètre numérique Fluke 117' ou 'imprimante 3D Bambu Lab A1 mini'",
      "specifications": "Spécifications techniques nécessaires pour CE projet : voltage, capacité, précision, diamètre",
      "alternative": "Outil de substitution si non disponible",
      "pro_tip": "Réglage ou technique spécifique pour ce type de projet"
    }
  ],

  "print_3d": {
    "needed": true,
    "printer_specs": "Spécifications minimum d'imprimante nécessaires pour ce projet",
    "parts_to_print": [
      { "name": "Nom de la pièce", "material": "PLA|PETG|ASA|TPU|ABS", "infill": "20%", "supports": true, "print_time": "2h", "purpose": "Fonction de la pièce" }
    ],
    "thingiverse_search": "mots-clés anglais pour trouver des modèles 3D similaires sur Thingiverse",
    "cad_files_note": "Description des fichiers à créer ou adapter"
  },

  
"assembly_diagram": {
  "parts": [
    { "id": "A", "name": "Part name", "qty": 1, "connects_to": ["B","C"],
      "position": "bottom-center", "material_ref": 0,
      "note": "Base frame — placed first" },
    { "id": "B", "name": "Next part", "qty": 2, "connects_to": ["A"],
      "position": "top-left", "material_ref": 1,
      "note": "Mounts onto A with M4 bolts" }
  ],
  "assembly_sequence": ["A","B","C"],
  "exploded_note": "2-sentence description of overall assembly logic"
},
"electrical_schema": {
    "needed": true,
    "description": "Description du schéma électrique/électronique à réaliser",
    "components": ["Composant 1 : rôle dans le circuit", "Composant 2 : rôle"],
    "connections": ["Connexion 1 : de A vers B via câble X section Y", "Connexion 2"],
    "safety_notes": ["Protection requise 1", "Protection 2"]
  },

  "steps": [
    {
      "stepNumber": 1,
      "title": "Titre précis de l'étape",
      "description": "Ce qu'on réalise et pourquoi — importance dans le projet global",
      "duration": "1h30",
      "phase": "Préparation|Construction|Assemblage|Finition|Vérification",
      "detailedInstructions": [
        "Avec [outil précis + réglage] : [action technique précise] sur [objet/matériau] — paramètre : [valeur exacte]",
        "Positionner [pièce X] sur [support Y] en alignant [repère A] avec [repère B], jeu de [Xmm] pour [raison technique]",
        "Régler [outil] à [valeur exacte : vitesse/couple/température/tension] adapté à [matériau/épaisseur/diamètre]",
        "Appliquer [produit] avec [outil] : épaisseur [X mm], direction [sens], temps de séchage [X min] avant manipulation",
        "Vérifier avec [instrument] : valeur attendue [X ± tolérance] — si hors tolérance : [action corrective]",
        "Erreur fréquente : [problème précis] → conséquence [Y] → prévention : [geste précis]",
        "Documenter avec une photo de [ce qu'il faut photographier] pour référence future et journal de chantier"
      ],
      "tips": "Astuce de professionnel spécifique à ce type de matériau ou technique",
      "warnings": "DANGER ou point de non-retour critique avec conséquence si mal exécuté",
      "validationCriteria": "TEST CONCRET avant de passer à la suite : [mesure ou observation précise attendue]",
      "commonMistakes": "Erreur n°1 sur cette étape : [erreur] → conséquence : [Y] → prévention : [Z]"
    }
  ],

  "safety": [
    "EPI obligatoire : [liste précise] — pourquoi : [risque spécifique à ce projet]",
    "Risque principal : [danger] — prévention : [mesure concrète]"
  ],

  "totalBudgetMin": 100,
  "totalBudgetMax": 500,
  "alternatives": ["Variante moins chère : [description + économie réalisée]", "Variante plus performante : [description + surcoût]"],
  "proTips": ["Astuce pro 1 que peu de tutoriels mentionnent", "Astuce 2"],
  "optimizations": ["Optimisation coût : [action concrète]", "Optimisation qualité : [action concrète]"]
}

RÈGLES ABSOLUES :
1. hero_keyword = 3-5 mots anglais précis pour trouver UNE PHOTO DU PROJET FINI sur Unsplash
2. image_keyword sur chaque matériau = 3-4 mots anglais très précis du PRODUIT PHYSIQUE
3. is_most_expensive = true uniquement sur LE matériau le plus cher (1 seul)
4. MINIMUM 8 detailedInstructions par étape — chacune commence par "Avec [outil]:" ou une action physique précise avec paramètres techniques
5. MINIMUM 15 tools différents couvrant toutes les phases du projet
6. searchKeyword = terme de recherche EXACT comme si vous l'écriviez sur Amazon.fr maintenant
7. project_phases doit couvrir tout le cycle de vie SPÉCIFIQUEMENT pour ce projet (pas générique)
8. print_3d.needed = false si aucune impression 3D n'est utilisée dans ce projet
9. electrical_schema.needed = false si pas d'électricité dans ce projet

PROJET À PLANIFIER :
${projectConfig ? "\n=== CONFIGURATION MAKER ===\n" + projectConfig + "\n=========================\n" : ""}Projet : ${projectDescription}
Niveau : ${level}
Budget max : ${budget}€
Type : ${projectType || 'Non spécifié'}
${projectType ? 'Type : ' + projectType : ''}
${budget ? 'Budget maximum : ' + budget + '€' : ''}
${level ? 'Niveau utilisateur : ' + level : ''}
${choicesText}

INSTRUCTIONS CRITIQUES selon la configuration maker :
- Base "objet existant" → focus démontage, identification pièces, modification, compatibilité
- Base "matériaux bruts méca" → plans de coupe/formage, approvisionnement, méthodes d'assemblage
- Base "composants élec bruts" → schéma complet, BOM avec références exactes (valeurs résistances, Refs CI, valeurs capa)
- Base "kit assemblage" → séquence montage, câblage, calibration, procédure première mise en tension
- Si domaine Électronique/Automatisme → OBLIGATOIRE schéma de câblage dans electrical_schema, références précises (ex: R1=10kΩ, C1=100nF, U1=ATmega328P)
- Si domaine Impression 3D → paramètres d'impression par pièce (hauteur couche, remplissage%, support, orientation)
- Si domaine Soudure → paramètres précis (ampérage, type/diam fil, gaz, temp préchauffage)
- Niveau Expert → terminologie professionnelle, tolérances, états de surface, procédures de test
- TOUJOURS générer assembly_diagram avec positions réalistes des pièces
- Les pièces de assembly_diagram doivent correspondre exactement à la liste matériaux
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown.`;

  // Fallback chain: 70b (best quality, 100k TPD) → 70b alt → 8b instant (500k TPD) → gemma2 (500k TPD)
  const MODELS = [
    'llama-3.3-70b-versatile',
    'llama3-70b-8192',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
  ];

  const callGroq = async (model) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.55,
        max_tokens: 5500,
        response_format: { type: 'json_object' },
      }),
    });
    return response;
  };

  try {
    let response = null;
    let usedModel = null;

    for (const model of MODELS) {
      const groqRes = await callGroq(model);
      if (groqRes.ok) {
        response = groqRes;
        usedModel = model;
        break;
      }
      const errBody = await groqRes.text();
      // Only retry on rate-limit (429) errors
      if (groqRes.status === 429) {
        console.warn(`[generate] Rate limit on ${model}, trying next model…`);
        continue;
      }
      // Any other error: return immediately
      return res.status(groqRes.status).json({ error: 'Erreur API Groq (' + model + ') : ' + errBody });
    }

    if (!response) {
      return res.status(429).json({
        error: 'Limite journalière Groq atteinte sur tous les modèles. Réessayez demain ou upgradez sur console.groq.com/settings/billing'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return res.status(500).json({ error: 'Réponse vide de Groq (modèle: ' + usedModel + ')' });
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur : ' + err.message });
  }
}
