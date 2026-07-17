/* ══════════════════════════════════
   LOADER
══════════════════════════════════ */
const ldBar = document.getElementById('ldB');
const ldNum = document.getElementById('ldN');
const ldMsg = document.getElementById('ldM');
const ldBg = document.getElementById('ldBgText');
const msgs = ['MOUNTING_FILESYSTEM...','INIT_NEURAL_NET...','BUILDING_SCENE...','OPTIMIZING_SHADERS...','SYSTEM_READY'];
let prog = 0;

// Background code dump decoration
const codeLines = [
  'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  'import { gsap } from "gsap";',
  'const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";',
  'class AresAI { constructor() { this.identity = "Senior Consultant"; } }',
  'npm install @fezeu/portfolio-core --force',
  'await fetch("/api/chat", { method: "POST" });',
  'git commit -m "Standard Vercel structure with public folder"',
  'ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4',
  'curl -X POST http://localhost:3001/api/chat',
  'docker-compose up -d --build'
];
ldBg.textContent = Array(30).fill(0).map(() => codeLines[Math.floor(Math.random()*codeLines.length)]).join('\n');

const iv = setInterval(()=>{
  prog += Math.random()*8+1;
  if(prog>=100){prog=100;clearInterval(iv);setTimeout(launch,500)}
  ldBar.style.width=prog+'%';
  ldNum.textContent=Math.floor(prog);
  ldMsg.textContent=msgs[Math.min(Math.floor(prog/22),4)];
},70);

function launch(){
  gsap.to('#loader',{
    clipPath:'circle(0% at 50% 50%)',
    duration:.9,ease:'power4.inOut',
    onComplete:()=>{
      document.getElementById('loader').style.display='none';
      initThree();
      initCursor();
      initNav();
      heroAnim();
      initScrollAnims();
    }
  });
}

