import { useState, useEffect, useRef, useMemo } from 'react';
import './sage-light.css';

/* ===================== TARJIMALAR ===================== */
const T = {
  uz: {
    eyebrow:'Taklifnoma', open:"Taklifnomani ochish",
    lead:"Hayotimizdagi eng nurli kunni siz bilan birga nishonlashni istaymiz. Sizni to'y tantanamizga samimiy taklif etamiz.",
    quote:"Ikki qalb birlashgan bu nurli kunda, baxtimizga sherik bo'lishingizni istaymiz.",
    timer:'Tantanagacha', day:'kun', hour:'soat', min:'daqiqa', sec:'soniya',
    gallery:'Bizning lahzalar', program:'Tantana dasturi',
    p1:'Kuyovnavkar', p2:'Kelin va kuyov tashrifi', p3:"To'y oshi va tabriklar", p4:'Yakuniy raqs',
    dress:"Liboslar uyg'unligi", dressText:"Bayramimiz yagona uslubda bo'lishi uchun quyidagi nozik ranglarni tavsiya qilamiz:",
    loc:'Manzil va vaqt', venue:'Mumtoz Tantanalar Saroyi', addr:"Farg'ona viloyati, Buvayda tumani", time:'Boshlanish: 18:00',
    map:'Xaritada ochish', cal:"Taqvimga qo'shish",
    gifts:"Qutlovlar uchun", giftsText:"Tashrifingiz biz uchun eng qimmatli sovg'a. Istasangiz, quyidagi karta orqali ham qutlashingiz mumkin:",
    copy:'Nusxa olish', copied:'Nusxa olindi \u2713',
    rsvpT:'Tashrifingizni tasdiqlang', rsvpS:"Iltimos, marosimda ishtirokingizni oldindan ma'lum qiling.",
    yes:'Albatta boraman', no:'Afsus, kela olmayman',
  },
  ru: {
    eyebrow:'Приглашение', open:'Открыть приглашение',
    lead:'Мы хотим разделить самый светлый день нашей жизни вместе с вами. Искренне приглашаем вас на нашу свадьбу.',
    quote:'В этот светлый день, когда два сердца становятся одним, мы хотим, чтобы вы были частью нашего счастья.',
    timer:'До торжества', day:'дней', hour:'часов', min:'минут', sec:'секунд',
    gallery:'Наши моменты', program:'Программа вечера',
    p1:'Утренний плов', p2:'Выход жениха и невесты', p3:'Свадебный плов и поздравления', p4:'Финальный танец',
    dress:'Гармония нарядов', dressText:'Чтобы наш праздник был в единой палитре, рекомендуем нежные оттенки:',
    loc:'Место и время', venue:'Mumtoz Tantanalar Saroyi', addr:'Ферганская обл., Бувайда', time:'Начало: 18:00',
    map:'Открыть карту', cal:'В календарь',
    gifts:'Для поздравлений', giftsText:'Ваше присутствие — лучший подарок. При желании можете поздравить и по реквизитам:',
    copy:'Скопировать', copied:'Скопировано \u2713',
    rsvpT:'Подтвердите присутствие', rsvpS:'Пожалуйста, сообщите заранее о вашем присутствии.',
    yes:'Обязательно буду', no:'К сожалению, не смогу',
  },
};

/* ===================== AMBIENT OLTIN YULDUZCHALAR ===================== */
function SparkleCanvas({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let sparks = [], raf, frame = 0;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const addSpark = () => {
      if (sparks.length > 45) return;
      sparks.push({ x:Math.random()*c.width, y:Math.random()*c.height, r:Math.random()*2.2+.7, life:1,
        decay:.007+Math.random()*.014, vx:(Math.random()-.5)*.35, vy:-(Math.random()*.55+.1), hue:34+Math.random()*24 });
    };
    const drawStar = (x,y,r,a,h) => {
      ctx.save(); ctx.globalAlpha=a;
      ctx.fillStyle=`hsl(${h},90%,68%)`; ctx.shadowColor=`hsl(${h},90%,75%)`; ctx.shadowBlur=r*6;
      ctx.beginPath();
      for(let i=0;i<4;i++){
        const ang=(i/4)*Math.PI*2-Math.PI/4, b=ang+Math.PI/4;
        i===0?ctx.moveTo(x+Math.cos(ang)*r,y+Math.sin(ang)*r):ctx.lineTo(x+Math.cos(ang)*r,y+Math.sin(ang)*r);
        ctx.lineTo(x+Math.cos(b)*r*.26,y+Math.sin(b)*r*.26);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    };
    const tick = () => {
      frame++; ctx.clearRect(0,0,c.width,c.height);
      if(frame%5===0) addSpark();
      sparks=sparks.filter(s=>s.life>.04);
      sparks.forEach(s=>{ s.x+=s.vx;s.y+=s.vy;s.life-=s.decay; drawStar(s.x,s.y,s.r*s.life,s.life*.65,s.hue); });
      raf=requestAnimationFrame(tick);
    };
    tick();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[active]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:2,pointerEvents:'none',opacity:.58}}/>;
}

