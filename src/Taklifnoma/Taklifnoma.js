import { useState, useEffect, useRef } from 'react';
import './sage-light.css';

const T = {
  uz: {
    eyebrow: 'Taklifnoma', open: 'Taklifnomani ochish',
    lead: "Hayotimizdagi eng nurli kunni siz bilan birga nishonlashni istaymiz. Sizni to'y tantanamizga samimiy taklif etamiz.",
    quote: 'Ikki qalb birlashgan bu nurli kunda, baxtimizga sherik bo\u2018lishingizni istaymiz.',
    timer: 'Tantanagacha', day: 'kun', hour: 'soat', min: 'daqiqa', sec: 'soniya',
    gallery: 'Bizning lahzalar', program: 'Tantana dasturi',
    p1: 'Kuyovnavkar', p2: 'Kelin va kuyov tashrifi', p3: "To'y oshi va tabriklar", p4: 'Yakuniy raqs',
    dress: 'Liboslar uyg\u2018unligi', dressText: 'Bayramimiz yagona uslubda bo\u2018lishi uchun quyidagi nozik ranglarni tavsiya qilamiz:',
    loc: 'Manzil va vaqt', venue: 'Mumtoz Tantanalar Saroyi', addr: "Farg'ona viloyati, Buvayda tumani", time: 'Boshlanish: 18:00',
    map: 'Xaritada ochish', cal: 'Taqvimga qo\u2018shish',
    gifts: 'Qutlovlar uchun', giftsText: 'Tashrifingiz biz uchun eng qimmatli sovg\u2018a. Istasangiz, quyidagi karta orqali ham qutlashingiz mumkin:',
    copy: 'Nusxa olish', copied: 'Nusxa olindi \u2713',
    rsvpT: 'Tashrifingizni tasdiqlang', rsvpS: "Iltimos, marosimda ishtirokingizni oldindan ma'lum qiling.",
    yes: 'Albatta boraman', no: 'Afsus, kela olmayman'
  },
  ru: {
    eyebrow: 'Приглашение', open: 'Открыть приглашение',
    lead: 'Мы хотим разделить самый светлый день нашей жизни вместе с вами. Искренне приглашаем вас на нашу свадьбу.',
    quote: 'В этот светлый день, когда два сердца становятся одним, мы хотим, чтобы вы были частью нашего счастья.',
    timer: 'До торжества', day: 'дней', hour: 'часов', min: 'минут', sec: 'секунд',
    gallery: 'Наши моменты', program: 'Программа вечера',
    p1: 'Утренний плов', p2: 'Выход жениха и невесты', p3: 'Свадебный плов и поздравления', p4: 'Финальный танец',
    dress: 'Гармония нарядов', dressText: 'Чтобы наш праздник был в единой палитре, рекомендуем нежные оттенки:',
    loc: 'Место и время', venue: 'Mumtoz Tantanalar Saroyi', addr: 'Ферганская обл., Бувайда', time: 'Начало: 18:00',
    map: 'Открыть карту', cal: 'В календарь',
    gifts: 'Для поздравлений', giftsText: 'Ваше присутствие — лучший подарок. При желании можете поздравить и по реквизитам:',
    copy: 'Скопировать', copied: 'Скопировано \u2713',
    rsvpT: 'Подтвердите присутствие', rsvpS: 'Пожалуйста, сообщите заранее о вашем присутствии.',
    yes: 'Обязательно буду', no: 'К сожалению, не смогу'
  }
};

