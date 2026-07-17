# Portfolio Fullstack — Essimbi Louis Jos Deranot
## Prompt pour Cursor AI

---

## STACK TECHNIQUE OBLIGATOIRE
- Angular 20+ (standalone components, signals)
- Three.js (scène 3D principale)
- GSAP 3 + ScrollTrigger + ScrollSmoother
- Lenis (smooth scroll physique)
- Simple Icons ou Devicons (logos technos SVG)
- Angular Animations (@angular/animations)
- TypeScript strict mode

---

## ARCHITECTURE DU PROJET
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── theme.service.ts        ← gestion light/dark
│   │   │   ├── cursor.service.ts       ← cursor custom
│   │   │   └── scroll.service.ts       ← Lenis + GSAP sync
│   │   └── models/
│   │       ├── project.model.ts
│   │       └── skill.model.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── cursor/                 ← cursor magnétique
│   │   │   ├── nav/                    ← navigation sticky
│   │   │   ├── loader/                 ← loader animé
│   │   │   └── theme-toggle/           ← switch light/dark
│   ├── sections/
│   │   ├── hero/                       ← scène Three.js
│   │   ├── about/
│   │   ├── skills/                     ← logos techno
│   │   ├── projects/
│   │   ├── testimonials/
│   │   └── contact/
│   └── app.component.ts
├── assets/
│   └── icons/                          ← SVG logos technos
└── styles/
├── _variables.scss                 ← tokens light + dark
├── _animations.scss
└── styles.scss

---

## THÈME LIGHT / DARK

### ThemeService
- Persist dans localStorage
- Signal Angular : `theme = signal<'dark'|'light'>('dark')`
- Applique la classe `.theme-dark` ou `.theme-light` sur `<html>`
- Transition douce sur tous les éléments : `transition: background 0.4s, color 0.4s`

### Tokens CSS (variables)

```scss
// DARK (défaut)
.theme-dark {
  --bg:          #080808;
  --bg-2:        #0f0f0f;
  --bg-card:     #111111;
  --fg:          #f0ede8;
  --fg-muted:    #888888;
  --accent:      #e8d5b0;
  --accent-2:    #c4a882;
  --border:      rgba(240, 237, 232, 0.08);
  --border-hover:rgba(232, 213, 176, 0.25);
  --shadow:      0 0 40px rgba(0,0,0,0.8);
  --particle-color: #e8d5b0;
}

// LIGHT
.theme-light {
  --bg:          #f8f5f0;
  --bg-2:        #eeeae4;
  --bg-card:     #ffffff;
  --fg:          #1a1a1a;
  --fg-muted:    #666666;
  --accent:      #8b6d4a;
  --accent-2:    #a0845c;
  --border:      rgba(26, 26, 26, 0.1);
  --border-hover:rgba(139, 109, 74, 0.35);
  --shadow:      0 4px 32px rgba(0,0,0,0.08);
  --particle-color: #8b6d4a;
}
```

### ThemeToggle Component
- Bouton en haut à droite de la nav
- Animation SVG : soleil ↔ lune avec rotation GSAP
- Au changement de thème : mettre à jour la couleur des particules Three.js et du matériau wireframe via ThemeService observable

---

## CUSTOM CURSOR (CursorService + CursorComponent)

### Comportement
- Dot central 8px (suit la souris instantanément)
- Ring externe 40px (suit avec lag : lerp factor 0.1)
- Effet magnétique sur tous les éléments `[data-magnetic]` :
  - Au hover : le cursor se déforme (scale X ou Y) et est attiré vers le centre de l'élément
  - `gsap.to(cursor, { x: targetX, y: targetY, duration: 0.3 })`
- États du cursor :
  - `.cur--default` : dot + ring classique
  - `.cur--hover` : ring s'agrandit (64px), dot disparaît
  - `.cur--drag` : label "DRAG" apparaît dans le ring
  - `.cur--view` : label "VIEW" dans le ring (sur les cards projet)
- Le ring change de couleur selon le thème (via CSS var)

---

## SECTION 1 — HERO (Three.js 3D)

### Scène Three.js complète
```typescript
// Éléments de la scène
1. Système de particules (3000 pts) — réagit à la souris en parallaxe
2. Torus Knot wireframe — rotation continue lente
3. Icosaèdre subdivisé — rotation inverse
4. Grille infinie (GridHelper) au sol — effet profondeur
5. Lumière ambiante + PointLight animée qui tourne autour de la scène
```