/* ===================== KURSOR OLTIN IZI ===================== */
function CursorTrail({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active||window.matchMedia('(pointer:coarse)').matches) return;
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d'); let pts=[],raf;
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize(); window.addEventListener('resize',resize);
    const onMove=e=>{
      for(let i=0;i<4;i++) pts.push({
        x:e.clientX+(Math.random()-.5)*8, y:e.clientY+(Math.random()-.5)*8,
        r:Math.random()*3.5+.8, life:1,
        vx:(Math.random()-.5)*1.5, vy:-(Math.random()*1.4+.4), hue:35+Math.random()*20,
      });
    };
    window.addEventListener('mousemove',onMove,{passive:true});
    const tick=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      pts=pts.filter(p=>p.life>.04);
      pts.forEach(p=>{ p.x+=p.vx;p.y+=p.vy;p.vy-=.05;p.life-=.028;p.r*=.97;
        ctx.save(); ctx.globalAlpha=p.life*.8; ctx.fillStyle=`hsl(${p.hue},88%,65%)`;
        ctx.shadowColor=`hsl(${p.hue},90%,72%)`; ctx.shadowBlur=7;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore();
      });
      raf=requestAnimationFrame(tick);
    };
    tick();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); window.removeEventListener('mousemove',onMove); };
  },[active]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:8,pointerEvents:'none'}}/>;
}

/* ===================== DARVOZA OCHILGANDA ZARRALAR ===================== */
function GateParticles({ trigger }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!trigger) return;
    const c=ref.current; if(!c) return;
    c.width=window.innerWidth; c.height=window.innerHeight;
    const ctx=c.getContext('2d');
    const cx=c.width/2, cy=c.height/2;
    const colors=['#d4af37','#f5e48b','#b9962f','#fff4c0','#c4a777','#a9b897','#7d8c6f'];
    let pts=[], raf;
    for(let i=0;i<90;i++){
      const angle=(i/90)*Math.PI*2;
      const spd=Math.random()*9+3;
      pts.push({
        x:cx,y:cy,
        vx:Math.cos(angle)*spd*(Math.random()+.5),
        vy:Math.sin(angle)*spd*(Math.random()+.5)-3,
        r:Math.random()*7+2, life:1,
        decay:.012+Math.random()*.018,
        color:colors[Math.floor(Math.random()*colors.length)],
        rot:Math.random()*Math.PI*2,
        rotSpd:(Math.random()-.5)*.28,
        grav:.14+Math.random()*.1,
        shape:Math.random()>.45?'rect':'circle',
      });
    }
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      pts=pts.filter(p=>p.life>.04);
      if(!pts.length){ cancelAnimationFrame(raf); return; }
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=p.grav; p.vx*=.985;
        p.life-=p.decay; p.rot+=p.rotSpd;
        ctx.save(); ctx.globalAlpha=p.life; ctx.fillStyle=p.color;
        ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        if(p.shape==='circle'){ ctx.beginPath(); ctx.arc(0,0,p.r*p.life,0,Math.PI*2); ctx.fill(); }
        else { ctx.fillRect(-p.r,-p.r*.5,p.r*2,p.r); }
        ctx.restore();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[trigger]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:991,pointerEvents:'none'}}/>;
}

