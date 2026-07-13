/* ============================================================
   site.js — renders the page from data/*.json
   To edit content, edit the JSON files. Never edit this file.
   ============================================================ */

const DATA = ['site','capabilities','achievements','people','bio','alumni','former','leaders','funders','contributions'];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

async function load(){
  const entries = await Promise.all(DATA.map(async n => {
    const r = await fetch(`data/${n}.json`);
    if(!r.ok) throw new Error(`data/${n}.json — ${r.status}`);
    return [n, await r.json()];
  }));
  return Object.fromEntries(entries);
}

/* ---------- renderers ---------- */

function renderChrome(d){
  const s = d.site;
  document.querySelectorAll('.brandName').forEach(e => e.textContent = s.groupName.toUpperCase());
  document.querySelectorAll('.siteEmail').forEach(e => { e.href = `mailto:${s.email}`; e.textContent = s.email; });
  const fl = document.getElementById('footerLine'); if(fl) fl.textContent = `${s.groupName} · ${s.institution} · ${s.location}`;
  const sb = document.getElementById('scholarBtn'); if(sb) sb.href = s.scholarUrl;
}
function renderHero(d){
  const s = d.site;
  const hh = document.getElementById('heroHeadline');
  if(hh) hh.innerHTML = `${esc(s.heroHeadline)}<br><span class="soft">${esc(s.heroHeadlineSoft)}</span>`;
  const hs = document.getElementById('heroSub'); if(hs) hs.textContent = s.heroSub;
  const bg = document.getElementById('heroBg');
  if(!bg) return;
  let i = 0;
  const set = n => {
    i = n;
    bg.style.backgroundImage = `url(${s.heroImages[n]})`;
    document.querySelectorAll('.hero-switch button').forEach((b,k)=>b.classList.toggle('on',k===n));
  };
  const sw = document.querySelector('.hero-switch');
  s.heroImages.forEach((_,n)=>{
    const b=document.createElement('button');
    b.onclick=()=>set(n); b.setAttribute('aria-label',`Hero image ${n+1}`);
    sw.appendChild(b);
  });
  set(0);
}

function renderCapabilities(caps){
  document.getElementById('caps').innerHTML = caps.map((c,i)=>`
    <details class="cap" data-cap="${i}">
      <summary><span class="cap-name">${esc(c.name)}</span><span class="cap-ico">+</span></summary>
      <div class="cap-body">
        <p class="cap-lede">${esc(c.lede)}</p>
        <div class="stats">${c.stats.map(([v,l])=>
          `<div class="stat"><div class="sv num-anim" data-stat="${esc(v)}" data-from="0" data-dec="${/\./.test(v)?1:0}">${esc(v)}</div><div class="sl">${esc(l)}</div></div>`).join('')}</div>
        <div class="cap-text">${c.body.map(b=>`<p>${esc(b)}</p>`).join('')}</div>
        ${renderContribs(c.key)}
      </div>
    </details>`).join('');
  // open one pillar at random on each load
  const caps_els = document.querySelectorAll('details.cap');
  if(caps_els.length) caps_els[Math.floor(Math.random()*caps_els.length)].open = true;
}

