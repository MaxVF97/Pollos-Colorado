(function(){
// ===== Datos del negocio =====
const WHATSAPP='523121438381';
const TEL_VISIBLE='312 143 8381';
const DIRECCION='Av. Benito Juárez 1000, Manuel Álvarez, Villa de Álvarez, Col.';
const MAPS='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Av. Benito Juárez 1000, Manuel Álvarez, Villa de Álvarez, Colima, México');
const LINK=location.origin+location.pathname;   // la dirección de la página, sea cual sea
const FACEBOOK='https://www.facebook.com/profile.php?id=61553411789368';
const INSTAGRAM='https://www.instagram.com/polloscolorado';

// Fotos: cada nombre apunta a un archivo .webp junto a index.html
const IMG=new Proxy({},{get:(_,k)=>`${String(k)}.webp`});

// ===== Productos agotados =====
// Se leen de una hoja de Google. Mientras SHEET_ID esté vacío, todo aparece disponible.
// La hoja debe llamarse "Agotados" y tener columnas: id | producto | agotado (casilla)
const SHEET_ID='';
const OFF=new Set();

// Acompañamientos y extras (lo que el dueño puede marcar como agotado)
const INSUMOS={arroz:'Arroz',salsa:'Salsa tradicional',salsasabor:'Salsa de sabor',tortillas:'Tortillas',cebollita:'Cebollita',chile:'Chile toreado',totopos:'Totopos',flautas:'Flautas',papas:'Papas',sopa:'Sopa de codito',ensalada:'Ensalada',frijoles:'Frijoles de la olla',limon:'Limón',coca15:'Refresco grande (1.5 L)',coca450:'Refresco chico (450 ml)'};
const SABORES=[['ajo','Ajo'],['teriyaki','Teriyaki'],['mangohab','Mango habanero'],['chipotle','Chipotle'],['bbq','BBQ']];
SABORES.forEach(([k,l])=>INSUMOS['ss-'+k]='Salsa de sabor: '+l);
const BASE=[['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['cebollita','Cebollita'],['chile','Chile toreado'],['totopos','Totopos']];
const MENU=[
 {id:'cuarto',sec:'pollos',n:'1/4 Pollo',p:75,img:'cuarto',inc:BASE},
 {id:'medio',sec:'pollos',n:'1/2 Pollo',p:125,img:'medio',inc:BASE},
 {id:'entero',sec:'pollos',n:'1 Pollo',p:235,img:'entero',inc:BASE},
 {id:'p1',sec:'paquetes',n:'Paquete 1',s:'1/4 de pollo',p:105,img:'p1',inc:[['','1/4 de pollo'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['flautas','3 flautas'],['coca450','Refresco chico'],['cebollita','Cebollita'],['chile','Chile']]},
 {id:'p2',sec:'paquetes',n:'Paquete 2',s:'1/2 de pollo',p:149,img:'p2',inc:[['','1/2 de pollo'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['papas','1/2 orden de papa'],['coca450','Refresco chico']]},
 {id:'p3',sec:'paquetes',n:'Paquete 3',s:'1 pollo',p:279,img:'p3',inc:[['','1 pollo'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['flautas','5 flautas'],['ensalada','Ensalada'],['coca15','1 refresco grande']]},
 {id:'p4',sec:'paquetes',n:'Paquete 4',s:'1 pollo y 1/2',p:365,img:'p4',inc:[['','1 pollo y 1/2'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['sopa','1 sopa de codito'],['papas','1 orden de papas']]},
 {id:'p5',sec:'paquetes',n:'Paquete 5',s:'3 pollos',p:695,img:'p5',inc:[['','3 pollos'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['coca15','2 refrescos grandes'],['cebollita','Cebollita'],['chile','Chile']]},
 {id:'viernes',sec:'viernes',n:'Promoción de viernes',s:'2 pollos',p:449,img:'viernes',inc:[['','2 pollos'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['coca15','1 refresco grande']]},
 {id:'arrachera',sec:'arrachera',n:'Arrachera texana',s:'Lo más premium del menú',p:320,img:'arrachera',inc:[['','1 kg de arrachera'],['frijoles','Frijoles de la olla'],['tortillas','Tortillas'],['salsa','Salsa'],['cebollita','Cebolla'],['chile','Chile toreado'],['limon','Limón']]},
 {id:'flautas',sec:'extras',n:'Flautas',d:'$8 c/u · cada 5 por $35',p:8,img:'flautas'},
 {id:'arroz',sec:'extras',n:'Arroz',d:'Orden',p:20,img:'arroz'},
 {id:'salsa',sec:'extras',n:'Salsa tradicional',d:'La de la casa',p:15,img:'salsa'},
 {id:'salsasabor',sec:'extras',n:'Salsa de sabor',d:'Ajo, teriyaki, mango habanero, chipotle o BBQ',p:25,ic:'bowl'},
 {id:'ensalada',sec:'extras',n:'Ensalada',d:'Orden',p:20,ic:'leaf'},
 {id:'papas',sec:'extras',n:'Papas cambray',d:'Orden',p:40,img:'papas'},
 {id:'sopa',sec:'extras',n:'Sopa de codito',d:'Orden',p:40,img:'sopa'},
 {id:'coca15',sec:'extras',n:'Coca-Cola 1.5 L',d:'Refresco grande',p:38,img:'coca15'},
 {id:'coca450',sec:'extras',n:'Coca-Cola 450 ml',d:'Refresco chico',p:25,img:'coca450'},
];
const byId=id=>MENU.find(m=>m.id===id);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>'$'+n.toLocaleString('es-MX');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function esViernes(){
  try{return new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',weekday:'short'}).format(new Date())==='Fri';}
  catch(e){return new Date().getDay()===5;}
}
const VIERNES=esViernes();
const disponible=m=>!OFF.has(m.id) && (m.id!=='viernes'||VIERNES);
const faltantes=m=>(m.inc||[]).filter(([k])=>k&&OFF.has(k)).map(([,l])=>l);
// Flautas: 5 por $35 y las sueltas a $8
const precio=(m,q)=>m.id==='flautas' ? Math.floor(q/5)*35+(q%5)*8 : m.p*q;
// "1 promo de 5 ($35) + 2 sueltas ($16)"
function desgloseFlautas(q){const g=Math.floor(q/5),r=q%5,p=[];
  if(g) p.push(`${g} ${g>1?'promos':'promo'} de 5 (${money(g*35)})`);
  if(r) p.push(`${r} ${r>1?'sueltas':'suelta'} (${money(r*8)})`);
  return p.join(' + ');}
const SAB=Object.fromEntries(SABORES);
const saborTxt=sab=>Object.entries(sab||{}).filter(([,n])=>n>0).map(([k,n])=>`${n} ${SAB[k]}`).join(', ');

// ===== Estado del cliente (sobrevive si la página se actualiza) =====
let CART=[], FORM={modo:'recoge',nombre:'',hora:'',calle:'',colonia:'',ref:'',tel:'',pago:'efectivo',cambio:'',coment:''};
try{const g=JSON.parse(sessionStorage.getItem('colorado')||'null'); if(g){CART=(g.cart||[]).filter(c=>byId(c.id)); Object.assign(FORM,g.form||{});}}catch(e){}
const guardar=()=>{try{sessionStorage.setItem('colorado',JSON.stringify({cart:CART,form:FORM}));}catch(e){}};

// ===== Íconos =====
const FLAMA='<svg width="34" height="40" viewBox="0 0 34 40" aria-hidden="true"><path fill="#F2711C" d="M17 1c2 7 9 10 11 18 2.6 10-4 20-11 20S3.4 32 6 22c1-4 3.5-6 4.5-10 2 3 2 6 1.5 8 3-2 6-9 5-19z"/><path fill="#120E0B" d="M17 22c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-6 .6 1.5.6 2.5.3 3.5 1.6-1 2.7-3.6 2.2-6.5z"/></svg>';
const IC={
 bottle:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2h4M10.5 2v3.5C8 7 7.5 8.5 7.5 10.5V20a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-9.5c0-2-.5-3.5-3-5V2"/><path d="M7.5 13h9"/></svg>',
 bowl:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3"/></svg>',
 leaf:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M4 20 13 11"/></svg>',
 fb:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z"/></svg>',
 ig:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
 pin:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>'
};

// ===== Pintar la carta =====
function enCarrito(id){return CART.filter(c=>c.id===id).reduce((a,c)=>a+c.q,0);}
function card(m,wide){
  const ok=disponible(m), sin=faltantes(m), n=enCarrito(m.id);
  const cerradoViernes=m.id==='viernes'&&!VIERNES&&!OFF.has(m.id);
  const sello=OFF.has(m.id)?'<span class="sello">Agotado</span>':(cerradoViernes?'<span class="sello" style="color:var(--ambar);border-color:var(--ambar)">Solo viernes</span>':'');
  return `<article class="card ${wide?'wide':''} ${ok?'':'off'}">
    <div class="ph" style="background-image:url(${IMG[m.img]})">${sello}<span class="precio">${money(m.p)}</span></div>
    <div class="body">
      <h3>${esc(m.n)}${m.s?`<small>${esc(m.s)}</small>`:''}</h3>
      <ul class="inc" aria-label="Incluye">${(m.inc||[]).map(([k,l])=>`<li class="${k&&OFF.has(k)?'sin':''}">${esc(l)}</li>`).join('')}</ul>
      ${sin.length&&ok?`<p class="nota-sin">Hoy sin ${esc(sin.join(', ').toLowerCase())}</p>`:''}
      ${cerradoViernes?'<p class="cerrado">Disponible cada viernes</p>':''}
      <button class="add" data-add="${m.id}" ${ok?'':'disabled aria-disabled="true"'}>${ok?'Agregar':(cerradoViernes?'Vuelve el viernes':'Agotado')}${n?`<span class="n">${n} en tu pedido</span>`:''}</button>
    </div></article>`;
}
function extra(m){
  const ok=disponible(m), n=enCarrito(m.id);
  const th=m.img?`style="background-image:url(${IMG[m.img]})"`:'';
  return `<button class="ex ${ok?'':'off'}" data-add="${m.id}" ${ok?'':'aria-disabled="true"'}>
    <span class="th" ${th}>${m.img?'':IC[m.ic]}</span>
    <span class="t"><b>${esc(m.n)}${ok?'':'<span class="tag">Agotado</span>'}</b><span>${esc(m.d)}${n?` · ${n} en tu pedido`:''}</span></span>
    <span class="pr">${money(m.p)}</span><span class="mas" aria-hidden="true">+</span></button>`;
}
function sec(id,titulo,sub,html){return `<section id="${id}"><div class="sec-h"><h2>${titulo}</h2><span class="rule"></span>${sub?`<p>${sub}</p>`:''}</div>${html}</section>`;}

function render(){
  const offList=[...OFF].map(k=>INSUMOS[k]||(byId(k)&&byId(k).n)).filter(Boolean);
  const chispas=Array.from({length:14},(_,i)=>`<i style="left:${(i*7.3+3)%100}%;animation-delay:${(i*0.43)%6}s;animation-duration:${5+(i%4)}s"></i>`).join('');
  $('#root').innerHTML=`
  <header class="top">
    <div class="wrap">
      <a class="marca" href="#inicio">${FLAMA}<span><b>COLORADO</b><small>POLLOS ASADOS</small></span></a>
      <a class="wa-mini" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
    <nav class="cats" aria-label="Categorías">
      <a href="#pollos">Pollos</a><a href="#paquetes">Paquetes</a><a href="#viernes">Promo viernes</a><a href="#arrachera">Arrachera</a><a href="#extras">Extras</a><a href="#ubicacion">Ubicación</a>
    </nav>
  </header>
  <div class="hero" id="inicio">
    <div class="bg" style="background-image:url(${IMG.alitas})"></div>
    <div class="chispas" aria-hidden="true">${chispas}</div>
    <div class="wrap">
      <span class="label">Pollos asados al carbón · Villa de Álvarez</span>
      <h1>Sabor que se comparte, <span>hecho al carbón</span></h1>
      <p>Arma tu pedido aquí, elige si pasas por él o te lo llevamos, y envíalo por WhatsApp.</p>
      ${VIERNES&&!OFF.has('viernes')?'<a class="viernes-hoy" href="#viernes">Hoy es viernes: 2 pollos con todo por $449</a>':''}
      ${offList.length?`<div class="aviso" role="status"><span><b>Hoy se terminó</b><br>${esc(offList.join(', '))}</span></div>`:''}
    </div>
  </div>
  <main class="wrap">
    ${sec('pollos','Pollos','Todos incluyen arroz, salsa, tortillas, cebollita, chile toreado y totopos.',`<div class="grid">${MENU.filter(m=>m.sec==='pollos').map(m=>card(m)).join('')}</div>`)}
    ${sec('paquetes','Paquetes','Para compartir en familia. En la nota puedes pedir el sabor de tu refresco.',`<div class="grid">${MENU.filter(m=>m.sec==='paquetes').map(m=>card(m)).join('')}</div>`)}
    ${sec('viernes','Promo de viernes',VIERNES?'Solo hoy.':'Se puede pedir únicamente los viernes.',card(byId('viernes'),true))}
    ${sec('arrachera','Arrachera texana','',card(byId('arrachera'),true))}
    ${sec('extras','Extras','Agrégalos a tu pedido.',`<div class="extras">${MENU.filter(m=>m.sec==='extras').map(extra).join('')}</div>`)}
    <div class="cinta">Sabor que se comparte <span>|</span> Hecho al carbón</div>
    <footer class="pie" id="ubicacion">
      <div class="bloque"><h4>Dónde estamos</h4>
        <p>${esc(DIRECCION)}</p>
        <div class="btns"><a class="pill or" href="${MAPS}" target="_blank" rel="noopener">${IC.pin} Abrir en Google Maps</a></div></div>
      <div class="bloque"><h4>Pedidos y dudas</h4>
        <div class="big">${TEL_VISIBLE}</div>
        <div class="btns" style="margin-top:8px"><a class="pill wa" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a><a class="pill" href="tel:+52${WHATSAPP.slice(2)}">Llamar</a></div></div>
      <div class="bloque"><h4>Comparte el menú</h4>
        <p>Mándalo a quien se le antoje un pollito.</p>
        <div class="btns"><a class="pill wa" href="https://wa.me/?text=${encodeURIComponent('Mira el menú de Pollos Colorado y haz tu pedido aquí: '+LINK)}" target="_blank" rel="noopener">Compartir por WhatsApp</a><button class="pill" id="copiar">Copiar enlace</button></div>
        <div class="link-share" id="linkTxt">${esc(LINK)}</div></div>
    </footer>
    <div class="redes">
      <h4>Síguenos en <span>redes</span></h4>
      <p>Promos del día, paquetes nuevos y lo que sale del carbón.</p>
      <div class="iconos">
        <a class="red" href="${FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook de Pollos Colorado"><span class="ic">${IC.fb}</span><span>Facebook<small>Pollos Colorado</small></span></a>
        <a class="red" href="${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram de Pollos Colorado"><span class="ic">${IC.ig}</span><span>Instagram<small>@polloscolorado</small></span></a>
      </div>
    </div>
  </main>
  <div class="bar"><button id="cartBtn"></button></div>
  <div class="veil" id="veil"><div class="sheet" id="sheet" role="dialog" aria-modal="true"></div></div>`;
  $$('[data-add]').forEach(b=>b.onclick=()=>{const m=byId(b.dataset.add); if(disponible(m)) abrirItem(m);});
  $('#cartBtn').onclick=abrirCarrito;
  $('#copiar').onclick=copiar;
  $('#veil').onclick=e=>{if(e.target.id==='veil')cerrar();};
  barra();
}
function copiar(){
  const b=$('#copiar');
  const ok=()=>{b.textContent='Enlace copiado';setTimeout(()=>b.textContent='Copiar enlace',2000);};
  try{navigator.clipboard.writeText(LINK).then(ok,sel);}catch(e){sel();}
  function sel(){const r=document.createRange();r.selectNodeContents($('#linkTxt'));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selecciónalo y cópialo';}
}

const total=()=>CART.reduce((a,c)=>a+precio(byId(c.id),c.q),0);
const piezas=()=>CART.reduce((a,c)=>a+c.q,0);
function barra(pulso){
  const b=$('#cartBtn'); b.disabled=!CART.length;
  b.innerHTML=CART.length?`<span>Ver mi pedido (${piezas()})</span><span class="tot">${money(total())}</span>`:'<span>Tu pedido está vacío</span><span></span>';
  if(pulso){b.classList.remove('pulso');void b.offsetWidth;b.classList.add('pulso');}
}

// ===== Hojas deslizables =====
function abrir(html){$('#sheet').innerHTML=html;$('#veil').classList.add('open');document.body.style.overflow='hidden';}
function cerrar(){$('#veil').classList.remove('open');document.body.style.overflow=''; if(pendiente){pendiente=false; refrescarCarta();}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar();});

function abrirItem(m,idx){
  const prev=idx!=null?CART[idx]:null;
  const esSalsa=m.id==='salsasabor', esFlauta=m.id==='flautas';
  let q=prev?prev.q:1;
  const sab=Object.assign({},prev&&prev.sab||{});
  const sumSab=()=>Object.values(sab).reduce((a,n)=>a+n,0);
  const sin=faltantes(m);
  abrir(`${m.img?`<div class="ph" style="background-image:url(${IMG[m.img]})${/^coca/.test(m.id)?';background-size:contain;background-color:#fff':''}"></div>`:''}
    <h3>${esc(m.n)}</h3>
    <p class="sub">${m.inc?'Incluye '+esc(m.inc.map(x=>x[1]).join(', ').toLowerCase()):(esSalsa?'$25 cada una. Elige cuántas quieres de cada sabor; puedes repetir el mismo.':esc(m.d))}</p>
    ${sin.length?`<p class="nota-sin" style="margin-top:8px">Hoy no tenemos ${esc(sin.join(', ').toLowerCase())}.</p>`:''}
    ${esSalsa?`<span class="f">Sabores</span><div class="sabores">${SABORES.map(([k,l])=>{const off=OFF.has('ss-'+k);
        return `<div class="sabor ${off?'off':''}"><span>${esc(l)}${off?'<span class="tag">Agotado</span>':''}</span>${off?'':`<div class="stepper"><button data-smn="${k}" aria-label="Menos ${esc(l)}">−</button><span data-sq="${k}">0</span><button data-spl="${k}" aria-label="Más ${esc(l)}">+</button></div>`}</div>`;}).join('')}</div>`
    :`<span class="f">Cantidad</span>
    <div class="stepper"><button id="mn" aria-label="Menos">−</button><span id="q"></span><button id="pl" aria-label="Más">+</button></div>`}
    ${esFlauta?'<p class="small" id="desg"></p><p class="small">Cada grupo de 5 flautas cuesta $35; las sueltas, $8 cada una.</p>':''}
    <label class="f" for="nota">¿Alguna indicación? <small>(opcional)</small></label>
    <textarea id="nota" placeholder="${esSalsa?'Ej. una de BBQ aparte':/^coca/.test(m.id)?'Ej. bien fría':m.inc&&m.inc.some(x=>/refresco/i.test(x[1]))?'Ej. refresco de manzana, salsa aparte':'Ej. sin cebollita, salsa aparte'}">${esc(prev?prev.nota:'')}</textarea>
    <div class="acts"><button class="btn ghost" id="x">Cancelar</button><button class="btn main" id="ok"></button></div>`);
  const sync=()=>{
    if(esSalsa){q=sumSab(); $$('[data-sq]').forEach(e=>e.textContent=sab[e.dataset.sq]||0);}
    else $('#q').textContent=q;
    if(esFlauta) $('#desg').textContent=q+' '+(q>1?'flautas':'flauta')+': '+desgloseFlautas(q);
    $('#ok').disabled=!q;
    $('#ok').textContent=!q?'Elige al menos un sabor':`${prev?'Guardar cambios':'Agregar'} · ${money(precio(m,q))}`;
  };
  if(esSalsa){
    $$('[data-spl]').forEach(b=>b.onclick=()=>{const k=b.dataset.spl; if(sumSab()<30){sab[k]=(sab[k]||0)+1;sync();}});
    $$('[data-smn]').forEach(b=>b.onclick=()=>{const k=b.dataset.smn; if(sab[k]){sab[k]--; if(!sab[k]) delete sab[k]; sync();}});
  } else {
    $('#mn').onclick=()=>{if(q>1){q--;sync();}};
    $('#pl').onclick=()=>{if(q<60){q++;sync();}};
  }
  $('#x').onclick=()=>{cerrar(); if(prev) abrirCarrito();};
  $('#ok').onclick=()=>{
    const nota=$('#nota').value.trim();
    if(prev){ CART[idx]=esSalsa?{id:m.id,q,nota,sab:{...sab}}:{id:m.id,q,nota}; }
    else if(esSalsa){ CART.push({id:m.id,q,nota,sab:{...sab}}); }
    else { const ya=CART.find(c=>c.id===m.id&&c.nota===nota); if(ya) ya.q+=q; else CART.push({id:m.id,q,nota}); }
    guardar(); cerrar(); const y=scrollY; render(); scrollTo(0,y); barra(true);
    if(prev) abrirCarrito();
  };
  sync();
}
function detalle(c){ // texto extra de una línea del pedido
  if(c.id==='salsasabor') return saborTxt(c.sab);
  if(c.id==='flautas') return desgloseFlautas(c.q);
  return '';
}

const hora12=h=>{if(!h)return'';let[H,M]=h.split(':').map(Number);const ap=H>=12?'pm':'am';H=H%12||12;return `${H}:${String(M).padStart(2,'0')} ${ap}`;};
// Margen mínimo: 15 min para recoger, 35 min a domicilio (hora de Colima / CDMX)
const MARGEN={recoge:15,domicilio:35};
function minutosAhora(){
  try{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Mexico_City',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    return +p.find(x=>x.type==='hour').value*60 + +p.find(x=>x.type==='minute').value;}
  catch(e){const d=new Date();return d.getHours()*60+d.getMinutes();}
}
const aHHMM=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const horaMinima=()=>minutosAhora()+MARGEN[FORM.modo];
function horaInvalida(){
  if(!FORM.hora) return '';
  const [H,M]=FORM.hora.split(':').map(Number), elegida=H*60+M, min=horaMinima();
  if(min>=24*60) return 'Para hoy ya no se puede programar; deja la hora vacía o escríbenos por WhatsApp.';
  if(elegida<min) return FORM.modo==='recoge'
    ? `Para recoger necesitamos al menos 15 min. Elige las ${hora12(aHHMM(min))} o más tarde.`
    : `A domicilio necesitamos al menos 35 min. Elige las ${hora12(aHHMM(min))} o más tarde.`;
  return '';
}
function faltaDato(){
  if(!CART.length) return 'Agrega algo a tu pedido.';
  if(!FORM.nombre.trim()) return FORM.modo==='recoge'?'Escribe el nombre para el pedido.':'Escribe tu nombre.';
  const hi=horaInvalida(); if(hi) return hi;
  if(FORM.modo==='domicilio'){
    if(!FORM.calle.trim()) return 'Escribe tu calle y número.';
    if(!FORM.colonia.trim()) return 'Escribe tu colonia.';
    if(FORM.tel.replace(/\D/g,'').length<10) return 'Escribe un teléfono de 10 dígitos para el repartidor.';
  }
  return '';
}
function mensaje(){
  const L=[]; const one=s=>s.trim().replace(/\s*\n\s*/g,', ');
  L.push('*NUEVO PEDIDO · POLLOS COLORADO*');
  L.push('');
  L.push(`*${FORM.modo==='recoge'?'Nombre del pedido':'Cliente'}:* ${one(FORM.nombre)||'—'}`);
  if(FORM.modo==='recoge'){
    L.push(`*Entrega:* Pasa a recoger ${FORM.hora?'a las '+hora12(FORM.hora):'lo antes posible'}`);
  } else {
    L.push(`*Entrega:* A DOMICILIO ${FORM.hora?'para las '+hora12(FORM.hora):'lo antes posible'}`);
    L.push(`*Dirección:* ${one(FORM.calle)||'—'}`);
    L.push(`*Colonia:* ${one(FORM.colonia)||'—'}`);
    if(FORM.ref.trim()) L.push(`*Referencias:* ${one(FORM.ref)}`);
    L.push(`*Teléfono:* ${FORM.tel.trim()||'—'}`);
  }
  L.push('');
  L.push('*PEDIDO*');
  CART.forEach(c=>{
    const m=byId(c.id);
    L.push(`${c.q} × ${m.n} — ${money(precio(m,c.q))}`);
    const sin=faltantes(m); if(sin.length) L.push(`   Sin ${sin.join(', ').toLowerCase()}`);
    const det=detalle(c); if(det) L.push(`   ${c.id==='salsasabor'?'Sabores':'Precio'}: ${det}`);
    if(c.nota) L.push(`   Nota: ${one(c.nota)}`);
  });
  L.push('');
  L.push(`*TOTAL: ${money(total())}*`);
  if(FORM.modo==='domicilio') L.push('Envío: por confirmar');
  L.push(`*Pago:* ${FORM.pago==='efectivo'?'Efectivo'+(FORM.cambio.trim()?', paga con $'+FORM.cambio.replace(/[^\d.]/g,''):''):'Transferencia'}`);
  if(FORM.coment.trim()) L.push(`*Comentarios:* ${one(FORM.coment)}`);
  return L.join('\n');
}
function abrirCarrito(){
  const lineas=CART.map((c,i)=>{const m=byId(c.id); const sin=faltantes(m);
    return `<div class="linea"><div class="t"><b>${esc(m.n)}</b>${m.s&&m.sec!=='pollos'?`<i>${esc(m.s)}</i>`:''}${detalle(c)?`<i>${esc(detalle(c))}</i>`:''}${c.nota?`<i>Nota: ${esc(c.nota)}</i>`:''}${sin.length?`<span class="w">Hoy sin ${esc(sin.join(', ').toLowerCase())}</span>`:''}</div>
      <div class="r"><strong>${money(precio(m,c.q))}</strong>${c.id==='salsasabor'?`<div class="mini"><button data-ed="${i}">Editar</button><button data-rm="${i}">Quitar</button></div>`:`<div class="stepper"><button data-mn="${i}" aria-label="Quitar uno">−</button><span>${c.q}</span><button data-pl="${i}" aria-label="Agregar uno">+</button></div>`}</div></div>`;}).join('');
  abrir(`<h3>Tu pedido</h3>
    ${lineas||'<p class="sub">Aún no agregas nada.</p>'}
    <div class="total"><span>Total</span><b>${money(total())}</b></div>
    <span class="f">¿Cómo lo quieres?</span>
    <div class="seg"><button class="opt" data-m="recoge"><b>Paso a recoger</b><span>En la sucursal</span></button><button class="opt" data-m="domicilio"><b>A domicilio</b><span>Envío por confirmar</span></button></div>
    <label class="f" for="fn" id="lblNombre"></label><input type="text" id="fn" autocomplete="name">
    <div id="boxDom">
      <label class="f" for="fc1">Calle y número</label><input type="text" id="fc1" autocomplete="street-address" placeholder="Ej. Av. Pablo Silva 245">
      <label class="f" for="fc2">Colonia</label><input type="text" id="fc2" placeholder="Ej. Centro">
      <label class="f" for="fr">Referencias <small>(opcional)</small></label><input type="text" id="fr" placeholder="Ej. casa azul, portón negro">
      <label class="f" for="ft">Teléfono para el repartidor</label><input type="tel" id="ft" autocomplete="tel" inputmode="tel" placeholder="10 dígitos">
    </div>
    <label class="f" for="fh" id="lblHora"></label><input type="time" id="fh"><p class="small" id="hint"></p>
    <span class="f">¿Cómo vas a pagar?</span>
    <div class="seg"><button class="opt" data-p="efectivo"><b>Efectivo</b><span>Al recibir</span></button><button class="opt" data-p="transferencia"><b>Transferencia</b><span>Te pasan los datos</span></button></div>
    <div id="boxCambio"><label class="f" for="fcb">¿Con cuánto pagas? <small>(opcional, para tu cambio)</small></label><input type="text" id="fcb" inputmode="numeric" placeholder="Ej. 500"></div>
    <label class="f" for="fco">Comentarios del pedido <small>(opcional)</small></label><textarea id="fco" placeholder="Ej. pollo bien doradito, sin picante para los niños"></textarea>
    <details class="prev"><summary>Ver el mensaje que se enviará</summary><div class="burbuja" id="pv"></div></details>
    <p class="falta" id="falta"></p>
    <div class="acts"><button class="btn ghost" id="x">Seguir viendo</button><a class="btn wa" id="send" href="#" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>
    <p class="small">Al tocar Enviar se abre WhatsApp con tu pedido ya escrito; solo presiona enviar. Pedidos al ${TEL_VISIBLE}.</p>`);
  const campos={fn:'nombre',fc1:'calle',fc2:'colonia',fr:'ref',ft:'tel',fh:'hora',fcb:'cambio',fco:'coment'};
  Object.entries(campos).forEach(([id,k])=>{const el=$('#'+id); el.value=FORM[k]; el.oninput=()=>{FORM[k]=el.value; act();};});
  $$('[data-m]').forEach(b=>b.onclick=()=>{FORM.modo=b.dataset.m;act();});
  $$('[data-p]').forEach(b=>b.onclick=()=>{FORM.pago=b.dataset.p;act();});
  $$('[data-mn]').forEach(b=>b.onclick=()=>{const c=CART[+b.dataset.mn]; c.q--; if(c.q<1) CART.splice(+b.dataset.mn,1); guardar(); refrescarTodo();});
  $$('[data-pl]').forEach(b=>b.onclick=()=>{CART[+b.dataset.pl].q++; guardar(); refrescarTodo();});
  $$('[data-rm]').forEach(b=>b.onclick=()=>{CART.splice(+b.dataset.rm,1); guardar(); refrescarTodo();});
  $$('[data-ed]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ed; cerrar(); abrirItem(byId(CART[i].id),i);});
  $('#x').onclick=cerrar;
  function act(){
    $$('[data-m]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===FORM.modo));
    $$('[data-p]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===FORM.pago));
    $('#boxDom').hidden=FORM.modo!=='domicilio';
    $('#boxCambio').hidden=FORM.pago!=='efectivo';
    $('#lblNombre').textContent=FORM.modo==='recoge'?'Nombre del cliente o del pedido':'Nombre de quien recibe';
    $('#lblHora').innerHTML=FORM.modo==='recoge'?'¿A qué hora pasas por él? <small>(opcional)</small>':'¿Para qué hora lo quieres? <small>(opcional)</small>';
    const mn=horaMinima();
    $('#fh').min=mn<24*60?aHHMM(mn):'';
    $('#hint').textContent=mn<24*60
      ? `Lo más pronto: ${hora12(aHHMM(mn))}. Si la dejas vacía, ${FORM.modo==='recoge'?'te lo tenemos listo':'te lo enviamos'} lo antes posible.`
      : 'Si la dejas vacía, lo preparamos lo antes posible.';
    $('#fh').style.borderColor=horaInvalida()?'var(--ambar)':'';
    const f=faltaDato(), s=$('#send');
    $('#pv').textContent=mensaje(); $('#falta').textContent=f;
    s.href='https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(mensaje());
    s.setAttribute('aria-disabled',f?'true':'false');
    guardar();
  }
  clearInterval(window.__reloj); window.__reloj=setInterval(()=>{ if($('#veil').classList.contains('open')&&$('#hint')) act(); else clearInterval(window.__reloj); },30000);
  $('#send').addEventListener('click',e=>{ act(); if(faltaDato()) e.preventDefault(); });
  function refrescarTodo(){const y=scrollY; render(); scrollTo(0,y); if(CART.length) abrirCarrito(); else cerrar();}
  act();
}

// ===== Leer agotados de Google Sheets =====
let pendiente=false;
function refrescarCarta(){
  if($('#veil')&&$('#veil').classList.contains('open')){pendiente=true;return;}   // no cerrar lo que el cliente está llenando
  const y=scrollY; render(); scrollTo(0,y);
}
async function cargarAgotados(){
  if(!SHEET_ID) return;
  try{
    const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Agotados&t=${Date.now()}`;
    const txt=await (await fetch(url)).text();
    const nuevos=new Set();
    txt.trim().split('\n').slice(1).forEach(linea=>{
      const [id,,agotado]=linea.split(',').map(c=>c.replace(/^"|"$/g,'').trim());
      if(id && /^(true|verdadero|si|sí|x|1)$/i.test(agotado)) nuevos.add(id);
    });
    if([...nuevos].sort().join()!==[...OFF].sort().join()){ OFF.clear(); nuevos.forEach(k=>OFF.add(k)); refrescarCarta(); }
  }catch(e){ /* sin conexión a la hoja: se muestra todo disponible */ }
}

render();
cargarAgotados();
setInterval(cargarAgotados,120000);                       // revisa cada 2 minutos
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) cargarAgotados(); });
})();