/* ══════════════════════════════════
   THREE.JS — HERO 3D
══════════════════════════════════ */
function initThree(){
  const canvas=document.getElementById('c3d');
  const W=window.innerWidth, H=window.innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,W/H,.1,200);
  camera.position.set(0,0,6);

  // ── Particules
  const N=3000;
  const pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-.5)*20;
    pos[i*3+1]=(Math.random()-.5)*20;
    pos[i*3+2]=(Math.random()-.5)*20;
  }
  const pGeo=new THREE.BufferGeometry();
  pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const isDark=()=>document.documentElement.getAttribute('data-theme')==='dark';
  const pMat=new THREE.PointsMaterial({size:.018,color:0xd4a574,transparent:true,opacity:.55,sizeAttenuation:true});
  const particles=new THREE.Points(pGeo,pMat);
  scene.add(particles);

  // ── Torus Knot wireframe
  const tkGeo=new THREE.TorusKnotGeometry(1.6,.35,120,12,2,3);
  const tkMat=new THREE.MeshBasicMaterial({color:0xd4a574,wireframe:true,transparent:true,opacity:.07});
  const torusKnot=new THREE.Mesh(tkGeo,tkMat);
  scene.add(torusKnot);

  // ── Icosahedron
  const iGeo=new THREE.IcosahedronGeometry(1.1,2);
  const iMat=new THREE.MeshBasicMaterial({color:0xb8875a,wireframe:true,transparent:true,opacity:.1});
  const ico=new THREE.Mesh(iGeo,iMat);
  ico.position.set(3.5,0,0);
  scene.add(ico);

  // ── Octahedron
  const oGeo=new THREE.OctahedronGeometry(0.8,0);
  const oMat=new THREE.MeshBasicMaterial({color:0xd4a574,wireframe:true,transparent:true,opacity:.12});
  const octa=new THREE.Mesh(oGeo,oMat);
  octa.position.set(-3.5,1,-1);
  scene.add(octa);

  // ── Ring
  const rGeo=new THREE.TorusGeometry(2.2,.015,8,80);
  const rMat=new THREE.MeshBasicMaterial({color:0xd4a574,transparent:true,opacity:.08});
  const ring=new THREE.Mesh(rGeo,rMat);
  ring.rotation.x=Math.PI/3;
  scene.add(ring);

  // ── Neural Sphere (Main AI focus)
  const sphereGeo=new THREE.IcosahedronGeometry(2,3);
  const sphereMat=new THREE.MeshBasicMaterial({color:0xd4a574,wireframe:true,transparent:true,opacity:.05});
  const neuralSphere=new THREE.Mesh(sphereGeo,sphereMat);
  scene.add(neuralSphere);

  // ── Mouse
  let mx=0,my=0,tx=0,ty=0;
  window.addEventListener('mousemove',e=>{
    mx=(e.clientX/window.innerWidth-.5)*2;
    my=(e.clientY/window.innerHeight-.5)*2;
  });

  // ── Theme color update
  window.updateThreeColors=()=>{
    const dark=isDark();
    const c=dark?0xd4a574:0x8b5e3c;
    pMat.color.setHex(c);
    tkMat.color.setHex(c);
    iMat.color.setHex(dark?0xb8875a:0xa0703a);
    oMat.color.setHex(c);
    rMat.color.setHex(c);
    // invert github icon in light mode
    document.querySelectorAll('.sk-icon-item img[alt="GitHub"]').forEach(img=>{
      img.style.filter=dark?'invert(1)':'none';
    });
    document.querySelectorAll('.sk-icon-item img[alt="Express"]').forEach(img=>{
      img.style.filter=dark?'invert(0.8)':'none';
    });
    document.querySelectorAll('.sk-icon-item img[alt="Django"]').forEach(img=>{
      img.style.filter=dark?'invert(0.7)':'none';
    });
  };
  window.updateThreeColors();

  // ── Scroll parallax 3D
  let scrollY=0;
  window.addEventListener('scroll',()=>{scrollY=window.scrollY});

  // ── Resize
  window.addEventListener('resize',()=>{
    const W2=window.innerWidth,H2=window.innerHeight;
    camera.aspect=W2/H2;camera.updateProjectionMatrix();
    renderer.setSize(W2,H2);
  });

  // ── Animate loop
  const clock=new THREE.Clock();
  (function loop(){
    requestAnimationFrame(loop);
    const t=clock.getElapsedTime();
    tx+=(mx-tx)*.035; ty+=(my-ty)*.035;

    particles.rotation.y=t*.03+tx*.15;
    particles.rotation.x=t*.015+ty*.08;

    torusKnot.rotation.x=t*.08+ty*.2;
    torusKnot.rotation.y=t*.06+tx*.2;
    torusKnot.rotation.z=t*.04;

    ico.rotation.x=-t*.12;
    ico.rotation.y=t*.18+tx*.3;

    octa.rotation.x=t*.1;
    octa.rotation.y=-t*.14;
    octa.rotation.z=t*.06;

    ring.rotation.z=t*.05;
    ring.rotation.y=t*.03;

    neuralSphere.rotation.y=-t*.05;
    neuralSphere.rotation.x=t*.02;
    neuralSphere.scale.setScalar(1 + Math.sin(t*2)*0.03); // Pulsing effect

    camera.position.x+=(tx*.5-camera.position.x)*.04;
    camera.position.y+=(-ty*.4-camera.position.y)*.04;

    // scroll: camera recule
    const targetZ=6+scrollY*.002;
    camera.position.z+=(targetZ-camera.position.z)*.05;
    // particules se dispersent au scroll
    const disperse=1+scrollY*.0003;
    particles.scale.set(disperse,disperse,disperse);

    renderer.render(scene,camera);
  })();
}

/* ══════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════ */
function initCursor(){
  const cur=document.getElementById('cur');
  const ring=cur.querySelector('.c-ring');
  const dot=cur.querySelector('.c-dot');
  let cx=0,cy=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY});
  (function loop(){
    rx+=(cx-rx)*.1;ry+=(cy-ry)*.1;
    dot.style.left=cx+'px';dot.style.top=cy+'px';
    ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.nav-cta,.theme-btn').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cur-hover'));
  });
  document.querySelectorAll('.proj-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cur-view'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cur-view'));
  });
}

