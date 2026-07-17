const axios = require('axios');

const SYSTEM_PROMPT = `Tu es Ares, consultant commercial et bras droit d'FEZEU Louis Jos, développeur Fullstack Senior et Expert IA & Data Analyst (Yaoundé).

Consignes de communication :
1. Concision absolue : Tes réponses doivent être courtes et percutantes. Va droit au but.
2. Précision : Pas de blabla inutile. Réponds précisément à la demande tout en valorisant discrètement l'expertise d'Essimbi.
3. Ton humain : Parle comme un professionnel à un autre professionnel. Évite les structures de robot (listes trop longues, introductions génériques).
4. Sobriété : Utilise très peu d'émojis (maximum un par message si vraiment nécessaire).
5. Objectif Business : Ton but est de qualifier le besoin et d'orienter vers fezeujordan77@gmail.com pour du consulting ou développement (Angular, Laravel, Node.js, Python, IA, Data Analysis, Mobile Money).

Argumentaire FEZEU :
- DÉVELOPPEUR FULL STACK et Spécialiste des Systèmes d'Information et Intégration (3 ans).  REACTJS/Windows Server/Angular/Laravel/Node.
- Projets concrets : Application Bancaire, Application RH, ERP, E-commerce, Application de Gestion De Stock, Application de Gestion De temperature de salle.
- Capacité d'analyse, reporting, deploiement, conception et developpement'.`;

// Rate limiting simple en mémoire (IP -> { count, resetTime })
const rateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

const ALLOWED_ORIGINS = [
  'https://essimbi-deranot.vercel.app',
  'https://essimbi-deranot.vercel.app/',
  'http://localhost:3001',
  'http://localhost:5173'
];

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Si pas d'origine (ex: curl local), autoriser localhost ou rejeter en prod.
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  } else {
    return res.status(403).json({ error: 'Origine non autorisée' });
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // --- Rate Limiting ---
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (rateLimit.has(ip)) {
    const data = rateLimit.get(ip);
    if (now > data.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else if (data.count >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter.' });
    } else {
      data.count++;
    }
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  }
  // --- Fin Rate Limiting ---

  try {
    let { messages } = req.body;
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

    if (!MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'Clé API Mistral non configurée' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Format de messages invalide' });
    }

    // Garder seulement les 6 derniers messages pour éviter la surcharge de contexte
    if (messages.length > 6) {
      messages = messages.slice(-6);
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 512 // Limiter la taille de la réponse
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      message: response.data.choices[0].message.content,
      model: response.data.model
    });

  } catch (error) {
    console.error('Erreur Mistral API:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de la communication avec Mistral AI',
      details: error.response?.data?.message || 'Erreur interne'
    });
  }
};