### Animations hero au chargement (timeline GSAP)
t=0.0 : Loader disparaît (opacity 0, scale 0.95)
t=0.3 : Canvas Three.js fade in
t=0.5 : Tag "Développeur Fullstack Senior" slide depuis la gauche
t=0.7 : Titre ligne 1 "ESSIMBI" — lettres tombent une par une depuis Y:-100
t=0.9 : Titre ligne 2 "Louis Jos" — même effet, stagger 0.06s
t=1.1 : Titre ligne 3 "Deranot" (outline) — fade in
t=1.3 : Sous-titre paragraphe — fade up
t=1.5 : Status dots — slide depuis la droite
t=1.7 : Scroll indicator — fade in + animation boucle
t=1.8 : Marquee démarre

### Effet scroll 3D du hero
- Avec ScrollTrigger : au scroll, la caméra Three.js recule (camera.position.z += delta)
- Les particules se dispersent vers l'extérieur (scale positions)
- Le titre GSAP se split en caractères individuels (SplitText ou custom) et chaque lettre part dans une direction 3D différente (rotateX, rotateY, translateZ)
- Parallaxe : background particles bougent à 0.3× la vitesse de scroll, foreground à 1×

---

## SMOOTH SCROLL (Lenis + GSAP)

```typescript
// scroll.service.ts
import Lenis from '@studio-freight/lenis';

lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
});

// Synchroniser Lenis avec GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

---

## SECTION 2 — À PROPOS

### Animation 3D au scroll
- Le grand chiffre "4+" utilise un compteur animé (0 → 4)
- Un disque / sphere Three.js tourne derrière le chiffre (canvas séparé inline)
- Le texte paragraphe arrive mot par mot (SplitText par mots, stagger 0.02s)
- Les tags "pill" arrivent avec un effet ressort (elastic ease) staggerés

---

## SECTION 3 — COMPÉTENCES avec LOGOS

### Affichage des logos
Chaque technologie affiche :
1. Le logo SVG officiel via Devicons ou Simple Icons CDN :
   `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/angular.svg`
   ou Devicons :
   `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg`

2. Liste complète des logos à intégrer :
Frontend  : Angular, TypeScript, JavaScript, RxJS, TailwindCSS, HTML5, CSS3, Vue.js
Backend   : Laravel, PHP, Django, Python, FastAPI, Node.js, Express
Mobile    : React Native, Electron
Bases DB  : PostgreSQL, MySQL, MongoDB, Redis
DevOps    : Docker, GitHub, GitHub Actions, Nginx, Linux
Outils    : Postman, Figma, Trello, Git

### Layout des skills
- 6 cards (une par catégorie) avec scroll horizontal possible sur mobile
- Chaque card : titre catégorie + grille de logos (icône + nom)
- Hover sur un logo : scale 1.2 + tooltip avec le nom
- Animation 3D card : `transform: perspective(800px) rotateX(Xdeg) rotateY(Ydeg)` au mousemove (tilt effect)
- Au scroll, les cards arrivent avec un flip 3D : `rotateY(90deg) → rotateY(0deg)` staggerées

### Animation entrée scroll
```typescript
// Chaque skill card
gsap.from(card, {
  rotateY: 90,
  opacity: 0,
  transformPerspective: 800,
  duration: 0.8,
  stagger: 0.1,
  ease: 'back.out(1.4)',
  scrollTrigger: { trigger: '#skills', start: 'top 70%' }
})
```

---

## SECTION 4 — PROJETS

### Layout
- Liste verticale en plein écran
- Chaque ligne projet : numéro / nom / description / stack tags / flèche ↗
- Hover : la ligne s'étend, révèle une mini-preview 3D (un plan Three.js avec une couleur de fond + titre flottant)

### Animation 3D scroll
- Les lignes de projet arrivent en glissant depuis la droite avec une légère rotation Z (-3deg → 0deg)
- `gsap.from(row, { x: 100, rotateZ: -3, opacity: 0, stagger: 0.1 })`
- Une ligne lumineuse (pseudo-élément) sweeps de gauche à droite au hover

---

## SECTION 5 — TÉMOIGNAGES

### Layout
- 2 colonnes × 2 lignes (4 cards)
- Fond cards : glassmorphism (backdrop-filter: blur) — adapté au thème

### Animation 3D scroll
- Les cards arrivent en flip vertical : `rotateX(-80deg) → rotateX(0deg)`
- Chaque card a un subtle float animation (up/down 6px, 4s loop, easing: sine.inOut)
- Au hover : `scale(1.02)` + ombre portée plus prononcée

---

## SECTION 6 — CONTACT

### Layout
- Grand texte animé "Travaillons ensemble." (SplitText, chaque mot arrive séparément)
- Email cliquable
- Liens GitHub / LinkedIn / Téléphone

### Animation 3D
- Le texte "Travaillons ensemble." : chaque lettre a une position Z initiale aléatoire (-200 à 200px) qui converge vers 0 au scroll
```typescript
  chars.forEach(char => {
    gsap.from(char, {
      z: gsap.utils.random(-200, 200),
      opacity: 0,
      rotateX: gsap.utils.random(-90, 90),
      duration: 1,
      ease: 'power4.out',
      stagger: 0.03,
      scrollTrigger: { trigger: '#contact', start: 'top 80%' }
    })
  })