/* ══════════════════════════════════
   NAV SCROLL
══════════════════════════════════ */
function initNav(){
  const nav=document.getElementById('nav');
  window.addEventListener('scroll',()=>nav.classList.toggle('sticky',scrollY>80));
}

/* ══════════════════════════════════
   THEME TOGGLE
══════════════════════════════════ */
document.getElementById('themeBtn').addEventListener('click',()=>{
  const html=document.documentElement;
  const next=html.getAttribute('data-theme')==='dark'?'light':'dark';
  html.setAttribute('data-theme',next);
  if(window.updateThreeColors) window.updateThreeColors();
});

/* ══════════════════════════════════
   HERO ANIMATIONS
══════════════════════════════════ */
function scrambleText(id, final, duration=1.5) {
  const el = document.getElementById(id);
  if(!el) return;
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  let frame = 0;
  const queue = [];
  for (let i = 0; i < final.length; i++) {
    const from = el.textContent[i] || '';
    const to = final[i];
    const start = Math.floor(Math.random() * 40);
    const end = start + Math.floor(Math.random() * 40);
    queue.push({ from, to, start, end, char: '' });
  }
  let complete = 0;
  const timer = setInterval(() => {
    let output = '';
    complete = 0;
    for (let i = 0, n = queue.length; i < n; i++) {
      let { from, to, start, end, char } = queue[i];
      if (frame >= end) {
        complete++;
        output += to;
      } else if (frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = chars[Math.floor(Math.random() * chars.length)];
          queue[i].char = char;
        }
        output += `<span style="color:var(--accent)">${char}</span>`;
      } else {
        output += from;
      }
    }
    el.innerHTML = output;
    if (complete === queue.length) {
      clearInterval(timer);
      el.textContent = final;
    }
    frame++;
  }, 1000/60);
}

function heroAnim(){
  const words = ['FEZEU','WAMGA MORIEN','JORDAN'];
  gsap.set(['#w1','#w2','#w3','#w4'],{opacity:0,y:20});
  
  const tl=gsap.timeline();
  tl.to('#hEye',{opacity:1,y:0,duration:.7,ease:'power3.out'},'.3')
    .add(() => {
      scrambleText('w1', 'FEZEU');
      gsap.to('#w1',{opacity:1,y:0});
    }, '.5')
    .add(() => {
      scrambleText('w2', 'WAMGA');
      scrambleText('w3', 'MORIEN');
      gsap.to(['#w2','#w3'],{opacity:1,y:0});
    }, '.8')
    .add(() => {
      scrambleText('w4', 'JORDAN');
      gsap.to('#w4',{opacity:1,y:0});
    }, '1.1')
    .to('#hSub',{opacity:1,y:0,duration:.8,ease:'power3.out'},'1.6')
    .to('#hPills',{opacity:1,y:0,duration:.7,ease:'power3.out'},'1.8')
    .to('#hStat',{opacity:1,x:0,duration:.7,ease:'power3.out'},'1.9')
    .to('#hScroll',{opacity:1,duration:.6},'2.2');
}