export default function OrientalInvitation() {
  const [lang, setLang] = useState('uz');
  const [isOpening, setIsOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [rsvp, setRsvp] = useState(() => localStorage.getItem('rsvp') || null);
  const [counts, setCounts] = useState(() => JSON.parse(localStorage.getItem('rsvpC') || '{"accept":0,"decline":0}'));

  const audioRef = useRef(null);
  const revealRefs = useRef([]);
  revealRefs.current = [];
  const t = T[lang];

  useEffect(() => { localStorage.setItem('rsvpC', JSON.stringify(counts)); }, [counts]);
  useEffect(() => { if (rsvp) localStorage.setItem('rsvp', rsvp); }, [rsvp]);

  // Timer
  useEffect(() => {
    const target = new Date('August 19, 2026 18:00:00').getTime();
    const id = setInterval(() => {
      const dist = target - Date.now();
      if (dist <= 0) { clearInterval(id); return; }
      const p = (v) => String(v).padStart(2, '0');
      setTime({ d: p(Math.floor(dist / 864e5)), h: p(Math.floor((dist % 864e5) / 36e5)), m: p(Math.floor((dist % 36e5) / 6e4)), s: p(Math.floor((dist % 6e4) / 1e3)) });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (!opened) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { 
        if (e.isIntersecting) { 
          e.target.classList.add('in'); 
          io.unobserve(e.target); 
        } 
      });
    }, { threshold: 0.12 });
    revealRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [opened]);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('sgProgress');
      if (!el) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      el.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const addRef = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };
  
  // Gate animation opening
  const open = () => { 
    setIsOpening(true);
    if (audioRef.current) audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    setTimeout(() => {
      setOpened(true);
    }, 1500); // Wait for the doors to open before removing them
  };
  
  const toggleMusic = () => { if (!audioRef.current) return; if (playing) audioRef.current.pause(); else audioRef.current.play(); setPlaying(!playing); };
  
  const handleRsvp = (status) => {
    if (rsvp === status) return;
    setCounts((prev) => {
      let a = prev.accept, d = prev.decline;
      if (status === 'accept') { a++; if (rsvp === 'decline') d--; } else { d++; if (rsvp === 'accept') a--; }
      return { accept: a, decline: d };
    });
    setRsvp(status);
  };
  
  const copyCard = () => { navigator.clipboard.writeText('4067 0700 0947 4359'); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  const calLink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mohirbek+va+Nilufarxon&dates=20260819T130000Z/20260819T180000Z&location=Farg'ona";

  return (
    <div className="sg-wrap">
      <audio ref={audioRef} src="/assets/uzbek music.m4a" loop />

      <div className="sg-progress" id="sgProgress" />
      
      {/* Falling star/petals */}
      <div className="sg-petals">
        {Array.from({ length: 12 }).map((_, i) => <span className="sg-petal" key={i} />)}
      </div>

      {/* Decorative corners */}
      <div className="sg-corner sg-corner-tl" />
      <div className="sg-corner sg-corner-br" />
      <div className="sg-bg-pattern" />

      {/* Language Toggle */}
      <div className="sg-lang">
        <button className={lang === 'uz' ? 'on' : ''} onClick={() => setLang('uz')}>UZ</button>
        <button className={lang === 'ru' ? 'on' : ''} onClick={() => setLang('ru')}>RU</button>
      </div>

      {/* ----------- 3D DARVOZA INTRO ----------- */}
      {!opened && (
        <div className={`sg-gate ${isOpening ? 'opening' : ''}`}>
          <div className="sg-door sg-door-left">
            <div className="sg-door-ornament left" />
          </div>
          <div className="sg-door sg-door-right">
            <div className="sg-door-ornament right" />
          </div>
          
          <div className="sg-gate-card">
            <div className="sg-card-inner">
              <span className="sg-sprig">&#10047;</span>
              <p className="sg-eyebrow">{t.eyebrow}</p>
              <h1 className="sg-names">Mohirbek <span className="amp">&amp;</span> Nilufarxon</h1>
              <div className="sg-divider" />
              <p className="sg-date">19 . 08 . 2026</p>
              <button className="sg-btn sg-open" onClick={open}>{t.open}</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------- ASOSIY KONTENT ----------- */}
      <div className={`sg-content ${opened ? 'show' : ''}`}>
        <button className="sg-music" onClick={toggleMusic}>{playing ? '\u23F8' : '\u266A'}</button>

        <section className="sg-hero">
          <span className="sg-sprig">&#10047;</span>
          <p className="sg-eyebrow">{t.eyebrow}</p>
          <h1 className="sg-names sg-names-big">Mohirbek <br/><span className="amp">&amp;</span><br/> Nilufarxon</h1>
          <div className="sg-divider" />
          <p className="sg-date">19 . 08 . 2026</p>
          <div className="sg-hero-photo-wrap">
             <div className="sg-hero-photo" style={{ backgroundImage: "url('/assets/image-1.png')" }} />
             <div className="sg-hero-frame" />
          </div>
        </section>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <p className="sg-lead">{t.lead}</p>
          </div>
        </div>
        
        <div className="sg-card sg-card-quote reveal" ref={addRef}>
          <div className="sg-card-inner">
             <p className="sg-quote">"{t.quote}"</p>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.gallery}</span></h2>
            <div className="sg-gallery">
              <div className="sg-g" style={{ backgroundImage: "url('/assets/image-1.png')" }} />
              <div className="sg-g" style={{ backgroundImage: "url('/assets/image-2.png')" }} />
              <div className="sg-g" style={{ backgroundImage: "url('/assets/image-3.png')" }} />
            </div>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.timer}</span></h2>
            <div className="sg-timer">
              <div className="tb"><span className="v">{time.d}</span><span className="l">{t.day}</span></div>
              <div className="tb"><span className="v">{time.h}</span><span className="l">{t.hour}</span></div>
              <div className="tb"><span className="v">{time.m}</span><span className="l">{t.min}</span></div>
              <div className="tb"><span className="v">{time.s}</span><span className="l">{t.sec}</span></div>
            </div>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.program}</span></h2>
            <div className="sg-program-list">
              <div className="sg-row"><span className="tm">15:00</span><span className="dt">{t.p1}</span></div>
              <div className="sg-row"><span className="tm">17:00</span><span className="dt">{t.p2}</span></div>
              <div className="sg-row"><span className="tm">18:00</span><span className="dt">{t.p3}</span></div>
              <div className="sg-row"><span className="tm">20:00</span><span className="dt">{t.p4}</span></div>
            </div>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.dress}</span></h2>
            <p className="sg-lead">{t.dressText}</p>
            <div className="sg-colors">
              <span style={{ background: "#7d8c6f" }} />
              <span style={{ background: "#a9b897" }} />
              <span style={{ background: "#d4af37" }} />
              <span style={{ background: "#f2ece4" }} />
            </div>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.loc}</span></h2>
            <div className="sg-venue-wrap">
               <div className="sg-venue" style={{ backgroundImage: "url('/assets/toyxona.png')" }} />
            </div>
            <h3 className="sg-venue-name">{t.venue}</h3>
            <p className="sg-lead">{t.addr}</p>
            <p className="sg-time">{t.time}</p>
            <div className="sg-btn-row">
              <a className="sg-btn" href="https://yandex.uz/maps/-/CPVdUQMb" target="_blank" rel="noreferrer">{t.map}</a>
              <a className="sg-btn" href={calLink} target="_blank" rel="noreferrer">{t.cal}</a>
            </div>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.gifts}</span></h2>
            <p className="sg-lead">{t.giftsText}</p>
            <div className="sg-bankcard">
              <div className="sg-card-pattern"></div>
              <span className="brand">Uzcard / Humo</span>
              <div className="chip"></div>
              <p className="num">4067 0700 0947 4359</p>
              <p className="holder">ERKINOV MOHIRBEK</p>
            </div>
            <button className={`sg-btn ${copied ? 'done' : ''}`} onClick={copyCard}>{copied ? t.copied : t.copy}</button>
          </div>
        </div>

        <div className="sg-card reveal" ref={addRef}>
          <div className="sg-card-inner">
            <h2 className="sg-title"><span>{t.rsvpT}</span></h2>
            <p className="sg-lead">{t.rsvpS}</p>
            <div className="sg-rsvp">
              <button className={`sg-btn ${rsvp === 'accept' ? 'on' : ''}`} onClick={() => handleRsvp('accept')}><span>{t.yes}</span><span className="cnt">{counts.accept}</span></button>
              <button className={`sg-btn ${rsvp === 'decline' ? 'on' : ''}`} onClick={() => handleRsvp('decline')}><span>{t.no}</span><span className="cnt">{counts.decline}</span></button>
            </div>
          </div>
        </div>

        <footer className="sg-footer">
          <span className="sg-sprig">&#10047;</span>
          Mohirbek &amp; Nilufarxon · 2026<br /><br />
          <a href="https://t.me/moxirbek_erkinov" target="_blank" rel="noreferrer">made with love</a>
        </footer>
      </div>
    </div>
  );
}