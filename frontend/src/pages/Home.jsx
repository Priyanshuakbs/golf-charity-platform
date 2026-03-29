import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedCharities } from '../utils/api';

function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function FadeIn({ children, delay = 0, direction = 'up', style = {} }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  const translate = direction === 'up' ? 'translateY(40px)' : direction === 'left' ? 'translateX(-40px)' : 'translateX(40px)';
  return (
    <div ref={ref} style={{
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0)' : translate,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    getFeaturedCharities()
      .then((r) => {
        // Safely extract array from any response shape
        const raw = r?.data ?? r;
        const list = raw?.charities ?? raw?.data ?? raw;
        setCharities(Array.isArray(list) ? list : []);
      })
      .catch(() => setCharities([]))
      .finally(() => setLoadingCharities(false));

    const handleMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={{ background: '#080808', color: '#f0f0f0', fontFamily: 'inherit', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .hd { font-family: 'Playfair Display', serif; }
        .hb { font-family: 'DM Sans', sans-serif; }

        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pglow    { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .shimmer-text {
          background: linear-gradient(90deg,#fff 0%,#4ade80 40%,#fff 60%,#4ade80 100%);
          background-size: 200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation: shimmer 4s linear infinite;
        }
        .gc { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:20px; backdrop-filter:blur(12px); transition:all .4s ease; }
        .gc:hover { background:rgba(255,255,255,.06); border-color:rgba(74,222,128,.3); transform:translateY(-4px); box-shadow:0 20px 60px rgba(74,222,128,.08); }

        .hbtn-g { background:#4ade80; color:#080808; padding:14px 32px; border-radius:100px; font-weight:600; font-size:15px; display:inline-block; text-decoration:none; transition:all .3s ease; }
        .hbtn-g:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(74,222,128,.5); }

        .hbtn-o { background:transparent; color:#f0f0f0; padding:14px 32px; border-radius:100px; font-weight:500; font-size:15px; display:inline-block; text-decoration:none; border:1px solid rgba(255,255,255,.15); transition:all .3s ease; }
        .hbtn-o:hover { border-color:rgba(74,222,128,.5); color:#4ade80; }

        .tk-wrap { overflow:hidden; white-space:nowrap; }
        .tk { display:inline-block; animation:ticker 22s linear infinite; }
        .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }

        .cc { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:20px; padding:24px; text-decoration:none; display:flex; flex-direction:column; transition:all .4s cubic-bezier(.175,.885,.32,1.275); position:relative; overflow:hidden; color:inherit; }
        .cc:hover { border-color:rgba(74,222,128,.25); transform:translateY(-6px) scale(1.01); box-shadow:0 24px 60px rgba(0,0,0,.4); }

        .pc { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:24px; padding:36px; transition:all .4s ease; position:relative; }
        .pc.feat { background:rgba(74,222,128,.05); border-color:rgba(74,222,128,.3); }
        .pc:hover { transform:translateY(-4px); }

        .dl { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08) 30%,rgba(74,222,128,.2) 50%,rgba(255,255,255,.08) 70%,transparent); }

        @media(max-width:768px){
          .g3,.g4 { grid-template-columns:1fr!important; }
          .g2 { grid-template-columns:1fr!important; }
          .hero-h { font-size:clamp(44px,12vw,72px)!important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'120px 24px 80px', overflow:'hidden' }}>
        <div className="orb" style={{ width:700, height:700, background:'radial-gradient(circle,rgba(74,222,128,.12) 0%,transparent 70%)', top:'5%', left:`${mousePos.x*25-5}%`, transition:'left 2.5s ease' }} />
        <div className="orb" style={{ width:500, height:500, background:'radial-gradient(circle,rgba(34,211,238,.07) 0%,transparent 70%)', bottom:'10%', right:`${(1-mousePos.x)*20+5}%`, transition:'right 2s ease' }} />
        <div className="orb" style={{ width:300, height:300, background:'radial-gradient(circle,rgba(250,204,21,.05) 0%,transparent 70%)', top:'40%', left:'55%' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:10, textAlign:'center', maxWidth:820, width:'100%' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.2)', borderRadius:100, padding:'8px 18px', marginBottom:36, animation:'floatY 4s ease-in-out infinite' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pglow 2s ease-in-out infinite' }} />
            <span className="hb" style={{ fontSize:11, color:'#4ade80', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase' }}>Golf · Charity · Community</span>
          </div>

          <h1 className="hd hero-h" style={{ fontSize:'clamp(52px,9vw,96px)', fontWeight:900, lineHeight:1.0, marginBottom:28, letterSpacing:'-0.02em' }}>
            Every Swing<br />
            <span className="shimmer-text">Creates Change</span>
          </h1>

          <p className="hb" style={{ color:'rgba(255,255,255,.45)', fontSize:18, maxWidth:540, margin:'0 auto 48px', lineHeight:1.75, fontWeight:300 }}>
            Track your Stableford scores, enter monthly prize draws, and donate to the charity you love — all in one platform.
          </p>

          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginBottom:72 }}>
            <Link to="/register" className="hbtn-g hb">Get Started — Free ↗</Link>
            <Link to="/charities" className="hbtn-o hb">Browse Charities</Link>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, maxWidth:440, margin:'0 auto' }}>
            {[{value:'£9.99',label:'per month',color:'#4ade80'},{value:'10%+',label:'to charity',color:'#22d3ee'},{value:'5',label:'score draws',color:'#facc15'}].map(({value,label,color})=>(
              <div key={label} style={{ textAlign:'center' }}>
                <p className="hd" style={{ fontSize:28, fontWeight:700, color }}>{value}</p>
                <p className="hb" style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity:0.25 }}>
          <span className="hb" style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' }}>Scroll</span>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom,rgba(255,255,255,.4),transparent)' }} />
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'16px 0', overflow:'hidden', background:'rgba(74,222,128,.025)' }}>
        <div className="tk-wrap">
          <div className="tk hb" style={{ fontSize:12, color:'rgba(255,255,255,.28)', fontWeight:500, letterSpacing:'0.1em' }}>
            {Array(2).fill(['⛳ MONTHLY PRIZE DRAWS','·','🏆 WIN UP TO 40% OF THE POOL','·','❤️ DONATE TO CHARITY','·','📊 TRACK YOUR SCORES','·','🎯 STABLEFORD SYSTEM','·','💷 FROM JUST £9.99/MONTH','·']).flat().map((t,i)=>(
              <span key={i} style={{ marginRight:36, color:t==='·'?'rgba(74,222,128,.5)':undefined }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding:'120px 24px', maxWidth:1100, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <p className="hb" style={{ fontSize:11, color:'#4ade80', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>Simple as 1-2-3</p>
            <h2 className="hd" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:700, letterSpacing:'-0.02em' }}>How GolfGives Works</h2>
          </div>
        </FadeIn>
        <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {[
            {step:'01',icon:'🏌️',title:'Subscribe & Choose',desc:'Pick a plan, then select the charity you want to support from our verified UK partners.'},
            {step:'02',icon:'⛳',title:'Track Your Scores',desc:'Log your Stableford scores after each round. Your 5 latest scores become your draw numbers.'},
            {step:'03',icon:'🏆',title:'Win & Give Back',desc:'Match 3, 4, or all 5 numbers in the monthly draw. Win prizes up to 40% of the pool.'}
          ].map(({step,icon,title,desc},i)=>(
            <FadeIn key={step} delay={i*0.15}>
              <div className="gc" style={{ padding:'36px 28px', position:'relative', height:'100%', boxSizing:'border-box' }}>
                <span className="hd" style={{ position:'absolute', top:-8, right:16, fontSize:80, fontWeight:900, color:'rgba(255,255,255,.04)', lineHeight:1 }}>{step}</span>
                <div style={{ fontSize:36, marginBottom:20 }}>{icon}</div>
                <h3 className="hd" style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>{title}</h3>
                <p className="hb" style={{ color:'rgba(255,255,255,.4)', fontSize:14, lineHeight:1.8, fontWeight:300 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <div className="dl" style={{ maxWidth:1100, margin:'0 auto' }} />
      <PrizeSection />
      <div className="dl" style={{ maxWidth:1100, margin:'0 auto' }} />

      {/* ══ FEATURED CHARITIES ══ */}
      <section style={{ padding:'120px 24px', maxWidth:1200, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:64, flexWrap:'wrap', gap:16 }}>
            <div>
              <p className="hb" style={{ fontSize:11, color:'#4ade80', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:12 }}>Make a difference</p>
              <h2 className="hd" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:700, letterSpacing:'-0.02em' }}>Featured Charities</h2>
            </div>
            <Link to="/charities" className="hbtn-o hb" style={{ fontSize:14, padding:'10px 24px' }}>View all →</Link>
          </div>
        </FadeIn>

        {loadingCharities ? (
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[1,2,3].map(i=><div key={i} style={{ height:180, background:'rgba(255,255,255,.03)', borderRadius:20, animation:'pglow 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : charities.length === 0 ? (
          <div className="gc" style={{ padding:64, textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,.3)' }}>Charities coming soon!</p>
          </div>
        ) : (
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {charities.slice(0, 6).map((c, i) => (
              <FadeIn key={c._id} delay={i*0.08}>
                <Link to={`/charities/${c.slug ?? c._id}`} className="cc">
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'rgba(74,222,128,.1)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#4ade80', border:'1px solid rgba(74,222,128,.15)' }}>
                      {c.logo ? <img src={c.logo} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : c.name?.[0]}
                    </div>
                    <div>
                      <h3 className="hd" style={{ fontSize:15, fontWeight:700, marginBottom:3, color:'#f0f0f0' }}>{c.name}</h3>
                      <span className="hb" style={{ fontSize:11, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{c.category}</span>
                    </div>
                  </div>
                  <p className="hb" style={{ color:'rgba(255,255,255,.4)', fontSize:13, lineHeight:1.7, flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {c.shortDescription || c.description}
                  </p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16 }}>
                    <span className="hb" style={{ fontSize:11, color:'rgba(255,255,255,.22)' }}>{c.subscriberCount ?? 0} supporters</span>
                    <span style={{ fontSize:12, color:'#4ade80', fontWeight:600 }}>Support →</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <div className="dl" style={{ maxWidth:1200, margin:'0 auto' }} />

      {/* ══ PRICING ══ */}
      <section style={{ padding:'120px 24px', maxWidth:860, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <p className="hb" style={{ fontSize:11, color:'#4ade80', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>Transparent Pricing</p>
            <h2 className="hd" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:16 }}>Simple Plans</h2>
            <p className="hb" style={{ color:'rgba(255,255,255,.4)', fontSize:16, fontWeight:300 }}>No hidden fees. Cancel anytime. Every penny tracked.</p>
          </div>
        </FadeIn>
        <div className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          {[
            {name:'Monthly',price:'£9.99',period:'/month',save:null,feat:false},
            {name:'Yearly',price:'£99',period:'/year',save:'Save £20',feat:true}
          ].map(({name,price,period,save,feat},i)=>(
            <FadeIn key={name} delay={i*0.15}>
              <div className={`pc${feat?' feat':''}`}>
                {feat && <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'#4ade80', color:'#080808', fontSize:11, fontWeight:700, padding:'5px 18px', borderRadius:100, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Best Value</div>}
                <div style={{ marginBottom:8 }}>
                  <span className="hd" style={{ fontSize:18, fontWeight:700 }}>{name}</span>
                  {save && <span style={{ marginLeft:10, fontSize:11, background:'rgba(74,222,128,.12)', color:'#4ade80', padding:'3px 10px', borderRadius:100, fontWeight:600 }}>{save}</span>}
                </div>
                <div style={{ marginBottom:28 }}>
                  <span className="hd" style={{ fontSize:52, fontWeight:900, letterSpacing:'-0.03em' }}>{price}</span>
                  <span className="hb" style={{ fontSize:14, color:'rgba(255,255,255,.3)', fontWeight:300 }}>{period}</span>
                </div>
                {['Monthly prize draw entry','Score tracking (5 scores)','Charity donation (10%+)','Full draw results access','Manage via dashboard'].map(f=>(
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(74,222,128,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, color:'#4ade80' }}>✓</div>
                    <span className="hb" style={{ fontSize:14, color:'rgba(255,255,255,.55)', fontWeight:300 }}>{f}</span>
                  </div>
                ))}
                <Link to="/register" className={feat ? 'hbtn-g' : 'hbtn-o'} style={{ display:'block', textAlign:'center', marginTop:28, padding:'14px 24px', borderRadius:14 }}>Get Started</Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding:'140px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(74,222,128,.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
        <FadeIn>
          <div style={{ position:'relative', zIndex:10, maxWidth:640, margin:'0 auto' }}>
            <div style={{ fontSize:52, marginBottom:24 }}>⛳</div>
            <h2 className="hd" style={{ fontSize:'clamp(36px,6vw,64px)', fontWeight:900, letterSpacing:'-0.02em', marginBottom:20, lineHeight:1.1 }}>Ready to Give Back?</h2>
            <p className="hb" style={{ color:'rgba(255,255,255,.4)', fontSize:17, marginBottom:44, lineHeight:1.7, fontWeight:300 }}>
              Join golfers across the UK turning their passion into real change for the causes that matter most.
            </p>
            <Link to="/register" className="hbtn-g hb" style={{ fontSize:16, padding:'16px 42px' }}>Start Today — £9.99/month</Link>
            <p className="hb" style={{ fontSize:12, color:'rgba(255,255,255,.2)', marginTop:16 }}>No commitment · Cancel anytime · Secure via Stripe</p>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}

function PrizeSection() {
  const ref = useRef(null);
  const visible = useInView(ref, 0.2);
  const prizes = [
    {pct:40,label:'Jackpot',sublabel:'5 Match',color:'#facc15',w:'80%'},
    {pct:25,label:'Major Prize',sublabel:'4 Match',color:'#4ade80',w:'50%'},
    {pct:15,label:'3 Match',sublabel:'Prize',color:'#22d3ee',w:'30%'},
    {pct:10,label:'Charity',sublabel:'Minimum',color:'#a78bfa',w:'20%'},
  ];
  return (
    <section style={{ padding:'120px 24px', maxWidth:1100, margin:'0 auto' }} ref={ref}>
      <FadeIn>
        <div style={{ textAlign:'center', marginBottom:72 }}>
          <p className="hb" style={{ fontSize:11, color:'#4ade80', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:16 }}>Monthly Prize Draw</p>
          <h2 className="hd" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:16 }}>How Prizes Are Split</h2>
          <p className="hb" style={{ color:'rgba(255,255,255,.4)', fontSize:15, fontWeight:300 }}>Every subscription fee is split transparently across prizes and charity.</p>
        </div>
      </FadeIn>
      <div className="g4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:60 }}>
        {prizes.map(({pct,label,sublabel,color},i)=>(
          <FadeIn key={label} delay={i*0.1}>
            <div className="gc" style={{ padding:'32px 24px', textAlign:'center' }}>
              <p className="hd" style={{ fontSize:52, fontWeight:900, color, marginBottom:6, letterSpacing:'-0.03em' }}>{pct}%</p>
              <p className="hd" style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{label}</p>
              <p className="hb" style={{ fontSize:11, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{sublabel}</p>
            </div>
          </FadeIn>
        ))}
      </div>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        {prizes.map(({pct,label,color,w},i)=>(
          <div key={label} style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18 }}>
            <span className="hb" style={{ width:90, fontSize:13, color:'rgba(255,255,255,.35)', textAlign:'right', flexShrink:0 }}>{label}</span>
            <div style={{ flex:1, height:6, background:'rgba(255,255,255,.05)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg,${color},${color}77)`, width:w, transform:visible?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:`transform 1.2s cubic-bezier(.65,0,.35,1) ${i*.15}s` }} />
            </div>
            <span className="hb" style={{ width:36, fontSize:13, color, fontWeight:600 }}>{pct}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}