/* ===================== YULDUZLAR MAYDONI ===================== */
function StarField({ active }) {
  const stars = useMemo(()=>
    Array.from({length:38},(_,i)=>({
      id:i, x:Math.random()*100, y:Math.random()*100,
      size:Math.random()*2.4+.8,
      dur:(Math.random()*3+2).toFixed(2),
      delay:(Math.random()*5).toFixed(2),
    })),[]);
  if(!active) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none',overflow:'hidden'}}>
      {stars.map(s=>(
        <div key={s.id} className="sg-star" style={{
          left:`${s.x}%`, top:`${s.y}%`,
          width:`${s.size}px`, height:`${s.size}px`,
          '--tw-dur':`${s.dur}s`, '--tw-delay':`${s.delay}s`,
          boxShadow:`0 0 ${s.size*2}px ${s.size*.8}px rgba(212,175,55,.3)`,
        }}/>
      ))}
    </div>
  );
}

/* ===================== MUSIQA VIZUALIZER ===================== */
function MusicViz({ playing }) {
  const bars = useMemo(()=>
    Array.from({length:5},(_,i)=>({
      id:i,
      h:`${Math.floor(Math.random()*14+5)}px`,
      dur:`${(.36+Math.random()*.38).toFixed(2)}s`,
      delay:`${(i*.1).toFixed(1)}s`,
    })),[]);
  return (
    <div className="sg-viz" style={{opacity:playing?1:0}}>
      {bars.map(b=>(
        <div key={b.id} className="sg-viz-bar" style={{
          '--vb-h':b.h, '--vb-dur':b.dur, '--vb-delay':b.delay,
        }}/>
      ))}
    </div>
  );
}

/* ===================== ANIMATSIYALI IMZO ===================== */
function AnimatedSignature() {
  return (
    <svg
      viewBox="0 0 350 85"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{width:'min(300px,78vw)',display:'block',margin:'16px auto 0'}}
    >
      <defs>
        <linearGradient id="sigGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#b9962f"/>
          <stop offset="45%"  stopColor="#f5e48b"/>
          <stop offset="100%" stopColor="#d4af37"/>
        </linearGradient>
      </defs>
      {/* Oqayotgan qo'lyozma chizig'i */}
      <path
        d="M18,52 C22,30 34,18 50,28 C62,36 58,54 70,40 C80,28 94,22 106,33 C116,42 112,58 122,48 C132,38 144,25 158,36 C170,46 164,64 176,52 C186,40 200,26 215,38 C226,48 224,66 236,56 C248,44 262,30 276,42 C286,52 284,68 296,58 C306,50 316,38 330,46"
        fill="none"
        stroke="url(#sigGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{strokeDasharray:900,strokeDashoffset:900,
          animation:'sigDraw 3.4s cubic-bezier(.4,0,.2,1) .4s forwards'}}
      />
      {/* Yuqori qo'shimcha naqsh */}
      <path
        d="M55,22 C80,10 140,8 190,18"
        fill="none" stroke="url(#sigGrad)" strokeWidth="1"
        strokeLinecap="round" opacity=".5"
        style={{strokeDasharray:200,strokeDashoffset:200,
          animation:'sigDraw 1.5s ease 3.2s forwards'}}
      />
      {/* Pastki bezak chizig'i */}
      <path
        d="M12,72 C90,82 200,78 338,72"
        fill="none" stroke="url(#sigGrad)" strokeWidth="1"
        strokeLinecap="round" opacity=".45"
        style={{strokeDasharray:360,strokeDashoffset:360,
          animation:'sigDraw 1.8s ease 3.6s forwards'}}
      />
    </svg>
  );
}

/* ===================== HARF-HARF SARLAVHA ===================== */
function SplitText({ text, className }) {
  return (
    <span className={`sg-split ${className||''}`}>
      {text.split('').map((ch,i)=>(
        <span className="ch" style={{'--ch-delay':`${i*.065}s`}} key={i}>
          {ch===' '?'\u00A0':ch}
        </span>
      ))}
    </span>
  );
}