let CONTRIBS = [];
function renderContribs(key){
  const list = CONTRIBS.filter(c=>c.capability===key);
  if(!list.length) return '';
  return `<div class="contribs">
    <div class="contribs-lab">Selected contributions</div>
    ${list.map(c=>`
      <div class="contrib">
        ${c.image?`<div class="contrib-img"><img src="${esc(c.image)}" alt="${esc(c.title)}" loading="lazy"></div>`:''}
        <div class="contrib-body">
          <h5>${esc(c.title)}</h5>
          <p>${esc(c.text)}</p>
          ${c.citations?.length?`<ul class="cites">${c.citations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
        </div>
      </div>`).join('')}
  </div>`;
}

function renderAchievements(a){
  document.getElementById('timeline').innerHTML = a.map(x=>`
    <div class="tl-item">
      <div class="tl-year">${esc(x.year)}</div>
      <div class="tl-body">
        <div class="tl-venue">${esc(x.venue)}</div>
        <h4>${esc(x.title)}</h4>
        <p>${esc(x.text)}</p>
      </div>
    </div>`).join('');
}

function renderPeople(people, bio){
  // lead
  document.getElementById('bioShort').textContent = bio.short;
  document.getElementById('bioFull').innerHTML =
    bio.blocks.map(b=>`<div class="bio-block"><h5>${esc(b.h)}</h5>${b.p.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`).join('')
    + `<div class="bio-block"><h5>Distinctions</h5><ul class="awards">${bio.awards.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`
    + `<div class="bio-block"><h5>Fellowships and memberships</h5><ul class="awards">${bio.fellowships.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div>`;

  const tier = r => ({'Research Fellow':'Research Fellows','Staff Researcher':'Staff Researchers',
    'Postdoctoral Researcher':'Postdoctoral Researchers','PhD Student':'PhD Students',
    'Student':'Students','Visiting Scientist':'Visiting Scientists'}[r.split('·')[0].trim()] || r);
  const groups = {};
  people.forEach(p => (groups[tier(p.role)] ||= []).push(p));
  const order = ['Research Fellows','Staff Researchers','Postdoctoral Researchers','PhD Students','Students','Visiting Scientists'];

  document.getElementById('peopleTiers').innerHTML = order.filter(k=>groups[k]).map(k=>`
    <div class="ptier">
      <div class="ptier-lab">${esc(k)}</div>
      <div class="people-grid">${groups[k].map(p=>`
        <div class="person">
          <div class="av">${p.photo?`<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">`:''}</div>
          <div class="nm">${esc(p.name)}</div>
          <div class="rl">${esc(p.role)}</div>
          ${p.degree?`<div class="deg">${esc(p.degree)}</div>`:''}
          ${p.email?`<a class="eml" href="mailto:${esc(p.email)}">${esc(p.email)}</a>`:''}
        </div>`).join('')}</div>
    </div>`).join('');
}

function renderAlumni(alumni, former, leaders){
  document.getElementById('leadNum').textContent = '0';
  document.getElementById('leadNum').dataset.count = leaders.professorCount;
  document.getElementById('leadNum').dataset.from = 0;
  document.getElementById('leadNum').dataset.dec = 0;

  const row = ([n,i]) => `<div class="lead"><span class="lead-n">${esc(n)}</span><span class="lead-i">${esc(i)}</span></div>`;
  document.getElementById('leadAcademia').innerHTML = leaders.academia.map(row).join('');
  document.getElementById('leadIndustry').innerHTML = leaders.industry.map(row).join('');
  const lt = document.getElementById('leadTeams');
  if(lt) lt.innerHTML = (leaders.researchTeams || []).map(row).join('');

  document.getElementById('aluList').innerHTML = alumni.map(([y,n,r,t])=>`
    <div class="alu">
      <div class="alu-year">${esc(y)}</div>
      <div class="alu-main"><span class="alu-name">${esc(n)}</span>${r?` · <span class="alu-role">${esc(r)}</span>`:''}
        <div class="alu-thesis">${esc(t)}</div></div>
    </div>`).join('');

  const roles = {};
  former.forEach(([n,r]) => (roles[r] ||= []).push(n));
  const ord = [['Research Fellow','Research Fellows'],['Postdoctoral Researcher','Postdoctoral Researchers'],
               ['Student','Students'],['Visiting Scientist','Visiting Scientists'],['Sabbatical','Sabbatical visitors']];
  document.getElementById('formerList').innerHTML = ord.filter(([k])=>roles[k]).map(([k,l])=>`
    <div class="fm-block"><div class="fm-lab">${esc(l)}</div>
      <div class="fm-names">${roles[k].sort().map(n=>`<span class="fm">${esc(n)}</span>`).join('')}</div>
    </div>`).join('');
}

function renderFunders(f){
  document.getElementById('funders').innerHTML = f.map(x=>
    `<div class="funder"><img src="${esc(x.logo)}" alt="${esc(x.name)}" title="${esc(x.name)}" loading="lazy"></div>`).join('');
}

/* ---------- motion ---------- */

function animateNum(el){
  if(el.dataset.done) return; el.dataset.done = 1;
  const stat = el.dataset.stat || '';
  const dec = +(el.dataset.dec || 0);
  const m = stat.match(/[\d.]+/);
  const target = parseFloat(el.dataset.count !== undefined ? el.dataset.count : (m ? m[0] : NaN));
  const from = parseFloat(el.dataset.from || 0);
  if(isNaN(target)) return;
  const suffix = stat ? stat.replace(/^[\d.]+/,'') : '';
  if(reduce){ el.textContent = stat || target.toFixed(dec); return; }
  const dur = 1700, t0 = performance.now();
  (function step(now){
    const q = Math.min((now-t0)/dur, 1), e = 1-Math.pow(1-q,4);
    el.textContent = (from + (target-from)*e).toFixed(dec) + suffix;
    if(q < 1) requestAnimationFrame(step); else el.textContent = stat || target.toFixed(dec);
  })(t0);
}

function heroCanvas(){
  const cv = document.getElementById('wavecanvas'); if(!cv) return;
  const cx = cv.getContext('2d');
  let W,H,dpr,mx=.5,my=.5,sc=0;
  const size=()=>{dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);};
  size(); addEventListener('resize',size);
  addEventListener('mousemove',e=>{mx=e.clientX/innerWidth;my=e.clientY/innerHeight;});
  addEventListener('scroll',()=>{sc=scrollY/innerHeight;},{passive:true});
  function draw(t){
    if(scrollY < innerHeight*1.2){
      cx.clearRect(0,0,W,H);
      for(let r=0;r<6;r++){
        const yc=H*(0.16+r*0.135), phase=t*0.0006*(1+r*0.08)+r*0.9;
        const ec=0.32+mx*0.30-sc*0.12+0.05*Math.sin(t*0.0004+r);
        const key=(r===2||r===3), amp=key?42:26, alpha=key?0.55:0.20;
        cx.beginPath();
        for(let i=0;i<=340;i++){
          const u=i/340, x=u*W;
          const env=Math.exp(-Math.pow((u-ec)*3.4,2));
          const burst=Math.exp(-Math.pow((u-ec)*46,2))*Math.sin(u*150+phase*2)*0.55;
          cx[i?'lineTo':'moveTo'](x, yc + (Math.sin(u*30+phase)*env + burst)*amp*(0.35+my*0.5));
        }
        cx.strokeStyle=`rgba(110,155,203,${alpha})`; cx.lineWidth=key?1.5:1; cx.stroke();
        if(key){
          const bx=ec*W, g=cx.createRadialGradient(bx,yc,0,bx,yc,60);
          g.addColorStop(0,'rgba(210,121,63,.28)'); g.addColorStop(1,'rgba(210,121,63,0)');
          cx.fillStyle=g; cx.fillRect(bx-60,yc-60,120,120);
        }
      }
    }
    requestAnimationFrame(draw);
  }
  reduce ? draw(0) : requestAnimationFrame(draw);
}

function wireMotion(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll?.('.num-anim').forEach(animateNum);
    if(e.target.classList.contains('num-anim')) animateNum(e.target);
    io.unobserve(e.target);
  }),{threshold:.2});
  document.querySelectorAll('.rv,.tl-item,.num-anim').forEach(el=>io.observe(el));

  document.querySelectorAll('details.cap').forEach(d=>{
    const go=()=>d.open && d.querySelectorAll('.num-anim').forEach(animateNum);
    d.addEventListener('toggle',go); go();
  });

  const fill = document.getElementById('railfill');
  addEventListener('scroll',()=>{
    fill.style.height = (scrollY/(document.body.scrollHeight-innerHeight))*100 + '%';
  },{passive:true});
}

/* ---------- boot ---------- */
(async () => {
  try{
    const d = await load();
    CONTRIBS = d.contributions;
    const has = id => document.getElementById(id);
    renderChrome(d);
    renderHero(d);
    if(has('caps')) renderCapabilities(d.capabilities);
    if(has('timeline')) renderAchievements(d.achievements);
    if(has('peopleTiers')) renderPeople(d.people, d.bio);
    if(has('leadAcademia')) renderAlumni(d.alumni, d.former, d.leaders);
    if(has('funders')) renderFunders(d.funders);
    if(document.getElementById('heroBg')) heroCanvas();
    wireMotion();
  }catch(err){
    console.error(err);
    document.body.insertAdjacentHTML('afterbegin',
      `<div style="background:#3A1D1D;color:#F2C6C6;padding:14px;font:13px monospace">Failed to load site data: ${esc(err.message)}</div>`);
  }
})();
