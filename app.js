(function(){
// =====================================================================
//  POLLOS COLORADO · Menú y pedidos por WhatsApp
// =====================================================================

// ===== Datos del negocio =====
const WHATSAPP='523121438381';
const TEL_VISIBLE='312 143 8381';
const DIRECCION='Av. Benito Juárez 1000, Manuel Álvarez, Villa de Álvarez, Col.';
const MAPS='https://maps.app.goo.gl/KAZmRpTcCDtGrvFC7';
const LINK=location.origin+location.pathname;   // la dirección de la página, sea cual sea
const FACEBOOK='https://www.facebook.com/profile.php?id=61553411789368';
const INSTAGRAM='https://www.instagram.com/polloscolorado';

// Datos para transferencia (se muestran solo si el cliente elige "Transferencia")
const BANCO={banco:'BBVA',tarjeta:'4152 3143 0565 8604',titular:'Juan Humberto Franco Colorado'};

// ===== Horario =====
// Días: 0 domingo, 1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes, 6 sábado
const ABRE=9*60;          // 9:00 am
const CIERRA=18*60;       // 6:00 pm
// Servicio de pedidos: entregas desde las 12:15 pm, pedidos hasta las 5:15 pm
const SERV_INI=12*60+15;  // 12:15 pm: primera hora de entrega o recogida
const ULTIMO_PEDIDO=17*60+15;  // 5:15 pm: último pedido del día (recoger y domicilio)
const DESCANSO=[2];       // martes
// Tiempo mínimo para tener listo el pedido (minutos)
const MARGEN={recoge:15,domicilio:35};
// Hora pico (solo para avisar al cliente)
const PICO=[14*60,15*60+30];
// Último pedido del día y última hora que se puede programar (último pedido + su margen)
const ULTIMO={recoge:ULTIMO_PEDIDO, domicilio:ULTIMO_PEDIDO};
// Costillas y arrachera tardan 30–45 min: con carne el mínimo sube a 30 min (recoger) y 65 min (domicilio)
const CARNES=['costillas','arrachera'];
const CARNE_MIN={recoge:30,domicilio:50};
const hayCarne=()=>CART.some(c=>CARNES.includes(c.id));
const margen=m=>hayCarne()?CARNE_MIN[m]:MARGEN[m];
const HORA_MAX=m=>Math.min(ULTIMO_PEDIDO+margen(m),CIERRA);   // sin carne: recoger 5:30 pm · domicilio 5:50 pm

// ===== Entregas =====
const CIUDADES=['Colima','Villa de Álvarez','Coquimatlán'];
const ENVIO='$35 a $60 según la zona';

// Fotos: cada nombre apunta a un archivo .webp junto a index.html
const IMG=new Proxy({},{get:(_,k)=>`${String(k)}.webp`});

// ===== Productos agotados =====
// Se leen de una hoja de Google. Mientras SHEET_ID esté vacío, todo aparece disponible.
// La hoja debe llamarse "Agotados" y tener columnas: id | producto | agotado (casilla)
const SHEET_ID='1ih7P7BB9gkJPP0YDpSOQluiEVkKbgMtFrK_Clnch8uc';   // hoja de PRUEBA de Max (cambiar por la del dueño)
const OFF=new Set();

// ===== Sabores del pollo =====
// Cada medio pollo incluye un sabor. En 1/4 de pollo el sabor cuesta $25 extra.
// [id, nombre, descripción, tipo de sabor] · tipo: salado | p1 | p2 | p3 (picor) | dulce | agridulce
const SABORES=[
 ['adobado','Adobado','El tradicional al carbón','salado'],
 ['ajo','Ajo','Intenso y doradito','salado'],
 ['chimichurri','Chimichurri','Cremoso y especiado','salado'],
 ['jalapeno','Jalapeño','Cremoso, picante suave','p1'],
 ['chipotle','Chipotle','Ahumado, con picor delicioso','p2'],
 ['diabla','Diabla','Picante intenso','p3'],
 ['habanero','Habanero','Para los que aguantan','p3'],
 ['bbq','BBQ','Dulce y ahumado (el favorito)','dulce'],
 ['teriyaki','Teriyaki','Dulce, estilo oriental','dulce'],
 ['pina','Piña','Dulce tropical','dulce'],
 ['tamarindo','Tamarindo','Agridulce','agridulce'],
];
// Íconos de nivel de sabor
const IC_SAB={
 flama:'<svg class="ic-flama" width="16" height="20" viewBox="0 0 34 40" aria-hidden="true"><path fill="#F2711C" d="M17 1c2 7 9 10 11 18 2.6 10-4 20-11 20S3.4 32 6 22c1-4 3.5-6 4.5-10 2 3 2 6 1.5 8 3-2 6-9 5-19z"/><path fill="#FFC15E" d="M17 22c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-6 .6 1.5.6 2.5.3 3.5 1.6-1 2.7-3.6 2.2-6.5z"/></svg>',
 dulce:'<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><g stroke=\"#B97A0E\" stroke-width=\".7\" stroke-linejoin=\"round\"><path fill=\"#FFC85A\" d=\"M12.00 14.95L9.45 13.47L9.45 10.53L12.00 9.05L14.55 10.52L14.55 13.47z\"/><path fill=\"#F5B83D\" d=\"M17.72 14.95L15.16 13.47L15.16 10.53L17.72 9.05L20.27 10.52L20.27 13.47z\"/><path fill=\"#E9A426\" d=\"M14.86 19.90L12.30 18.42L12.30 15.47L14.86 14.00L17.41 15.47L17.41 18.43z\"/><path fill=\"#F5B83D\" d=\"M9.14 19.90L6.59 18.42L6.59 15.47L9.14 14.00L11.70 15.47L11.70 18.43z\"/><path fill=\"#FFC85A\" d=\"M6.28 14.95L3.73 13.47L3.73 10.53L6.28 9.05L8.84 10.52L8.84 13.47z\"/><path fill=\"#E9A426\" d=\"M9.14 10.00L6.59 8.53L6.59 5.58L9.14 4.10L11.70 5.58L11.70 8.53z\"/><path fill=\"#F5B83D\" d=\"M14.86 10.00L12.30 8.53L12.30 5.58L14.86 4.10L17.41 5.57L17.41 8.53z\"/></g><path fill=\"#FFE7A3\" d=\"M11.40 12.20L10.45 11.65L10.45 10.55L11.40 10.00L12.35 10.55L12.35 11.65z\"/></svg>',
 acido:'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#9BD14B"/><circle cx="12" cy="12" r="7.6" fill="#E3F7B8"/><g stroke="#9BD14B" stroke-width="1.4" stroke-linecap="round"><path d="M12 5.5v13M5.5 12h13M7.4 7.4l9.2 9.2M16.6 7.4l-9.2 9.2"/></g><circle cx="12" cy="12" r="1.3" fill="#9BD14B"/></svg>',
 salado:'<svg width="20" height="22" viewBox="3 1 16 22" aria-hidden="true"><path fill="#D9D2C7" d="M8 9h8l1 11.2a1.6 1.6 0 0 1-1.6 1.8H8.6A1.6 1.6 0 0 1 7 20.2z"/><path fill="#B8AFA2" d="M8.2 5.5h7.6a1 1 0 0 1 1 1V9H7.2V6.5a1 1 0 0 1 1-1z"/><g fill="#6E655A"><circle cx="10" cy="7.2" r=".6"/><circle cx="12" cy="7.2" r=".6"/><circle cx="14" cy="7.2" r=".6"/></g><g fill="#fff"><circle cx="5" cy="3.5" r=".7"/><circle cx="7" cy="2" r=".5"/><circle cx="4" cy="1.6" r=".5"/></g></svg>'
};
const nivelSabor=t=>{
  if(/^p\d$/.test(t)){const n=+t[1]; return `<span class="nivel ${n===3?'fuego':''}" title="Picor ${n} de 3">${IC_SAB.flama.repeat(n)}</span>`;}
  if(t==='dulce') return `<span class="nivel" title="Dulce">${IC_SAB.dulce}</span>`;
  if(t==='agridulce') return `<span class="nivel" title="Agridulce">${IC_SAB.dulce}${IC_SAB.acido}</span>`;
  return `<span class="nivel" title="Salado">${IC_SAB.salado}</span>`;
};
const SABOR_EXTRA=25;
const REFRESCOS=[['coca15','Coca-Cola',''],['sidral15','Sidral Mundet','']];

// Lo que el dueño puede marcar como agotado en la hoja
const CORTES={'Pierna y muslo':'pza-piernamuslo','Ala y pechuga':'pza-alapechuga'};
const INSUMOS={pollo:'Pollo','pza-piernamuslo':'Pierna y muslo','pza-alapechuga':'Ala y pechuga',arroz:'Arroz',salsa:'Salsa tradicional',tortillas:'Tortillas',cebollita:'Cebollita',chile:'Chile toreado',totopos:'Totopos',flautas:'Flautas',papas:'Papas',sopa:'Sopa de codito',ensalada:'Ensalada',frijoles:'Frijoles de la olla',limon:'Limón',coca15:'Coca-Cola 1.5 L',sidral15:'Sidral Mundet 1.5 L',coca450:'Coca-Cola 450 ml'};
SABORES.forEach(([k,l])=>INSUMOS['sab-'+k]='Sabor '+l);
// Disponibilidad de una opción o insumo ("ref15" = cualquier refresco grande)
const apagado=k=>k==='ref15' ? (OFF.has('coca15')&&OFF.has('sidral15')) : OFF.has(k);
const disponibleOp=(g,k)=>!apagado(g.pref+k);

// Grupos de elección dentro de un producto
//  exacto:   hay que elegir exactamente "por" opciones por cada unidad (ej. 1 sabor por medio pollo)
//  opcional: se puede elegir hasta "por" opciones por unidad, cada una con costo extra
//  cantidad: la cantidad del producto es la suma de lo elegido (salsas de sabor)
// Sabor por pieza de pollo, sin costo:
//  pollo → completo de un sabor, o mitad y mitad (dos sabores)
//  medio y cuarto → un sabor
const gSab=piezas=>({k:'sab',t:'Sabor de tu pollo',ops:SABORES,pref:'sab-',tipo:'piezas',piezas});
// Sabor extra o doble: se suma a los incluidos, $25 cada uno
// Costillas: el sabor no va incluido, se agrega como extra
const gSabCostilla={k:'extra',t:'¿Le pones sabor?',ops:SABORES,pref:'sab-',tipo:'multi',precio:SABOR_EXTRA,etiqueta:'Sabor',boton:'+ Agregar sabor a tus costillas',ayuda:`Las costillas no incluyen sabor. Opcional, +$${SABOR_EXTRA} cada uno.`};
const gExtra={k:'extra',t:'¿Sabor extra o doble?',ops:SABORES,pref:'sab-',tipo:'multi',precio:SABOR_EXTRA,ayuda:`Opcional, +$${SABOR_EXTRA} cada uno. Para doble, elige el mismo sabor que arriba.`};
const gRef=n=>({k:'ref',t:n>1?'Refrescos grandes':'Refresco grande',ops:REFRESCOS,pref:'',tipo:'exacto',por:n,ayuda:n>1?`Elige ${n} refrescos de 1.5 L.`:'Refresco de 1.5 L.',slot:'Refresco'});

const BASE=[['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['cebollita','Cebollita'],['chile','Chile toreado'],['totopos','Totopos']];
const MENU=[
 {id:'cuarto',base:'pollo',sec:'pollos',n:'1/4 Pollo',p:75,img:'cuarto',inc:BASE,g:[gSab(['cuarto']),gExtra]},
 {id:'medio',base:'pollo',sec:'pollos',n:'1/2 Pollo',p:125,img:'medio',inc:BASE,g:[gSab(['medio']),gExtra]},
 {id:'entero',base:'pollo',sec:'pollos',n:'1 Pollo',p:235,img:'entero',inc:BASE,g:[gSab(['pollo']),gExtra]},
 {id:'p1',base:'pollo',sec:'paquetes',n:'Paquete 1',s:'1/4 de pollo',p:105,img:'p1',inc:[['','1/4 de pollo'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['flautas','3 flautas'],['coca450','Coca-Cola chica'],['cebollita','Cebollita'],['chile','Chile']],g:[gSab(['cuarto']),gExtra]},
 {id:'p2',base:'pollo',sec:'paquetes',n:'Paquete 2',s:'1/2 de pollo',p:149,img:'medio',inc:[['','1/2 de pollo'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['papas','1/2 orden de papa'],['coca450','Coca-Cola chica']],g:[gSab(['medio']),gExtra]},
 {id:'p3',base:'pollo',sec:'paquetes',n:'Paquete 3',s:'1 pollo',p:279,img:'p3',inc:[['','1 pollo'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['flautas','5 flautas'],['ensalada','Ensalada'],['ref15','1 refresco grande']],g:[gSab(['pollo']),gExtra,gRef(1)]},
 {id:'p4',base:'pollo',sec:'paquetes',n:'Paquete 4',s:'1 pollo y 1/2',p:365,img:'p4',inc:[['','1 pollo y 1/2'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['sopa','1 sopa de codito'],['papas','1 orden de papas']],g:[gSab(['pollo','medio']),gExtra]},
 {id:'p5',base:'pollo',sec:'paquetes',n:'Paquete 5',s:'3 pollos',p:695,img:'p5',inc:[['','3 pollos'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['ref15','2 refrescos grandes'],['cebollita','Cebollita'],['chile','Chile']],g:[gSab(['pollo','pollo','pollo']),gExtra,gRef(2)]},
 {id:'viernes',base:'pollo',sec:'viernes',n:'Promoción de viernes',s:'2 pollos',p:449,img:'viernes',inc:[['','2 pollos'],['arroz','Arroz'],['salsa','Salsa'],['tortillas','Tortillas'],['ref15','1 refresco grande']],g:[gSab(['pollo','pollo']),gExtra,gRef(1)]},
 {id:'costillas',sec:'costillas',n:'Costillas',s:'1 kg de costilla',p:290,media:150,img:'costillas',inc:[['','1 kg de costilla'],['tortillas','Tortillas'],['salsa','Salsa'],['cebollita','Cebollita'],['chile','Chile toreado'],['papas','Orden de papas cambray'],['limon','Limón']],g:[gSabCostilla]},
 {id:'arrachera',sec:'arrachera',n:'Arrachera texana',s:'Lo más premium del menú',p:320,media:160,img:'arrachera',inc:[['','1 kg de arrachera'],['frijoles','Frijoles de la olla'],['tortillas','Tortillas'],['salsa','Salsa'],['cebollita','Cebolla'],['chile','Chile toreado'],['limon','Limón']]},
 {id:'flautas',sec:'extras',n:'Flautas',d:'$8 c/u · cada 5 por $35',p:8,img:'flautas'},
 {id:'arroz',sec:'extras',n:'Arroz',d:'Orden',p:20,img:'arroz'},
 {id:'salsa',sec:'extras',n:'Salsa tradicional',d:'La de la casa',p:15,img:'salsa'},
 {id:'salsasabor',sec:'extras',n:'Salsa de sabor',d:'BBQ, ajo, chipotle, tamarindo y más',p:SABOR_EXTRA,ic:'bowl',g:[{k:'ss',t:'Sabores',ops:SABORES,pref:'sab-',tipo:'cantidad',ayuda:`$${SABOR_EXTRA} cada una. Elige cuántas quieres de cada sabor.`}]},
 {id:'ensalada',sec:'extras',n:'Ensalada',d:'Orden',p:20,img:'ensalada'},
 {id:'papas',sec:'extras',n:'Papas cambray',d:'Orden',p:40,img:'papas'},
 {id:'sopa',sec:'extras',n:'Sopa de codito',d:'Orden',p:40,img:'sopa'},
 {id:'refgrande',sec:'extras',n:'Refresco 1.5 L',d:'Coca-Cola o Sidral Mundet',p:38,img:'coca15',g:[gRef(1)]},
 {id:'coca450',sec:'extras',n:'Coca-Cola 450 ml',d:'Refresco chico',p:25,img:'coca450'},
];
const byId=id=>MENU.find(m=>m.id===id);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>'$'+n.toLocaleString('es-MX');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ===== Fecha y hora de Colima (misma zona que CDMX) =====
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function ahora(){
  try{
    const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const v=t=>p.find(x=>x.type===t).value;
    return {dia:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(v('weekday')), min:+v('hour')*60 + +v('minute')};
  }catch(e){const d=new Date();return {dia:d.getDay(),min:d.getHours()*60+d.getMinutes()};}
}
const aHHMM=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const hora12=h=>{if(!h)return'';let[H,M]=h.split(':').map(Number);const ap=H>=12?'pm':'am';H=H%12||12;return `${H}:${String(M).padStart(2,'0')} ${ap}`;};
const h12=m=>hora12(aHHMM(m));
// ¿Cuándo vuelve a abrir? → "hoy a las 9:00 am", "mañana a las 9:00 am", "el miércoles a las 9:00 am"
function proximaApertura(){
  const {dia,min}=ahora();
  if(!DESCANSO.includes(dia) && min<SERV_INI) return `hoy a las ${h12(SERV_INI)}`;
  for(let i=1;i<=7;i++){const d=(dia+i)%7; if(!DESCANSO.includes(d)) return `${i===1?'mañana':'el '+DIAS[d]} a las ${h12(SERV_INI)}`;}
}
// Estado del negocio para un tipo de entrega
function estado(modo){
  const {dia,min}=ahora();
  if(DESCANSO.includes(dia)) return {abierto:false, motivo:`Los martes descansamos. Entregamos de nuevo ${proximaApertura()}.`};
  if(min>=ULTIMO[modo]) return {abierto:false, motivo: modo==='domicilio'&&min<ULTIMO.recoge
      ? `Ya no alcanzamos a enviar a domicilio hoy. Aún puedes pedir para recoger hasta las ${h12(ULTIMO.recoge)}.`
      : `Por hoy ya no recibimos pedidos (último pedido ${h12(ULTIMO_PEDIDO)}). Entregamos de nuevo ${proximaApertura()}.`};
  return {abierto:true, antes:min<SERV_INI};
}

const VIERNES=ahora().dia===5;
const PICO_AHORA=()=>{const m=ahora().min;return m>=PICO[0]&&m<PICO[1];};
const disponible=m=>!OFF.has(m.id) && !(m.base&&OFF.has(m.base)) && (m.id!=='viernes'||VIERNES) && (m.id!=='refgrande'||!apagado('ref15'));
const faltantes=m=>(m.inc||[]).filter(([k])=>k&&apagado(k)).map(([,l])=>l);

// ===== Precios =====
// Flautas: cada 5 por $35 y las sueltas a $8
const precio=(m,q,media)=>m.id==='flautas' ? Math.floor(q/5)*35+(q%5)*8 : (media&&m.media?m.media:m.p)*q;
const suma=o=>Object.values(o||{}).reduce((a,n)=>a+n,0);
function precioLinea(c){
  const m=byId(c.id); let t=precio(m,c.q,c.media);
  (m.g||[]).forEach(g=>{ if(g.precio) t+=suma(c.sel&&c.sel[g.k])*g.precio; });
  return t;
}
function desgloseFlautas(q){const g=Math.floor(q/5),r=q%5,p=[];
  if(g) p.push(`${g} ${g>1?'promos':'promo'} de 5 (${money(g*35)})`);
  if(r) p.push(`${r} ${r>1?'sueltas':'suelta'} (${money(r*8)})`);
  return p.join(' + ');}
// {bbq:2, ajo:1} → "2 BBQ, 1 Ajo"   ·   {bbq:1} → "BBQ"
function eleccionTxt(g,o){
  const nom=Object.fromEntries(g.ops.map(x=>[x[0],x[1]]));
  const e=Object.entries(o||{}).filter(([,n])=>n>0);
  if(e.length===1&&e[0][1]===1) return nom[e[0][0]];
  return e.map(([k,n])=>`${n} ${nom[k]}`).join(', ');
}
// Renglones de detalle de una línea del pedido: [["Sabores","2 BBQ, 1 Ajo"], ...]
const NOMBRE_PIEZA={pollo:'Pollo',medio:'Medio pollo',cuarto:'Cuarto'};
// Le pone número a cada pieza solo si hay más de una del mismo tipo
function etiquetasPiezas(pzs){
  const tot={}, n={}; pzs.forEach(p=>tot[p.t]=(tot[p.t]||0)+1);
  return pzs.map(p=>{n[p.t]=(n[p.t]||0)+1; return NOMBRE_PIEZA[p.t]+(tot[p.t]>1?' '+n[p.t]:'');});
}
const nomSabor=k=>(SABORES.find(x=>x[0]===k)||[,k])[1];
function textoPieza(p){
  if(p.t==='pollo'&&p.modo==='mitad'&&p.s[1]&&p.s[1]!==p.s[0]) return `½ ${nomSabor(p.s[0])} y ½ ${nomSabor(p.s[1])}`;
  return nomSabor(p.s[0])+(p.t==='pollo'?' completo':'')+(p.t==='cuarto'&&p.corte?` · ${p.corte}`:'');
}
function detalles(c){
  const m=byId(c.id), d=[];
  if(m.media) d.push(['Tamaño',c.media?'Media orden':'Orden completa']);
  (m.g||[]).forEach(g=>{
    const o=c.sel&&c.sel[g.k];
    if(g.tipo==='piezas'){ if(Array.isArray(o)){ const et=etiquetasPiezas(o); o.forEach((p,i)=>d.push([et[i],textoPieza(p)])); } return; }
    if(!suma(o)) return;
    const etiqueta=g.etiqueta?(suma(o)>1?g.etiqueta.replace(/r$/,'res'):g.etiqueta):g.k==='ref'?(suma(o)>1?'Refrescos':'Refresco'):g.k==='sabx'?'Sabor':g.k==='extra'?(suma(o)>1?'Sabores extra':'Sabor extra'):(suma(o)>1?'Sabores':'Sabor');
    d.push([etiqueta, (g.tipo==='multi'?Object.keys(o).filter(k=>o[k]>0).map(nomSabor).join(' y '):eleccionTxt(g,o))+(g.precio?` (+${money(suma(o)*g.precio)})`:'')]);
  });
  if(c.id==='flautas') d.push(['Precio',desgloseFlautas(c.q)]);
  return d;
}

// ===== Estado del cliente (sobrevive si la página se actualiza) =====
let CART=[], FORM={modo:'recoge',nombre:'',hora:'',calle:'',colonia:'',ciudad:'',ref:'',tel:'',pago:'efectivo',cambio:'',coment:''};
try{const g=JSON.parse(sessionStorage.getItem('colorado2')||'null'); if(g){CART=(g.cart||[]).filter(c=>byId(c.id)); Object.assign(FORM,g.form||{});}}catch(e){}
const guardar=()=>{try{sessionStorage.setItem('colorado2',JSON.stringify({cart:CART,form:FORM}));}catch(e){}};

// ===== Íconos =====
const FLAMA='<svg width="34" height="40" viewBox="0 0 34 40" aria-hidden="true"><path fill="#F2711C" d="M17 1c2 7 9 10 11 18 2.6 10-4 20-11 20S3.4 32 6 22c1-4 3.5-6 4.5-10 2 3 2 6 1.5 8 3-2 6-9 5-19z"/><path fill="#120E0B" d="M17 22c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-6 .6 1.5.6 2.5.3 3.5 1.6-1 2.7-3.6 2.2-6.5z"/></svg>';
const IC={
 bowl:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3"/></svg>',
 leaf:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M4 20 13 11"/></svg>',
 fb:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z"/></svg>',
 ig:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
 carrito:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.2l2.3 10.4a1.6 1.6 0 0 0 1.6 1.3h7.7a1.6 1.6 0 0 0 1.5-1.1L20.5 8H6.1"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>',
 pin:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
 wa:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>',
 arena:'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="#D9D2C7" stroke-width="1.6" stroke-linecap="round" d="M6 3h12M6 21h12M7.5 3c0 4.5 4.5 6 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 6-4.5 9s4.5 4.5 4.5 9"/><path fill="#F5B83D" d="M9.2 6.6h5.6c-.6 1.6-2 2.6-2.8 3.3-.8-.7-2.2-1.7-2.8-3.3zM8.4 20c.4-2.4 2.4-3.6 3.6-4.4 1.2.8 3.2 2 3.6 4.4z"/><path stroke="#F5B83D" stroke-width="1" d="M12 12v3"/></svg>',
 reloj:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};

// ===== Pintar la carta =====
function enCarrito(id){return CART.filter(c=>c.id===id).reduce((a,c)=>a+c.q,0);}
function notaSabor(m){
  if((m.g||[]).some(x=>x===gSabCostilla)) return `<p class="nota-sabor">🔥 Sabor opcional +${money(SABOR_EXTRA)}</p>`;
  const g=(m.g||[]).find(x=>x.k==='sab'||x.k==='sabx'); if(!g) return '';
  return g.piezas.includes('pollo') ? '<p class="nota-sabor">🔥 Sabor a elegir: completo o mitad y mitad</p>' : '<p class="nota-sabor">🔥 Incluye 1 sabor a elegir</p>';
}
function card(m,wide){
  const ok=disponible(m), sin=faltantes(m), n=enCarrito(m.id);
  const cerradoViernes=m.id==='viernes'&&!VIERNES&&!OFF.has(m.id);
  const sello=(OFF.has(m.id)||(m.base&&OFF.has(m.base)))?'<span class="sello">Agotado</span>':(cerradoViernes?'<span class="sello" style="color:var(--ambar);border-color:var(--ambar)">Solo viernes</span>':'');
  return `<article class="card ${wide?'wide':''} ${ok?'':'off'}">
    <div class="ph" style="background-image:url(${IMG[m.img]})${m.fit?';background-size:contain;background-color:#050505':''}">${sello}<span class="precio">${money(m.p)}</span></div>
    <div class="body">
      <h3>${esc(m.n)}${m.s?`<small>${esc(m.s)}</small>`:''}</h3>
      <ul class="inc" aria-label="Incluye">${(m.inc||[]).map(([k,l])=>`<li class="${k&&apagado(k)?'sin':''}">${esc(l)}</li>`).join('')}</ul>
      ${notaSabor(m)}
      ${CARNES.includes(m.id)?`<p class="nota-tiempo">${IC.arena} Toma de 30 a 45 min · pide con anticipación</p>`:''}
      ${m.media?`<p class="nota-media">También en <b>media orden: ${money(m.media)}</b></p>`:''}
      ${sin.length&&ok?`<p class="nota-sin">Hoy sin ${esc(sin.join(', ').toLowerCase())}</p>`:''}
      ${cerradoViernes?'<p class="cerrado">Disponible cada viernes</p>':''}
      <button class="add" data-add="${m.id}" ${ok?'':'disabled aria-disabled="true"'}>${ok?'Agregar':(cerradoViernes?'Vuelve el viernes':'Agotado')}${n?`<span class="n">${n} en tu pedido</span>`:''}</button>
    </div></article>`;
}
function extra(m){
  const ok=disponible(m), n=enCarrito(m.id);
  const th=m.img?`style="background-image:url(${IMG[m.img]})${/^coca|^ref/.test(m.id)?';background-color:#fff':''}"`:'';
  return `<button class="ex ${ok?'':'off'}" data-add="${m.id}" ${ok?'':'aria-disabled="true"'}>
    <span class="th" ${th}>${m.img?'':IC[m.ic]}</span>
    <span class="t"><b>${esc(m.n)}${ok?'':'<span class="tag">Agotado</span>'}</b><span>${esc(m.d)}${n?` · ${n} en tu pedido`:''}</span></span>
    <span class="pr">${money(m.p)}</span><span class="mas" aria-hidden="true">+</span></button>`;
}
function sec(id,titulo,sub,html){return `<section id="${id}"><div class="sec-h"><h2>${titulo}</h2><span class="rule"></span>${sub?`<p>${sub}</p>`:''}</div>${html}</section>`;}
function pillEstado(){
  const e=estado('recoge');
  if(e.abierto && !e.antes) return `<span class="estado on">Abierto<span class="largo"> · pedidos hasta ${h12(ULTIMO_PEDIDO)}</span></span>`;
  if(e.abierto && e.antes) return `<span class="estado off"><span class="largo">Entregas </span>desde ${h12(SERV_INI).replace(' pm','')}<span class="largo"> pm</span></span>`;
  return `<span class="estado off">Sin pedidos<span class="largo"> · ${proximaApertura().replace(' a las',',')}</span></span>`;
}
function avisoHorario(){
  const e=estado('recoge');
  if(!e.abierto) return `<div class="aviso horario" role="status">${IC.reloj}<span><b>Por ahora no recibimos pedidos</b><br>${esc(e.motivo)} Puedes ver el menú y armar tu pedido.</span></div>`;
  if(e.antes) return `<div class="aviso horario" role="status">${IC.reloj}<span><b>Entregamos desde las ${h12(SERV_INI)}</b><br>Ya puedes dejar tu pedido programado.</span></div>`;
  return '';
}

function render(){
  const offList=[...OFF].map(k=>INSUMOS[k]||(byId(k)&&byId(k).n)).filter(Boolean);
  $('#root').innerHTML=`
  <header class="top">
    <div class="wrap">
      <a class="marca" href="#inicio">${FLAMA}<span><b>COLORADO</b><small>POLLOS ASADOS</small></span></a>
      ${pillEstado()}
      <a class="wa-mini" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener" aria-label="WhatsApp">${IC.wa}<span>WhatsApp</span></a>
      <button class="carrito" id="cartBtn" aria-label="Ver mi pedido">${IC.carrito}<span class="badge" id="badge"></span><span class="ctot" id="ctot"></span></button>
    </div>
    <nav class="cats" aria-label="Categorías">
      <a href="#pollos">Pollos</a><a href="#sabores">Sabores</a><a href="#paquetes">Paquetes</a><a href="#viernes">Promo viernes</a><a href="#costillas">Costillas</a><a href="#arrachera">Arrachera</a><a href="#extras">Extras</a><a href="#ubicacion">Ubicación</a>
    </nav>
  </header>
  <div class="hero" id="inicio">
    <div class="bg" style="background-image:url(${IMG.portada})"></div>
    <div class="wrap">
      <span class="label">Pollos asados al carbón · Villa de Álvarez</span>
      <h1>Sabor que se comparte, <span>hecho al carbón</span></h1>
      <p>Arma tu pedido aquí, elige si pasas por él o te lo llevamos, y envíalo por WhatsApp.</p>
      ${VIERNES&&!OFF.has('viernes')?'<a class="viernes-hoy" href="#viernes">Hoy es viernes: 2 pollos con todo por $449</a>':''}
      ${avisoHorario()}
      ${offList.length?`<div class="aviso" role="status"><span><b>Hoy se terminó</b><br>${esc(offList.join(', '))}</span></div>`:''}
    </div>
  </div>
  <main class="wrap">
    ${sec('pollos','Pollos','Todos incluyen arroz, salsa, tortillas, cebollita, chile toreado y totopos. Cada medio pollo incluye un sabor a elegir.',`<div class="sab-banner" style="background-image:url(${IMG.pcrudo})"><span>Al carbón desde temprano</span></div><div class="grid">${MENU.filter(m=>m.sec==='pollos').map(m=>card(m)).join('')}</div>`)}
    ${sec('sabores','Nuestros sabores',`Sin costo. Cada pollo completo puede ser de un sabor o mitad y mitad; el 1/2 y el 1/4 llevan un sabor. Sabor extra: ${money(SABOR_EXTRA)}.`,`<div class="sab-banner" style="background-image:url(${IMG.sabores})"><span>11 sabores, bañados al carbón</span></div><p class="tip">¿Quieres la salsa aparte? Pídelo en «¿Alguna indicación?» al agregar tu pollo.</p><div class="leyenda"><span>${IC.arena} Mayor tiempo de espera</span><span>${IC_SAB.salado} Salado</span><span>${IC_SAB.flama} Picante</span><span>${IC_SAB.dulce} Dulce</span><span>${IC_SAB.dulce}${IC_SAB.acido} Agridulce</span></div><div class="sabores-lista">${SABORES.map(([k,l,d,t])=>`<div class="sab-chip ${apagado('sab-'+k)?'off':''}"><b>${esc(l)}</b><div class="fila-nivel">${nivelSabor(t)}${apagado('sab-'+k)?'<span class="tag">Agotado</span>':''}</div><span>${esc(d)}</span></div>`).join('')}</div>`)}
    ${sec('paquetes','Paquetes','Para compartir en familia. Eliges los sabores al agregarlo.',`<div class="grid">${MENU.filter(m=>m.sec==='paquetes').map(m=>card(m)).join('')}</div>`)}
    ${sec('viernes','Promo de viernes',VIERNES?'Solo hoy.':'Se puede pedir únicamente los viernes.',card(byId('viernes'),true))}
    ${sec('costillas','Costillas','1 kg de costilla al carbón con papas cambray. El sabor se agrega aparte.',card(byId('costillas'),true)+`<div class="sab-banner" style="background-image:url(${IMG.costcharola});margin-top:14px"><span>Jugosas, directo de la brasa</span></div>`)}
    ${sec('arrachera','Arrachera texana','',card(byId('arrachera'),true)+`<div class="galeria"><div style="background-image:url(${IMG.arrac})" role="img" aria-label="Arrachera en trozos"></div><div style="background-image:url(${IMG.arrachera2})" role="img" aria-label="Arrachera en el asador"></div></div>`)}
    ${sec('extras','Extras','Agrégalos a tu pedido.',`<div class="sab-banner" style="background-image:url(${IMG.acomp})"><span>Acompáñalo como se debe</span></div><div class="extras">${MENU.filter(m=>m.sec==='extras').map(extra).join('')}</div>`)}
    <div class="cinta">Sabor que se comparte <span>|</span> Hecho al carbón</div>
    <footer class="pie" id="ubicacion">
      <div class="bloque"><div class="foto-local" style="background-image:url(${IMG.local})" role="img" aria-label="Fachada de Pollos Colorado"></div><h4>Dónde estamos</h4>
        <p>${esc(DIRECCION)}</p>
        <p class="sub-pie">Busca el toldo rojo de «Pollos asados de sabores».</p>
        <div class="btns"><a class="pill or" href="${MAPS}" target="_blank" rel="noopener">${IC.pin} Abrir en Google Maps</a></div></div>
      <div class="bloque"><h4>Horario</h4>
        <p><b>Miércoles a lunes</b><br>${h12(ABRE)} a ${h12(CIERRA)}</p>
        <p class="sub-pie">Pedidos para recoger y a domicilio: entregamos desde las ${h12(SERV_INI)} y recibimos pedidos hasta las ${h12(ULTIMO_PEDIDO)}.</p>
        <p class="sub-pie">Martes descansamos.</p>
        <p class="sub-pie">A domicilio en ${CIUDADES.slice(0,-1).join(', ')} y ${CIUDADES.slice(-1)}. Envío de ${ENVIO}.</p></div>
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
  <div class="toast" id="toast" role="status"></div>
  <div class="veil" id="veil"><div class="sheet" id="sheet" role="dialog" aria-modal="true"></div></div>`;
  $$('[data-add]').forEach(b=>b.onclick=()=>{const m=byId(b.dataset.add); if(disponible(m)) abrirItem(m);});
  $('#cartBtn').onclick=abrirCarrito;
  $('#copiar').onclick=copiar;
  $('#veil').onclick=e=>{if(e.target.id==='veil')cerrar();};
  barra();
}
function copiarTexto(texto,boton,original,nodo){
  const ok=()=>{boton.textContent='Copiado';setTimeout(()=>boton.textContent=original,2000);};
  const sel=()=>{const r=document.createRange();r.selectNodeContents(nodo);const s=getSelection();s.removeAllRanges();s.addRange(r);boton.textContent='Selecciónalo y cópialo';};
  try{navigator.clipboard.writeText(texto).then(ok,sel);}catch(e){sel();}
}
function copiar(){copiarTexto(LINK,$('#copiar'),'Copiar enlace',$('#linkTxt'));}

const total=()=>CART.reduce((a,c)=>a+precioLinea(c),0);
const piezas=()=>CART.reduce((a,c)=>a+c.q,0);
function barra(pulso){
  const b=$('#cartBtn'), n=piezas();
  b.classList.toggle('lleno',!!n);
  $('#badge').textContent=n||''; $('#ctot').textContent=n?money(total()):'';
  b.setAttribute('aria-label',n?`Ver mi pedido: ${n} productos, ${money(total())}`:'Tu pedido está vacío');
  if(pulso){
    b.classList.remove('pulso');void b.offsetWidth;b.classList.add('pulso');
    const t=$('#toast'); t.innerHTML=`Agregado a tu pedido · <b>${money(total())}</b> <button id="verPed">Ver pedido</button>`; t.classList.add('ver');
    $('#verPed').onclick=()=>{t.classList.remove('ver');abrirCarrito();};
    clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove('ver'),3200);
  }
}

// ===== Hojas deslizables =====
const X_SVG='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function abrir(html){
  if(!html.includes('cerrarX')) html=`<div class="x-flot"><button class="cerrar-x" id="cerrarX" aria-label="Cerrar">${X_SVG}</button></div>`+html;
  $('#sheet').innerHTML=html; $('#sheet').scrollTop=0;
  $('#cerrarX').onclick=()=>{ const x=$('#x'); if(x) x.click(); else cerrar(); };$('#veil').classList.add('open');document.body.style.overflow='hidden';}
function cerrar(){$('#veil').classList.remove('open');document.body.style.overflow=''; if(pendiente){pendiente=false; refrescarCarta();}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar();});

// ===== Agregar un producto (cantidad, sabores, refrescos) =====
function abrirItem(m,idx){
  const prev=idx!=null?CART[idx]:null;
  const grupos=m.g||[];
  const porCantidad=grupos.some(g=>g.tipo==='cantidad');   // salsas: la cantidad sale de los sabores
  const esFlauta=m.id==='flautas';
  let q=prev?prev.q:1;
  let media=!!(prev&&prev.media);
  const esCarne=CARNES.includes(m.id);
  const sel={}; grupos.forEach(g=>{ const v=prev&&prev.sel&&prev.sel[g.k]; sel[g.k]=g.tipo==='piezas'?(Array.isArray(v)?JSON.parse(JSON.stringify(v)):[]):Object.assign({},v||{}); });
  const libre=(g,k)=>disponibleOp(g,k);
  const primeraLibre=g=>(g.ops.find(o=>libre(g,o[0]))||[])[0];
  const meta=g=>g.por*q;
  // Hasta 2 lugares se eligen con botones (uno por lugar); con más, con + y −
  const modoBotones=g=>(g.tipo==='exacto'||g.tipo==='opcional') && meta(g)<=2;
  // Lugares: ["adobado","bbq"] <-> conteo {adobado:1,bbq:1}
  const lugares={};
  let verExtra=grupos.some(g=>g.tipo==='multi'&&suma(sel[g.k])>0);   // la sección de sabor extra va plegada
  const aLugares=g=>{const r=[]; Object.entries(sel[g.k]).forEach(([k,n])=>{for(let i=0;i<n;i++) r.push(k);}); return r;};
  const deLugares=g=>{const o={}; lugares[g.k].forEach(k=>{ if(k) o[k]=(o[k]||0)+1; }); sel[g.k]=o;};
  // Ajusta las elecciones cuando cambia la cantidad
  function ajustar(){
    grupos.forEach(g=>{
      const o=sel[g.k], def=primeraLibre(g);
      if(g.tipo==='piezas'){ // una pieza por cada pollo / medio / cuarto según la cantidad
        const tipos=[]; for(let i=0;i<q;i++) tipos.push(...g.piezas);
        sel[g.k]=tipos.map((t,i)=>o[i]&&o[i].t===t?o[i]:{t,modo:'completo',s:[def]});
        sel[g.k].forEach(p=>{ if(p.corte&&OFF.has(CORTES[p.corte])) p.corte=''; });
        return;
      }
      if(g.tipo==='exacto'){
        const s=suma(o); if(s<meta(g) && def) o[def]=(o[def]||0)+(meta(g)-s);
        while(suma(o)>meta(g)){const k=(o[def]?def:Object.keys(o).filter(x=>o[x]>0).pop()); o[k]--; if(!o[k]) delete o[k];}
      }
      if(g.tipo==='opcional'){ while(suma(o)>meta(g)){const k=Object.keys(o).pop(); o[k]--; if(!o[k]) delete o[k];} }
      if(modoBotones(g)){
        const l=lugares[g.k]&&suma(sel[g.k])===lugares[g.k].filter(Boolean).length ? lugares[g.k].slice() : aLugares(g);
        while(l.length<meta(g)) l.push(g.tipo==='exacto'?def:'');
        lugares[g.k]=l.slice(0,meta(g)); deLugares(g);
      }
    });
  }
  const sin=faltantes(m);
  const sub=m.inc?'Incluye '+esc(m.inc.map(x=>x[1]).join(', ').toLowerCase()):esc(m.d);
  const blanco=/^coca|^ref/.test(m.id);
  const tieneSabor=grupos.some(g=>g.k==='sab'||g.k==='sabx'||g.etiqueta);
  abrir(`${m.img?`<div class="ph" style="background-image:url(${IMG[m.img]})${blanco?';background-size:contain;background-color:#fff':m.fit?';background-size:contain;background-color:#050505;aspect-ratio:1/1':''}"></div>`:''}
    <h3>${esc(m.n)}</h3>
    <p class="sub">${sub}</p>
    ${sin.length?`<p class="aviso-falta"><b>Hoy no tenemos ${esc(sin.join(', ').toLowerCase())}.</b> Si continúas, tu pedido va sin eso.</p>`:''}
    ${esCarne?'<p class="tip con-ic">'+IC.arena+' La carne tarda de 30 a 45 min en estar lista. Te sugerimos pedir con anticipación.</p>':''}
    ${m.media?`<span class="f">Tamaño</span><div class="seg"><button class="opt" data-media="0"><b>Orden completa</b><span>${money(m.p)}</span></button><button class="opt" data-media="1"><b>Media orden</b><span>${money(m.media)} · incluye lo mismo</span></button></div>`:''}
    ${porCantidad?'':`<span class="f">Cantidad</span>
    <div class="stepper"><button id="mn" aria-label="Menos">−</button><span id="q"></span><button id="pl" aria-label="Más">+</button></div>`}
    ${esFlauta?'<p class="small" id="desg"></p><p class="small">Cada grupo de 5 flautas cuesta $35; las sueltas, $8 cada una.</p>':''}
    <div id="grupos"></div>
    ${tieneSabor?'<p class="tip">¿Quieres la salsa aparte? Escríbelo aquí abajo.</p>':''}
    <label class="f" for="nota">¿Alguna indicación? <small>(opcional)</small></label>
    <textarea id="nota" placeholder="${blanco?'Ej. bien fría':tieneSabor?'Ej. salsa aparte, bien doradito':'Ej. sin cebollita, salsa aparte'}">${esc(prev?prev.nota:'')}</textarea>
    <div class="acts"><button class="btn ghost" id="x">Cancelar</button><button class="btn main" id="ok"></button></div>`);
  const linea=()=>({id:m.id,q,...(m.media?{media}:{}),nota:$('#nota').value.trim(),...(grupos.length?{sel:JSON.parse(JSON.stringify(sel))}:{})});
  const chip=(g,k,l,activo,attrs,extraTxt)=>{const off=k&&!libre(g,k);
    return `<button class="chip" ${attrs} aria-pressed="${activo}" ${off?'disabled':''}>${esc(l)}${extraTxt||''}${off?' · agotado':''}</button>`;};
  function pintarGrupos(){
    $('#grupos').innerHTML=grupos.map(g=>{
      let cuerpo='', cuenta='';
      if(g.tipo==='piezas'){
        const pzs=sel[g.k], et=etiquetasPiezas(pzs);
        const fila=(i,mi)=>`<div class="chips">${g.ops.map(([k,l])=>chip(g,k,l,pzs[i].s[mi]===k,`data-pz="${i}" data-mi="${mi}" data-o="${k}"`)).join('')}</div>`;
        cuerpo=pzs.map((p,i)=>`<div class="pieza"><div class="pieza-h"><span class="lugar">${esc(et[i])}</span>${p.t==='pollo'?`<div class="modo"><button data-modo="completo" data-pz="${i}" aria-pressed="${p.modo!=='mitad'}">Completo</button><button data-modo="mitad" data-pz="${i}" aria-pressed="${p.modo==='mitad'}">Mitad y mitad</button></div>`:''}</div>
          ${p.t==='pollo'&&p.modo==='mitad'?`<span class="mitad">1ª mitad</span>${fila(i,0)}<span class="mitad">2ª mitad</span>${fila(i,1)}`:fila(i,0)}
          ${p.t==='cuarto'?`<span class="mitad">¿Qué pieza prefieres? <small>(opcional)</small></span><div class="chips">${['','Pierna y muslo','Ala y pechuga'].map(c=>{const off=c&&OFF.has(CORTES[c]); return `<button class="chip" data-corte="${c}" data-pz="${i}" aria-pressed="${(p.corte||'')===c}" ${off?'disabled':''}>${c||'Me da igual'}${off?' · agotado':''}</button>`;}).join('')}</div>`:''}</div>`).join('');
        const ayuda=g.piezas.includes('pollo')?'Sin costo. Cada pollo puede ser completo de un sabor o mitad y mitad.':'Incluye 1 sabor sin costo.';
        return `<div class="grupo"><div class="grupo-h"><span class="f">${esc(g.t)}</span></div><p class="small">${ayuda}</p>${cuerpo}</div>`;
      }
      const s=suma(sel[g.k]);
      if(modoBotones(g)){
        const opciones=g.tipo==='opcional'?[['','Adobado'],...g.ops]:g.ops;
        cuerpo=lugares[g.k].map((v,i)=>`${meta(g)>1?`<span class="lugar">${g.slot} ${i+1}</span>`:''}
          <div class="chips">${opciones.map(([k,l])=>chip(g,k,l,v===k,`data-l="${g.k}" data-i="${i}" data-o="${k}"`,g.tipo==='opcional'&&k?' +$'+g.precio:'')).join('')}</div>`).join('');
        if(g.tipo==='opcional'&&s) cuenta=`+${money(s*g.precio)}`;
      } else if(g.tipo==='multi'){
        if(!verExtra) return `<button class="abrir-extra" id="verExtra">${g.boton||'+ Agregar sabor extra o doble'} <span>+$${g.precio} c/u</span></button>`;
        cuerpo=`<div class="chips">${g.ops.map(([k,l])=>chip(g,k,l,!!sel[g.k][k],`data-t="${g.k}" data-o="${k}"`)).join('')}</div>`;
        if(s) cuenta=`+${money(s*g.precio)}`;
      } else {
        const o=sel[g.k];
        cuenta=g.tipo==='exacto'?`${s} de ${meta(g)}`:g.tipo==='opcional'?(s?`${s} de ${meta(g)} · +${money(s*g.precio)}`:''):(s?`${s} en total`:'');
        cuerpo=`<div class="sabores">${g.ops.map(([k,l,d])=>{const off=!libre(g,k);
          return `<div class="sabor ${off?'off':''}"><span>${esc(l)}${off?'<span class="tag">Agotado</span>':''}${d&&!off?`<small>${esc(d)}</small>`:''}</span>${off?'':`<div class="stepper"><button data-g="${g.k}" data-o="${k}" data-d="-1" aria-label="Menos ${esc(l)}">−</button><span>${o[k]||0}</span><button data-g="${g.k}" data-o="${k}" data-d="1" aria-label="Más ${esc(l)}">+</button></div>`}</div>`;}).join('')}</div>`;
      }
      const ayuda=g.k==='sab'?(meta(g)>1?'Incluye 2 sabores sin costo. Si quieres uno solo, elige el mismo en los dos.':'Incluye 1 sabor sin costo.'):g.ayuda;
      const titulo=g.k==='sab'&&meta(g)>1?'Sabores':g.t;
      return `<div class="grupo"><div class="grupo-h"><span class="f">${esc(titulo)}</span><span class="cuenta">${cuenta}</span></div><p class="small">${esc(ayuda)}</p>${cuerpo}</div>`;
    }).join('');
    if($('#verExtra')) $('#verExtra').onclick=()=>{verExtra=true; pintarGrupos();};
    // Piezas: completo / mitad y mitad, y el sabor de cada parte
    $$('[data-modo]').forEach(b=>b.onclick=()=>{const p=sel.sab[+b.dataset.pz]; p.modo=b.dataset.modo; if(p.modo==='mitad'&&!p.s[1]) p.s[1]=p.s[0]; if(p.modo==='completo') p.s=[p.s[0]]; sync();});
    $$('[data-corte]').forEach(b=>b.onclick=()=>{sel.sab[+b.dataset.pz].corte=b.dataset.corte; sync();});
    $$('[data-mi]').forEach(b=>b.onclick=()=>{const p=sel.sab[+b.dataset.pz]; p.s[+b.dataset.mi]=b.dataset.o; sync();});
    // Botones: un sabor por lugar
    $$('[data-l]').forEach(b=>b.onclick=()=>{const g=grupos.find(x=>x.k===b.dataset.l); lugares[g.k][+b.dataset.i]=b.dataset.o; deLugares(g); sync();});
    // Sabores extra: se prenden y apagan
    $$('[data-t]').forEach(b=>b.onclick=()=>{const o=sel[b.dataset.t], k=b.dataset.o; if(o[k]) delete o[k]; else o[k]=1; sync();});
    // Con + y −
    $$('[data-g]').forEach(b=>b.onclick=()=>{
      const g=grupos.find(x=>x.k===b.dataset.g), o=sel[g.k], k=b.dataset.o, d=+b.dataset.d;
      if(d>0){
        if(g.tipo==='exacto'){ // al subir uno, se le quita a otro para mantener el total
          if(suma(o)>=meta(g)){const otro=Object.keys(o).find(x=>x!==k&&o[x]>0); if(!otro) return; o[otro]--; if(!o[otro]) delete o[otro];}
        } else if(g.tipo==='opcional'){ if(suma(o)>=meta(g)) return; }
        else if(suma(o)>=40) return;
        o[k]=(o[k]||0)+1;
      } else if(o[k]){ o[k]--; if(!o[k]) delete o[k]; }
      sync();
    });
  }
  function sync(){
    if(porCantidad) q=suma(sel[grupos[0].k]); else { ajustar(); $('#q').textContent=q; }
    $$('[data-media]').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.media==='1')===media));
    pintarGrupos();
    let falta='';
    grupos.forEach(g=>{ if(g.tipo==='piezas'&&sel[g.k].some(p=>!p.s[0]||(p.modo==='mitad'&&!p.s[1]))) falta='Elige el sabor de tu pollo'; if(g.tipo==='exacto'&&primeraLibre(g)&&suma(sel[g.k])<meta(g)) falta=`Elige ${meta(g)-suma(sel[g.k])} ${g.k==='ref'?'refresco(s)':'sabor(es)'} más`; });
    if(esFlauta) $('#desg').textContent=q+' '+(q>1?'flautas':'flauta')+': '+desgloseFlautas(q);
    if(!q) falta='Elige al menos un sabor';
    $('#ok').disabled=!!falta;
    $('#ok').textContent=falta||`${prev?'Guardar cambios':'Agregar'} · ${money(precioLinea(linea()))}`;
  }
  $$('[data-media]').forEach(b=>b.onclick=()=>{media=b.dataset.media==='1'; sync();});
  if(!porCantidad){
    $('#mn').onclick=()=>{if(q>1){q--;sync();}};
    $('#pl').onclick=()=>{if(q<60){q++;sync();}};
  }
  $('#x').onclick=()=>{cerrar(); if(prev) abrirCarrito();};
  $('#ok').onclick=()=>{
    const l=linea();
    if(prev) CART[idx]=l;
    else if(grupos.length) CART.push(l);
    else { const ya=CART.find(c=>c.id===m.id&&c.nota===l.nota&&!c.sel&&!!c.media===!!l.media); if(ya) ya.q+=q; else CART.push(l); }
    guardar(); cerrar(); const y=scrollY; render(); scrollTo(0,y); barra(true);
    if(prev) abrirCarrito();
  };
  sync();
}

// ===== Horario del pedido =====
// Solo pollo: desde las 12:15 (o ahora + 15/35 min). Con carne: siempre se suman 30/50 min, también al inicio del servicio (12:45 / 1:05 pm)
const horaMinima=()=>hayCarne()?Math.max(ahora().min,SERV_INI)+margen(FORM.modo):Math.max(ahora().min+margen(FORM.modo),SERV_INI);
function horaInvalida(){
  if(!FORM.hora) return '';
  const [H,M]=FORM.hora.split(':').map(Number), elegida=H*60+M, min=horaMinima();
  if(elegida>HORA_MAX(FORM.modo)) return `Lo más tarde que puedes programar ${FORM.modo==='recoge'?'para recoger':'a domicilio'} es a las ${h12(HORA_MAX(FORM.modo))}.`;
  if(elegida<SERV_INI) return `El servicio empieza a las ${h12(SERV_INI)}. Elige las ${h12(min)} o más tarde.`;
  if(elegida<min) return `${FORM.modo==='recoge'?'Para recoger':'A domicilio'} necesitamos al menos ${margen(FORM.modo)} min${hayCarne()?' (tu pedido lleva carne)':''}. Elige las ${h12(min)} o más tarde.`;
  return '';
}
function faltaDato(){
  if(!CART.length) return 'Agrega algo a tu pedido.';
  const e=estado(FORM.modo); if(!e.abierto) return e.motivo;
  if(!FORM.nombre.trim()) return FORM.modo==='recoge'?'Escribe el nombre para el pedido.':'Escribe tu nombre.';
  if(FORM.modo==='domicilio'){
    if(!FORM.ciudad) return 'Elige tu ciudad.';
    if(!FORM.calle.trim()) return 'Escribe tu calle y número.';
    if(!FORM.colonia.trim()) return 'Escribe tu colonia.';
    if(FORM.tel.replace(/\D/g,'').length<10) return 'Escribe un teléfono de 10 dígitos para el repartidor.';
  }
  const hi=horaInvalida(); if(hi) return hi;
  if(FORM.pago==='tarjeta'&&FORM.modo==='domicilio') return 'A domicilio solo aceptamos efectivo o transferencia.';
  return '';
}
const PAGOS={efectivo:'Efectivo',tarjeta:'Tarjeta (en el local)',transferencia:'Transferencia'};
function mensaje(){
  const L=[]; const one=s=>s.trim().replace(/\s*\n\s*/g,', ');
  const cuando=FORM.hora?hora12(FORM.hora):(estado(FORM.modo).antes?`a partir de las ${h12(horaMinima())}`:'lo antes posible');
  L.push('*NUEVO PEDIDO · POLLOS COLORADO*');
  L.push('');
  L.push(`*${FORM.modo==='recoge'?'Nombre del pedido':'Cliente'}:* ${one(FORM.nombre)||'—'}`);
  if(FORM.modo==='recoge'){
    L.push(`*Entrega:* Pasa a recoger ${FORM.hora?'a las ':''}${cuando}`);
  } else {
    L.push(`*Entrega:* A DOMICILIO ${FORM.hora?'para las ':''}${cuando}`);
    L.push(`*Dirección:* ${one(FORM.calle)||'—'}`);
    L.push(`*Colonia:* ${one(FORM.colonia)||'—'}`);
    L.push(`*Ciudad:* ${FORM.ciudad||'—'}`);
    if(FORM.ref.trim()) L.push(`*Referencias:* ${one(FORM.ref)}`);
    L.push(`*Teléfono:* ${FORM.tel.trim()||'—'}`);
  }
  L.push('');
  L.push('*PEDIDO*');
  CART.forEach(c=>{
    const m=byId(c.id);
    L.push(`${c.q} × ${m.n} — ${money(precioLinea(c))}`);
    detalles(c).forEach(([k,v])=>L.push(`   ${k}: ${v}`));
    const sin=faltantes(m); if(sin.length) L.push(`   Sin ${sin.join(', ').toLowerCase()}`);
    if(c.nota) L.push(`   Nota: ${one(c.nota)}`);
  });
  L.push('');
  L.push(`*TOTAL: ${money(total())}*${FORM.modo==='domicilio'?' + envío':''}`);
  if(FORM.modo==='domicilio') L.push(`Envío: por confirmar (${ENVIO})`);
  L.push(`*Pago:* ${PAGOS[FORM.pago]}${FORM.pago==='efectivo'&&FORM.cambio.trim()?', paga con $'+FORM.cambio.replace(/[^\d.]/g,''):''}`);
  if(FORM.coment.trim()) L.push(`*Comentarios:* ${one(FORM.coment)}`);
  if(FORM.pago==='transferencia'){ L.push(''); L.push('📎 *Adjunto la captura de mi transferencia.*'); }
  return L.join('\n');
}
function abrirCarrito(){
  const lineas=CART.map((c,i)=>{const m=byId(c.id); const sin=faltantes(m); const conGrupos=!!(m.g&&m.g.length);
    return `<div class="linea"><div class="t"><b>${c.q>1?c.q+' × ':''}${esc(m.n)}</b>${m.s&&m.sec!=='pollos'?`<i>${esc(m.s)}</i>`:''}${detalles(c).map(([k,v])=>`<i>${esc(k)}: ${esc(v)}</i>`).join('')}${c.nota?`<i>Nota: ${esc(c.nota)}</i>`:''}${sin.length?`<span class="w">Hoy sin ${esc(sin.join(', ').toLowerCase())}</span>`:''}</div>
      <div class="r"><strong>${money(precioLinea(c))}</strong>${conGrupos?`<div class="mini"><button data-ed="${i}">Editar</button><button data-rm="${i}">Quitar</button></div>`:`<div class="stepper"><button data-mn="${i}" aria-label="Quitar uno">−</button><span>${c.q}</span><button data-pl="${i}" aria-label="Agregar uno">+</button></div>`}</div></div>`;}).join('');
  abrir(`<div class="sheet-h"><h3>Tu pedido</h3><button class="cerrar-x" id="cerrarX" aria-label="Cerrar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    ${lineas||'<p class="sub">Aún no agregas nada.</p>'}
    <div class="total"><span id="lblTotal">Total</span><b>${money(total())}</b></div>
    <span class="f">¿Cómo lo quieres?</span>
    <div class="seg"><button class="opt" data-m="recoge"><b>Paso a recoger</b><span>${hayCarne()?'Con carne: 30 a 45 min':'Listo en 10 a 25 min'}</span></button><button class="opt" data-m="domicilio"><b>A domicilio</b><span>${hayCarne()?'Con carne: 50 a 60 min':'30 a 45 min'} · envío ${ENVIO.replace(' según la zona','')}</span></button></div>
    <p class="pico" id="pico" hidden></p>
    <label class="f" for="fn" id="lblNombre"></label><input type="text" id="fn" autocomplete="name">
    <div id="boxDom">
      <span class="f">Ciudad</span>
      <div class="seg tres">${CIUDADES.map(c=>`<button class="opt chico" data-c="${esc(c)}"><b>${esc(c)}</b></button>`).join('')}</div>
      <label class="f" for="fc1">Calle y número</label><input type="text" id="fc1" autocomplete="street-address" placeholder="Ej. Av. Pablo Silva 245">
      <label class="f" for="fc2">Colonia</label><input type="text" id="fc2" placeholder="Ej. Centro">
      <label class="f" for="fr">Referencias <small>(opcional)</small></label><input type="text" id="fr" placeholder="Ej. casa azul, portón negro">
      <label class="f" for="ft">Teléfono para el repartidor</label><input type="tel" id="ft" autocomplete="tel" inputmode="tel" placeholder="10 dígitos">
      <p class="small">El costo de envío va de ${ENVIO}; te lo confirmamos por WhatsApp.</p>
    </div>
    <label class="f" for="fh" id="lblHora"></label><select id="fh" class="sel-hora"></select><p class="small" id="hint"></p><p class="tip con-ic" id="notaCarne" hidden>${IC.arena} Tu pedido lleva carne: tarda de 30 a 45 min. Por eso la hora más próxima es más tarde.</p>
    <span class="f">¿Cómo vas a pagar?</span>
    <div class="seg tres" id="pagos"></div>
    <div id="boxCambio"><label class="f" for="fcb">¿Con cuánto pagas? <small>(opcional, para tu cambio)</small></label><input type="text" id="fcb" inputmode="numeric" placeholder="Ej. 500"></div>
    <div id="boxTransf" class="transf">
      <b class="t-tit">Datos para transferencia</b>
      <div class="t-fila"><span>Banco</span><b>${esc(BANCO.banco)}</b></div>
      <div class="t-fila"><span>Tarjeta</span><b id="numTarjeta">${esc(BANCO.tarjeta)}</b><button class="pill mini-copy" id="copiarTarjeta">Copiar</button></div>
      <div class="t-fila"><span>A nombre de</span><b>${esc(BANCO.titular)}</b></div>
      <p class="t-aviso"><b>Importante:</b> después de enviar tu pedido, manda en el mismo chat de WhatsApp la <b>captura de tu transferencia</b>. Sin el comprobante no podemos ${FORM.modo==='domicilio'?'enviar':'preparar'} tu pedido.</p>
    </div>
    <label class="f" for="fco">Comentarios del pedido <small>(opcional)</small></label><textarea id="fco" placeholder="Ej. pollo bien doradito, sin picante para los niños"></textarea>
    <details class="prev"><summary>Ver el mensaje que se enviará</summary><div class="burbuja" id="pv"></div></details>
    <p class="falta" id="falta"></p>
    <div class="acts"><button class="btn ghost" id="x">Seguir viendo</button><a class="btn wa" id="send" href="#" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>
    <p class="small">Al tocar Enviar se abre WhatsApp con tu pedido ya escrito; solo presiona enviar. Pedidos al ${TEL_VISIBLE}.</p>`);
  const campos={fn:'nombre',fc1:'calle',fc2:'colonia',fr:'ref',ft:'tel',fh:'hora',fcb:'cambio',fco:'coment'};
  Object.entries(campos).forEach(([id,k])=>{const el=$('#'+id); el.value=FORM[k]; el.oninput=el.onchange=()=>{FORM[k]=el.value; act();};});
  $$('[data-m]').forEach(b=>b.onclick=()=>{FORM.modo=b.dataset.m; if(FORM.modo==='domicilio'&&FORM.pago==='tarjeta') FORM.pago='efectivo'; act();});
  $$('[data-c]').forEach(b=>b.onclick=()=>{FORM.ciudad=b.dataset.c;act();});
  $$('[data-mn]').forEach(b=>b.onclick=()=>{const c=CART[+b.dataset.mn]; c.q--; if(c.q<1) CART.splice(+b.dataset.mn,1); guardar(); refrescarTodo();});
  $$('[data-pl]').forEach(b=>b.onclick=()=>{CART[+b.dataset.pl].q++; guardar(); refrescarTodo();});
  $$('[data-rm]').forEach(b=>b.onclick=()=>{CART.splice(+b.dataset.rm,1); guardar(); refrescarTodo();});
  $$('[data-ed]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ed; cerrar(); abrirItem(byId(CART[i].id),i);});
  $('#cerrarX').onclick=cerrar;
  $('#copiarTarjeta').onclick=()=>copiarTexto(BANCO.tarjeta.replace(/\s/g,''),$('#copiarTarjeta'),'Copiar',$('#numTarjeta'));
  $('#x').onclick=cerrar;
  function pintarPagos(){
    const ops=FORM.modo==='recoge'
      ? [['efectivo','Efectivo','En el local'],['tarjeta','Tarjeta','En el local'],['transferencia','Transferencia','Manda captura']]
      : [['efectivo','Efectivo','Al repartidor'],['transferencia','Transferencia','Manda captura']];
    $('#pagos').className='seg '+(ops.length===3?'tres':'');
    $('#pagos').innerHTML=ops.map(([k,t,s])=>`<button class="opt chico" data-p="${k}" aria-pressed="${FORM.pago===k}"><b>${t}</b><span>${s}</span></button>`).join('');
    $$('[data-p]').forEach(b=>b.onclick=()=>{FORM.pago=b.dataset.p;act();});
  }
  function act(){
    $$('[data-m]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===FORM.modo));
    $$('[data-c]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===FORM.ciudad));
    pintarPagos();
    $('#boxDom').hidden=FORM.modo!=='domicilio';
    $('#boxCambio').hidden=FORM.pago!=='efectivo';
    $('#boxTransf').hidden=FORM.pago!=='transferencia';
    $('#lblTotal').textContent=FORM.modo==='domicilio'?'Total (sin envío)':'Total';
    $('#lblNombre').textContent=FORM.modo==='recoge'?'Nombre del cliente o del pedido':'Nombre de quien recibe';
    $('#lblHora').innerHTML=FORM.modo==='recoge'?'¿A qué hora pasas por él? <small>(opcional)</small>':'¿Para qué hora lo quieres? <small>(opcional)</small>';
    const e=estado(FORM.modo), mn=horaMinima();
    const mx=HORA_MAX(FORM.modo);
    // Solo horarios de servicio, cada 15 min, desde la hora más próxima posible
    const slots=[]; for(let t=Math.ceil(mn/15)*15;t<=mx;t+=15) slots.push(aHHMM(t));
    if(FORM.hora&&!slots.includes(FORM.hora)) FORM.hora='';
    $('#fh').innerHTML=`<option value="">${e.antes?`A partir de las ${h12(mn)}`:'Lo antes posible'}</option>`+slots.map(v=>`<option value="${v}">${hora12(v)}</option>`).join('');
    $('#fh').value=FORM.hora; $('#fh').disabled=!e.abierto;
    $('#notaCarne').hidden=!hayCarne();
    $('#hint').textContent=!e.abierto?'':mn<=mx
      ? `Horarios disponibles de ${h12(Math.ceil(mn/15)*15>mx?mn:Math.ceil(mn/15)*15)} a ${h12(mx)}.`
      : 'Déjala vacía y lo preparamos lo antes posible.';
    $('#pico').hidden=!(e.abierto&&!e.antes&&PICO_AHORA());
    $('#pico').textContent=`Estamos en hora pico (${h12(PICO[0])} a ${h12(PICO[1])}): ${FORM.modo==='recoge'?'tu pedido puede tardar un poco más':'a domicilio puede tardar hasta 60 min'}.`;
    $('#fh').style.borderColor=horaInvalida()?'var(--ambar)':'';
    const f=faltaDato(), s=$('#send');
    $('#pv').textContent=mensaje(); $('#falta').textContent=f;
    s.href='https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(mensaje());
    s.setAttribute('aria-disabled',f?'true':'false');
    guardar();
  }
  clearInterval(window.__reloj); window.__reloj=setInterval(()=>{ if($('#veil').classList.contains('open')&&$('#hint')) act(); else clearInterval(window.__reloj); },30000);
  $('#send').addEventListener('click',e=>{ act(); if(faltaDato()){ e.preventDefault(); return; } try{sessionStorage.setItem('colorado-enviado','1');}catch(_){} });
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
    const base=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&t=${Date.now()}`;
    let r=await fetch(base+'&sheet=Agotados');
    if(!r.ok) r=await fetch(base);              // si la pestaña tiene otro nombre, usa la primera
    if(!r.ok) return;
    const txt=await r.text();
    const nuevos=new Set();
    txt.trim().split('\n').forEach(linea=>{
      const [id,,agotado]=linea.split(',').map(c=>c.replace(/^"|"$/g,'').trim());
      if(id && /^(true|verdadero|si|sí|x|1)$/i.test(agotado)) nuevos.add(id);
    });
    if([...nuevos].sort().join()!==[...OFF].sort().join()){ OFF.clear(); nuevos.forEach(k=>OFF.add(k)); refrescarCarta(); }
  }catch(e){ /* sin conexión a la hoja: se muestra todo disponible */ }
}

// ===== Chispas de brasa por toda la página =====
function chispas(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv=document.createElement('canvas'); cv.className='brasas'; cv.setAttribute('aria-hidden','true'); document.body.appendChild(cv);
  const cx=cv.getContext('2d'); let W,H,P=[]; const dpr=Math.min(2,devicePixelRatio||1);
  const tam=()=>{W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);};
  tam(); addEventListener('resize',tam);
  const N=()=>Math.round(Math.min(46,Math.max(22,W/22)));
  const nueva=(inicio)=>{const t=Math.random(); return {
    x:Math.random()*W, y:inicio?Math.random()*H:H+10,
    vx:(Math.random()-.5)*.35, vy:-(.35+Math.random()*1.1),
    tipo:t<.55?'punto':t<.85?'raya':'astilla',
    r:t<.55?.6+Math.random()*1.6:.5+Math.random()*.8, largo:3+Math.random()*7,
    vida:0, max:260+Math.random()*420, fase:Math.random()*6.28, giro:(Math.random()-.5)*.08, ang:Math.random()*6.28,
    color:Math.random()<.6?[255,150+Math.random()*60|0,60]:[255,90+Math.random()*50|0,25]};};
  for(let i=0;i<N();i++) P.push(nueva(true));
  let ultimo=0;
  (function paso(ts){
    requestAnimationFrame(paso);
    if(document.hidden||ts-ultimo<30) return; ultimo=ts;
    cx.clearRect(0,0,W,H); cx.globalCompositeOperation='lighter';
    while(P.length<N()) P.push(nueva(false));
    P.forEach((p,i)=>{
      p.vida++; p.fase+=.08; p.ang+=p.giro;
      p.x+=p.vx+Math.sin(p.fase)*.35; p.y+=p.vy; p.vy*=.999;
      const f=Math.min(1,p.vida/30)*Math.max(0,1-p.vida/p.max), parpadeo=.65+.35*Math.sin(p.fase*2.3);
      const a=f*parpadeo*.85; if(a<=0||p.y<-20){P[i]=nueva(false);return;}
      const [r,g,b]=p.color; cx.fillStyle=`rgba(${r},${g},${b},${a})`; cx.strokeStyle=cx.fillStyle;
      cx.shadowColor=`rgba(255,120,30,${a})`; cx.shadowBlur=6;
      if(p.tipo==='punto'){cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fill();}
      else if(p.tipo==='raya'){cx.lineWidth=p.r;cx.lineCap='round';cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*p.largo*2,p.y-p.vy*p.largo);cx.stroke();}
      else{cx.save();cx.translate(p.x,p.y);cx.rotate(p.ang);cx.beginPath();cx.moveTo(-2,-.6);cx.lineTo(1.8,-1);cx.lineTo(1.2,.9);cx.lineTo(-1.6,.7);cx.closePath();cx.fill();cx.restore();}
    });
    cx.shadowBlur=0; cx.globalCompositeOperation='source-over';
  })(0);
}

render();
chispas();
setTimeout(preguntarVaciar,400);
cargarAgotados();
setInterval(cargarAgotados,120000);                       // revisa cada 2 minutos
setInterval(()=>{ if(!$('#veil').classList.contains('open')) refrescarCarta(); },300000); // actualiza "abierto/cerrado"
document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ cargarAgotados(); preguntarVaciar(); } });
addEventListener('focus',preguntarVaciar);
// Al regresar de WhatsApp: ¿ya enviaste tu pedido?
function preguntarVaciar(){
  let f=null; try{f=sessionStorage.getItem('colorado-enviado');}catch(_){}
  if(!f) return;
  try{sessionStorage.removeItem('colorado-enviado');}catch(_){}
  if(!CART.length) return;
  abrir(`<div class="sheet-h"><h3>¿Ya enviaste tu pedido?</h3><button class="cerrar-x" id="cerrarX" aria-label="Cerrar">${X_SVG}</button></div>
    <p class="sub">Si ya lo mandaste por WhatsApp, vaciamos tu carrito para que quede listo para la próxima.</p>
    <div class="acts"><button class="btn ghost" id="x">No, seguir con mi pedido</button><button class="btn main" id="vaciar">Sí, vaciar carrito</button></div>`);
  $('#cerrarX').onclick=cerrar; $('#x').onclick=cerrar;
  $('#vaciar').onclick=()=>{ CART=[]; Object.assign(FORM,{hora:'',coment:'',cambio:''}); guardar(); cerrar(); const y=scrollY; render(); scrollTo(0,y);
    const t=$('#toast'); t.innerHTML='¡Gracias por tu pedido! 🔥'; t.classList.add('ver'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove('ver'),2500); };
}
})();