```

---

## LOADER

```typescript
// Séquence complète
1. Background noir plein écran
2. Texte monospace : "init_sequence" (typewriter effect)
3. Barre de progression (0% → 100%)
4. Compteur numérique synchronisé
5. Messages rotatifs : "loading assets" → "init 3D scene" → "compiling shaders" → "ready"
6. Quand 100% : clip-path reveal (cercle depuis le centre qui s'agrandit)
   gsap.to('#loader', { clipPath: 'circle(150% at 50% 50%)', duration: 0.8, ease: 'power4.inOut' })
   puis opacity 0 et display none
```

---

## DONNÉES (à mettre dans des services Angular)

### projects.data.ts
```typescript
export const PROJECTS = [
  {
    id: '01', name: 'Réseau social professionnel',
    desc: 'Plateforme type LinkedIn pour le marché africain — 2 000+ utilisateurs en beta',
    stack: ['Vue.js', 'Laravel', 'PostgreSQL', 'Redis'],
    color: '#1a3c6e', year: '2024'
  },
  {
    id: '02', name: 'ClimAfriq — Énergie',
    desc: 'Monitoring énergétique disponible en web & desktop installable',
    stack: ['Angular', 'Electron.js', 'Django', 'PostgreSQL'],
    color: '#2e5c3a', year: '2024'
  },
  {
    id: '03', name: 'Gestion d\'événements 3CM',
    desc: 'Application avec contrôle d\'accès QR code en temps réel',
    stack: ['Angular 20', 'Laravel', 'MySQL'],
    color: '#5c3a2e', year: '2026'
  },
  {
    id: '04', name: 'ERP Gestion du personnel',
    desc: 'Système RH complet avec tableaux de bord et gestion des rôles',
    stack: ['Angular', 'Laravel', 'MySQL'],
    color: '#3a2e5c', year: '2023'
  },
  {
    id: '05', name: 'Plateforme e-commerce',
    desc: 'Catalogue, panier et paiement mobile money MTN / Orange',
    stack: ['Angular', 'Angular Material', 'RxJS'],
    color: '#5c4a2e', year: '2022'
  },
  {
    id: '06', name: 'Scraping & Extension Chrome',
    desc: 'Automatisation de tâches avec analyse de données en temps réel',
    stack: ['Node.js', 'Laravel', 'Chrome API'],
    color: '#2e3a5c', year: '2023'
  },
];
```

### skills.data.ts
```typescript
export const SKILLS = [
  {
    category: 'Frontend',
    items: [
      { name: 'Angular', icon: 'angular', devicon: true },
      { name: 'TypeScript', icon: 'typescript', devicon: true },
      { name: 'RxJS', icon: 'rxjs', simpleicons: true },
      { name: 'Vue.js', icon: 'vuedotjs', simpleicons: true },
      { name: 'Tailwind CSS', icon: 'tailwindcss', simpleicons: true },
      { name: 'HTML5', icon: 'html5', devicon: true },
      { name: 'CSS3', icon: 'css3', devicon: true },
    ]
  },
  // ... autres catégories
];
```

---

## PERFORMANCES & QUALITÉ

- Lazy load des sections avec `IntersectionObserver`
- Three.js renderer : `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
- GSAP `will-change: transform` uniquement pendant l'animation, retiré après
- Images/SVG logos en lazy loading (`loading="lazy"`)
- `prefers-reduced-motion` : désactiver les animations 3D si activé
- `prefers-color-scheme` : respecter le thème système par défaut
- Lighthouse score cible : 90+ Performance, 100 Accessibilité

---

## INFORMATIONS PERSONNELLES
Nom         : ESSIMBI Louis Jos Deranot
Titre       : Développeur Fullstack Senior
Expérience  : 4 ans
Localisation: Yaoundé, Cameroun
Email       : essimbideranot@gmail.com
Téléphone   : (+237) 695 164 183
GitHub      : github.com/Essimbi
Disponible  : Oui — missions & consulting

---

## COMMANDES CURSOR

1. Génère d'abord le projet Angular avec `ng new portfolio --style=scss --routing=false`
2. Installe : `npm i three gsap @studio-freight/lenis simple-icons`
3. Crée tous les services en premier (ThemeService, CursorService, ScrollService)
4. Crée les composants section par section
5. À chaque composant, implémente d'abord le HTML/SCSS, puis les animations GSAP
6. Teste le rendu Three.js dans le hero avant de passer aux autres sections