/* ===================== FLIP RAQAM ===================== */
function FlipDigit({ value, label }) {
  const [prev,setPrev]=useState(value);
  const [flip,setFlip]=useState(false);
  useEffect(()=>{
    if(value!==prev){
      setFlip(true);
      const id=setTimeout(()=>{setPrev(value);setFlip(false);},320);
      return ()=>clearTimeout(id);
    }
  },[value,prev]);
  return (
    <div className="tb">
      <span className={`v ${flip?'flip':''}`}>{value}</span>
      <span className="l">{label}</span>
    </div>
  );
}

/* ===================== ASOSIY KOMPONENT ===================== */
export default function OrientalInvitation() {
  const [lang,setLang]           = useState('uz');
  const [isOpening,setIsOpening] = useState(false);
  const [opened,setOpened]       = useState(false);
  const [playing,setPlaying]     = useState(false);
  const [copied,setCopied]       = useState(false);
  const [time,setTime]           = useState({d:'00',h:'00',m:'00',s:'00'});
  const [rsvp,setRsvp]           = useState(()=>localStorage.getItem('rsvp')||null);
  const [counts,setCounts]       = useState(()=>JSON.parse(localStorage.getItem('rsvpC')||'{"accept":0,"decline":0}'));
  const [burst,setBurst]         = useState([]);
  const [hearts,setHearts]       = useState([]);
  const [lightBurst,setLightBurst] = useState(false);
  const [rays,setRays]           = useState([]);
  const [gateTrigger,setGateTrigger] = useState(0);

  const audioRef     = useRef(null);
  const heroRef      = useRef(null);
  const revealRefs   = useRef([]);
  const parallaxRefs = useRef([]);
  revealRefs.current=[];
  parallaxRefs.current=[];
  const t=T[lang];

  useEffect(()=>{ localStorage.setItem('rsvpC',JSON.stringify(counts)); },[counts]);
  useEffect(()=>{ if(rsvp) localStorage.setItem('rsvp',rsvp); },[rsvp]);

  /* --- Timer --- */
  useEffect(()=>{
    const target=new Date('August 19, 2026 18:00:00').getTime();
    const id=setInterval(()=>{
      const dist=target-Date.now();
      if(dist<=0){clearInterval(id);return;}
      const p=v=>String(v).padStart(2,'0');
      setTime({d:p(Math.floor(dist/864e5)),h:p(Math.floor((dist%864e5)/36e5)),m:p(Math.floor((dist%36e5)/6e4)),s:p(Math.floor((dist%6e4)/1e3))});
    },1000);
    return ()=>clearInterval(id);
  },[]);

  /* --- Stagger reveal --- */
  useEffect(()=>{
    if(!opened) return;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.style.transitionDelay=`${e.target.dataset.delay||0}ms`;
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },{threshold:.1});
    revealRefs.current.forEach(el=>el&&io.observe(el));
    return ()=>io.disconnect();
  },[opened]);

  /* --- Scroll: progress + parallax + hearts --- */
  useEffect(()=>{
    let ticking=false, lastHeart=0;
    const onScroll=()=>{
      if(ticking) return; ticking=true;
      window.requestAnimationFrame(()=>{
        const sy=window.scrollY;
        const el=document.getElementById('sgProgress');
        if(el){ const h=document.documentElement.scrollHeight-window.innerHeight; el.style.width=(h>0?(sy/h)*100:0)+'%'; }
        parallaxRefs.current.forEach(p=>{
          if(!p) return;
          p.style.transform=`translateY(${sy*parseFloat(p.dataset.speed||'.2')}px)`;
        });
        const now=Date.now();
        if(now-lastHeart>320){
          lastHeart=now;
          const id=now+Math.random();
          setHearts(h=>[...h,{id,x:Math.random()*88+4}]);
          setTimeout(()=>setHearts(h=>h.filter(x=>x.id!==id)),4200);
        }
        ticking=false;
      });
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',onScroll);
  },[opened]);

  /* --- Hero mouse parallax --- */
  useEffect(()=>{
    if(!opened) return;
    const el=heroRef.current; if(!el) return;
    const onMove=ev=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--px',((ev.clientX-r.left-r.width/2)/r.width).toFixed(3));
      el.style.setProperty('--py',((ev.clientY-r.top-r.height/2)/r.height).toFixed(3));
    };
    el.addEventListener('mousemove',onMove);
    return ()=>el.removeEventListener('mousemove',onMove);
  },[opened]);

  const addRef      = el=>{ if(el&&!revealRefs.current.includes(el))   revealRefs.current.push(el); };
  const addParallax = el=>{ if(el&&!parallaxRefs.current.includes(el)) parallaxRefs.current.push(el); };

  /* --- 3D tilt --- */
  const onTilt=(e)=>{
    const el=e.currentTarget,r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    el.style.transform=`perspective(800px) rotateY(${x*12}deg) rotateX(${-y*12}deg) scale(1.04)`;
  };
  const resetTilt=e=>{ e.currentTarget.style.transform=''; };

  /* --- Magnetic button --- */
  const onMagnet=e=>{
    const el=e.currentTarget,r=el.getBoundingClientRect();
    el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.35}px,${(e.clientY-r.top-r.height/2)*.35}px)`;
  };
  const resetMagnet=e=>{ e.currentTarget.style.transform=''; };

  /* --- Ripple --- */
  const ripple=e=>{
    const btn=e.currentTarget, d=Math.max(btn.clientWidth,btn.clientHeight), r=btn.getBoundingClientRect();
    const circle=document.createElement('span');
    circle.className='sg-ripple';
    circle.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;
    btn.appendChild(circle);
    setTimeout(()=>circle.remove(),600);
  };

  /* --- Darvoza ochish --- */
  const open=()=>{
    setIsOpening(true); setLightBurst(true);
    setGateTrigger(n=>n+1);
    setRays(Array.from({length:14},(_,i)=>({
      id:i, angle:(i/14)*360, height:`${Math.random()*35+55}vmax`,
    })));
    if(audioRef.current) audioRef.current.play().then(()=>setPlaying(true)).catch(()=>{});
    setTimeout(()=>{ setLightBurst(false); setRays([]); },2000);
    setTimeout(()=>setOpened(true),1500);
  };

  const toggleMusic=()=>{
    if(!audioRef.current) return;
    if(playing) audioRef.current.pause(); else audioRef.current.play();
    setPlaying(!playing);
  };

  /* --- Confetti portlashi --- */
  const fireConfetti=()=>{
    const colors=['#7d8c6f','#a9b897','#d4af37','#f2ece4','#c4a777','#fff6d6','#b9962f'];
    setBurst(Array.from({length:60},(_,i)=>({
      id:Date.now()+i,
      x:(Math.random()-.5)*400, y:-(Math.random()*320+80),
      r:Math.random()*420, c:colors[i%colors.length], d:Math.random()*.3,
    })));
    setTimeout(()=>setBurst([]),1600);
  };

  /* --- RSVP --- */
  const handleRsvp=(status,e)=>{
    if(e) ripple(e);
    if(rsvp===status) return;
    setCounts(prev=>{
      let a=prev.accept, d=prev.decline;
      if(status==='accept'){a++;if(rsvp==='decline')d--;}
      else{d++;if(rsvp==='accept')a--;}
      return {accept:a,decline:d};
    });
    setRsvp(status);
    if(status==='accept') fireConfetti();
  };

  const copyCard=e=>{
    ripple(e); navigator.clipboard.writeText('4067 0700 0947 4359');
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };

  const calLink="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mohirbek+va+Nilufarxon&dates=20260819T130000Z/20260819T180000Z&location=Farg'ona";
  const PETAL_TYPES=['type-star','type-leaf','type-dot','type-star','type-leaf','type-dot','type-star','type-dot','type-leaf','type-star','type-dot','type-leaf'];

  /* ===================== RENDER ===================== */
  return (
    <div className="sg-wrap">
      <audio ref={audioRef} src="/assets/uzbek music.m4a" loop/>
      <div className="sg-progress" id="sgProgress"/>

      {/* Canvas qatlamlari */}
      <SparkleCanvas active={opened}/>
      <CursorTrail   active={opened}/>
      <GateParticles trigger={gateTrigger}/>

      {/* Twinkling yulduzlar */}
      <StarField active={opened}/>

      {/* Floating yuraklar */}
      <div className="sg-hearts">
        {hearts.map(h=><span className="sg-heart" key={h.id} style={{left:`${h.x}%`}}>&#10084;</span>)}
      </div>

      {/* Fon qatlamlari */}
      <div className="sg-mesh"/>
      <div className="sg-parallax-bg" ref={addParallax} data-speed="-0.15"/>
      <div className="sg-petals">
        {PETAL_TYPES.map((type,i)=><span key={i} className={`sg-petal ${type}`}/>)}
      </div>
      <div className="sg-corner sg-corner-tl"/>
      <div className="sg-corner sg-corner-br"/>
      <div className="sg-bg-pattern"/>

      {/* Til tanlash */}
      <div className="sg-lang">
        <button className={lang==='uz'?'on':''} onClick={()=>setLang('uz')}>UZ</button>
        <button className={lang==='ru'?'on':''} onClick={()=>setLang('ru')}>RU</button>
      </div>

      {/* Yorug'lik portlashi */}
      {lightBurst&&<div className="sg-light-burst"/>}
      {rays.length>0&&(
        <div className="sg-rays">
          {rays.map(r=><div key={r.id} className="sg-ray" style={{transform:`rotate(${r.angle}deg)`,height:r.height}}/>)}
        </div>
      )}

      {/* ========== DARVOZA ========== */}
      {!opened&&(
        <div className={`sg-gate ${isOpening?'opening':''}`}>
          <div className="sg-door sg-door-left"><div className="sg-door-ornament left"/></div>
          <div className="sg-door sg-door-right"><div className="sg-door-ornament right"/></div>
          <div className="sg-gate-card">
            <div className="sg-card-inner">
              <span className="sg-sprig">&#10047;</span>
              <p className="sg-eyebrow">{t.eyebrow}</p>
              <h1 className="sg-names sg-glow">
                <SplitText text="Mohirbek"/>
                <br/><span className="amp">&amp;</span><br/>
                <SplitText text="Nilufarxon"/>
              </h1>
              <div className="sg-divider"/>
              <p className="sg-date">19 . 08 . 2026</p>
              <button className="sg-btn sg-open" onMouseMove={onMagnet} onMouseLeave={resetMagnet}
                onClick={e=>{ripple(e);open();}}>
                {t.open}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ASOSIY KONTENT ========== */}
      <div className={`sg-content ${opened?'show':''}`}>

        {/* Musiqa + vizualizer */}
        <div className="sg-music-wrap">
          <button className="sg-music" onClick={toggleMusic}>
            <span className={playing?'spin':''}>{playing?'\u23F8':'\u266A'}</span>
          </button>
          <MusicViz playing={playing}/>
        </div>

        {/* ---- HERO ---- */}
        <section className="sg-hero" ref={heroRef}>
          <span className="sg-sprig">&#10047;</span>
          <p className="sg-eyebrow">{t.eyebrow}</p>
          <h1 className="sg-names sg-names-big sg-glow">
            <SplitText text="Mohirbek"/><br/>
            <span className="amp">&amp;</span><br/>
            <SplitText text="Nilufarxon"/>
          </h1>

          {/* SVG imzo animatsiyasi */}
          <AnimatedSignature/>

          <div className="sg-divider"/>
          <p className="sg-date">19 . 08 . 2026</p>

          <div className="sg-hero-photo-wrap" onMouseMove={onTilt} onMouseLeave={resetTilt}>
            <div className="sg-hero-photo" ref={addParallax} data-speed="0.1"
              style={{backgroundImage:"url('/assets/image-1.png')"}}/>
            <div className="sg-hero-frame"/>
          </div>
          <div className="sg-scroll-hint"><span/></div>
        </section>

        {/* ---- Taklif matni ---- */}
        <div className="sg-card reveal flip3d" ref={addRef}>
          <div className="sg-card-inner"><p className="sg-lead">{t.lead}</p></div>
        </div>

        {/* ---- Iqtibos ---- */}
        <div className="sg-card sg-card-quote reveal flip3d" ref={addRef}>
          <div className="sg-card-inner"><p className="sg-quote">"{t.quote}"</p></div>
        </div>

        {/* ---- Galereya ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.gallery}</span></h2>
            <div className="sg-gallery">
              {[['image-1.png',0],['image-2.png',120],['image-3.png',240]].map(([img,delay])=>(
                <div key={img} className="sg-g" data-delay={delay}
                  style={{backgroundImage:`url('/assets/${img}')`}}
                  onMouseMove={onTilt} onMouseLeave={resetTilt}/>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Timer ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.timer}</span></h2>
            <div className="sg-timer">
              <FlipDigit value={time.d} label={t.day}/>
              <FlipDigit value={time.h} label={t.hour}/>
              <FlipDigit value={time.m} label={t.min}/>
              <FlipDigit value={time.s} label={t.sec}/>
            </div>
          </div>
        </div>

        {/* ---- Dastur ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.program}</span></h2>
            <div className="sg-program-list">
              {[['15:00',t.p1,0],['17:00',t.p2,100],['18:00',t.p3,200],['20:00',t.p4,300]].map(([tm,dt,delay])=>(
                <div className="sg-row reveal" data-delay={delay} ref={addRef} key={tm}>
                  <span className="tm">{tm}</span><span className="dt">{dt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Liboslar ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.dress}</span></h2>
            <p className="sg-lead">{t.dressText}</p>
            <div className="sg-colors">
              {[['#7d8c6f','0s'],['#a9b897','.18s'],['#d4af37','.36s'],['#f2ece4','.54s']].map(([bg,d])=>(
                <span key={bg} style={{background:bg,animationDelay:d}}/>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Manzil ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.loc}</span></h2>
            <div className="sg-venue-wrap" onMouseMove={onTilt} onMouseLeave={resetTilt}>
              <div className="sg-venue" style={{backgroundImage:"url('/assets/toyxona.png')"}}/>
            </div>
            <h3 className="sg-venue-name">{t.venue}</h3>
            <p className="sg-lead">{t.addr}</p>
            <p className="sg-time">{t.time}</p>
            <div className="sg-btn-row">
              <a className="sg-btn" href="https://yandex.uz/maps/-/CPVdUQMb" target="_blank" rel="noreferrer"
                onMouseMove={onMagnet} onMouseLeave={resetMagnet} onClick={ripple}>{t.map}</a>
              <a className="sg-btn" href={calLink} target="_blank" rel="noreferrer"
                onMouseMove={onMagnet} onMouseLeave={resetMagnet} onClick={ripple}>{t.cal}</a>
            </div>
          </div>
        </div>

        {/* ---- Bank karta ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.gifts}</span></h2>
            <p className="sg-lead">{t.giftsText}</p>
            <div className="sg-bankcard" onMouseMove={onTilt} onMouseLeave={resetTilt}>
              <div className="sg-card-pattern"/>
              <span className="brand">Uzcard / Humo</span>
              <div className="chip"/>
              <p className="num">4067 0700 0947 4359</p>
              <p className="holder">ERKINOV MOHIRBEK</p>
            </div>
            <button className={`sg-btn ${copied?'done':''}`}
              onMouseMove={onMagnet} onMouseLeave={resetMagnet} onClick={copyCard}>
              {copied?t.copied:t.copy}
            </button>
          </div>
        </div>

        {/* ---- RSVP ---- */}
        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title sg-glow"><span>{t.rsvpT}</span></h2>
            <p className="sg-lead">{t.rsvpS}</p>
            <div className="sg-rsvp">
              <button className={`sg-btn ${rsvp==='accept'?'on':''}`} onClick={e=>handleRsvp('accept',e)}>
                <span>{t.yes}</span><span className="cnt">{counts.accept}</span>
                <div className="sg-confetti">
                  {burst.map(p=>(
                    <i key={p.id} style={{background:p.c,'--tx':`${p.x}px`,'--ty':`${p.y}px`,'--rot':`${p.r}deg`,animationDelay:`${p.d}s`}}/>
                  ))}
                </div>
              </button>
              <button className={`sg-btn ${rsvp==='decline'?'on':''}`} onClick={e=>handleRsvp('decline',e)}>
                <span>{t.no}</span><span className="cnt">{counts.decline}</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="sg-footer">
          <span className="sg-sprig">&#10047;</span>
          Mohirbek &amp; Nilufarxon · 2026<br/><br/>
          <a href="https://t.me/moxirbek_erkinov" target="_blank" rel="noreferrer">made with love</a>
        </footer>
      </div>
    </div>
  );
}