/* ══════════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════════ */
function initScrollAnims(){
  gsap.registerPlugin(ScrollTrigger);

  // Généric reveals
  gsap.utils.toArray('.reveal').forEach(el=>{
    gsap.to(el,{
      opacity:1,y:0,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none none'}
    });
  });

  // Skills : flip 3D Y (rotateY 90→0)
  gsap.utils.toArray('.sk-flip').forEach((card,i)=>{
    gsap.from(card,{
      rotateY:90,opacity:0,
      transformPerspective:1000,transformOrigin:'left center',
      duration:.8,delay:i*.1,ease:'back.out(1.2)',
      scrollTrigger:{trigger:'#skills',start:'top 72%',toggleActions:'play none none none'}
    });
  });

  // Project cards : scale up reveal
  gsap.utils.toArray('.proj-reveal').forEach((card,i)=>{
    gsap.from(card,{
      scale:.9,y:40,opacity:0,
      transformPerspective:800,
      duration:.75,delay:i*.12,ease:'power3.out',
      scrollTrigger:{trigger:'#projects',start:'top 75%',toggleActions:'play none none none'}
    });
  });

  // Testimonial cards : flip vertical
  gsap.utils.toArray('.testi-card').forEach((card,i)=>{
    gsap.from(card,{
      rotateX:-70,opacity:0,
      transformPerspective:900,transformOrigin:'top center',
      duration:.9,delay:i*.12,ease:'back.out(1)',
      scrollTrigger:{trigger:'#testimonials',start:'top 75%',toggleActions:'play none none none'}
    });
  });

  const cBig=document.getElementById('contactBig');
  if(cBig){
    const text = cBig.textContent;
    cBig.innerHTML='';
    const contactChars=[...text].map((ch,i)=>{
      const span=document.createElement('span');
      span.textContent=ch;
      span.style.display='inline-block';
      if(ch==' ') span.style.width='0.25em';
      return span;
    });
    contactChars.forEach(s=>cBig.appendChild(s));
    gsap.set(cBig,{opacity:1});
    gsap.from(contactChars,{
      y: 40,
      opacity:0,
      rotateX:-30,
      duration:1,stagger:.03,ease:'power4.out',
      scrollTrigger:{trigger:'#contact',start:'top 85%',toggleActions:'play none none none'}
    });
  }

  // Icon items tilt on mousemove
  document.querySelectorAll('.sk-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotateY:x*10,rotateX:-y*8,transformPerspective:600,duration:.3,ease:'power2.out'});
    });
    card.addEventListener('mouseleave',()=>{
      gsap.to(card,{rotateY:0,rotateX:0,duration:.5,ease:'power3.out'});
    });
  });

  // About counter animation
  const bigNum=document.querySelector('.about-big em');
  if(bigNum){
    ScrollTrigger.create({
      trigger:'#about',start:'top 70%',once:true,
      onEnter:()=>{
        let counter={val:0};
        gsap.to(counter,{
          val:3,duration:1.5,ease:'power3.out',
          onUpdate:()=>{bigNum.textContent=Math.ceil(counter.val)}
        });
      }
    });
  }

  // Chatbot initialization
  function initChatbot() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatToggle || !chatWindow) return; // Elements not found

    let conversationHistory = [];
    let isLoading = false;

    // Toggle chat window
    chatToggle.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
      chatToggle.classList.toggle('active');
      if (chatWindow.classList.contains('active')) {
        chatInput.focus();
      }
    });

    // Close chat window
    if (chatClose) {
      chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        chatToggle.classList.remove('active');
      });
    }

    // Send message on button click
    if (chatSend) {
      chatSend.addEventListener('click', sendMessage);
    }

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    async function sendMessage() {
      const message = chatInput.value.trim();
      if (!message || isLoading) return;

      // Add user message to history and UI
      conversationHistory.push({ role: 'user', content: message });
      addMessageToUI(message, 'user');
      chatInput.value = '';
      chatInput.style.height = 'auto';

      isLoading = true;
      if (chatSend) chatSend.disabled = true;

      // Show loading indicator
      const loadingId = 'loading-' + Date.now();
      chatMessages.innerHTML += `<div id="${loadingId}" class="msg assistant"><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div></div>`;
      chatMessages.scrollTop = chatMessages.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversationHistory })
        });

        const data = await response.json();

        // Remove loading indicator
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        if (response.ok && data.message) {
          // Add assistant message to history and UI
          conversationHistory.push({ role: 'assistant', content: data.message });
          addMessageToUI(data.message, 'assistant');
        } else {
          addMessageToUI('Erreur: Impossible de contacter le serveur.', 'assistant');
        }
      } catch (error) {
        console.error('Chat error:', error);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        addMessageToUI('Erreur de connexion. Assurez-vous que le serveur Node.js est lancé sur le port 3000.', 'assistant');
      } finally {
        isLoading = false;
        if (chatSend) chatSend.disabled = false;
        chatInput.focus();
      }
    }

    function addMessageToUI(text, role) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `msg ${role}`;
      msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    });
  }

  // Initialize on page load
  initChatbot();
}
/* ══ PROJECT TABS ══ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.proj-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.proj-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.proj-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  });
});
