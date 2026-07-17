# Chatbot Mistral AI - Documentation d'Installation

## 🚀 Démarrage Rapide

### 1. Obtenir une clé API Mistral

1. Allez sur [console.mistral.ai](https://console.mistral.ai)
2. Créez un compte ou connectez-vous
3. Générez une clé API
4. Copiez la clé

### 2. Configuration Locale

1. **Installez les dépendances:**
```bash
npm install
```

2. **Configurez votre clé API:**
   - Ouvrez le fichier `.env`
   - Remplacez `your_mistral_api_key_here` par votre clé API

```env
MISTRAL_API_KEY=sk_...votre_clé_ici...
PORT=3000
```

3. **Démarrez le serveur:**
```bash
# Mode production
npm start

# Mode développement (avec auto-reload)
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 3. Utilisation du Chatbot

Le chatbot est intégré au portfolio HTML en widget flottant en bas à droite :
- Cliquez sur le bouton "💬" pour ouvrir/fermer
- Posez vos questions techniques
- Le chatbot répondra en tant qu'assistant d'Essimbi

## 📋 Configuration pour Production

### Déploiement sur Vercel/Netlify

1. **Créez un `vercel.json` ou configuration équivalente**
2. **Définissez la variable d'environnement:**
   - Dans les settings de votre host, ajoutez: `MISTRAL_API_KEY=votre_clé`

### Déploiement sur un VPS

```bash
# SSH vers votre serveur
ssh user@your_server.com

# Clonez le projet
git clone your_repo

# Installez les dépendances
npm install

# Démarrez avec PM2 pour la persistance
npm install -g pm2
pm2 start server.js --name "chatbot"
pm2 startup
pm2 save
```

## 🔒 Sécurité

- ✅ La clé API est stockée côté serveur (jamais exposée au navigateur)
- ✅ CORS configuré pour limiter les requêtes
- ✅ Validation des messages entrants
- ✅ Rate limiting recommandé en production

## 📝 Structure

```
portfolio/
├── portfolio-essimbi-3d.html  (UI du portfolio + widget chat)
├── server.js                  (Backend Express)
├── package.json               (Dépendances)
├── .env                       (Configuration - À garder secret!)
└── assets/
    └── profil.jpeg
```

## 🤖 API Endpoint

**POST** `/api/chat`

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "votre question ici" },
    { "role": "assistant", "content": "réponse précédente" }
  ]
}
```

**Response:**
```json
{
  "message": "La réponse du chatbot...",
  "model": "mistral-small",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 45
  }
}
```

## ⚡ Modèles Disponibles

- `mistral-small` - Rapide et économique (utilisé actuellement)
- `mistral-medium` - Équilibre coût/performance
- `mistral-large` - Plus puissant

## 🐛 Dépannage

**"Clé API non configurée"**
- Vérifiez que `.env` contient votre clé Mistral

**"Connection refused"**
- Assurez-vous que le serveur Node est en cours d'exécution: `npm start`

**"Erreur CORS"**
- En développement, vérifiez que le portfolio accède à `http://localhost:3000`
- En production, mettez à jour les origines CORS dans `server.js`

## 📞 Support

Pour toute question: essimbideranot@gmail.com
