import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFNsuyPGIuBVDX0w-Cd309mFdryvkjLLM",
  authDomain: "lm-store-2a996.firebaseapp.com",
  projectId: "lm-store-2a996",
  storageBucket: "lm-store-2a996.firebasestorage.app",
  messagingSenderId: "43188475451",
  appId: "1:43188475451:web:faa028ca2e7e2ba9e76e1e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db; // for debugging

/* ---------- Data ---------- */
const defaultCategories = [
  {name:"Vestidos", key:"vestidos"},
  {name:"Plus Size", key:"plus_size"},
  {name:"Blusas", key:"blusas"},
  {name:"Calças", key:"calcas"},
  {name:"Conjuntos", key:"conjuntos"},
  {name:"Casual", key:"casual"},
  {name:"Festa", key:"festa"},
  {name:"Floridos", key:"floridos"},
  {name:"Looks Corporativos", key:"looks_corporativos"},
  {name:"Macacão", key:"macacao"},
  {name:"Acessórios", key:"acessorios"},
];

let categories = [];
try {
  const savedCats = localStorage.getItem('lm_exclusive_categories');
  if(savedCats) categories = JSON.parse(savedCats);
  else categories = [...defaultCategories];
} catch(e) { categories = [...defaultCategories]; }

async function saveCategories() {
  localStorage.setItem('lm_exclusive_categories', JSON.stringify(categories));
  try { await setDoc(doc(db, "store", "categories"), { list: categories }); } catch(e) {}
}

onSnapshot(doc(db, "store", "categories"), (docSnap) => {
  if (docSnap.exists()) {
    categories = docSnap.data().list;
    renderCategoryTable();
    renderCategorySelect();
    renderFilters();
  }
});

const products = [];

const whyItems = [
  {ic:"✨", t:"Coleção Selecionada", d:"Cada peça é escolhida com atenção ao caimento e à qualidade."},
  {ic:"💖", t:"Atendimento Humanizado", d:"Falamos com você de mulher para mulher, sem robôs."},
  {ic:"🔒", t:"Compra Segura", d:"Ambiente protegido do início ao fim da sua compra."},
  {ic:"💳", t:"Pagamento Facilitado", d:"PIX, crédito e débito, com parcelamento."},
  {ic:"🚚", t:"Entrega Rápida", d:"Sua peça sai da loja para você o quanto antes."},
  {ic:"🌟", t:"Novidades Frequentes", d:"Coleção sempre renovada com peças atuais."},
  {ic:"💬", t:"Suporte via WhatsApp", d:"Dúvidas resolvidas na hora, direto com a gente."},
];

const steps = [
  {n:"01", t:"Escolha", d:"Navegue pelo catálogo e adicione à sacola."},
  {n:"02", t:"Finalize", d:"Preencha seus dados e escolha o pagamento."},
  {n:"03", t:"Receba", d:"Acompanhe o envio até a porta da sua casa."},
];

const testimonials = [
  {n:"Ana Paula", t:"As peças chegaram exatamente como nas fotos, qualidade excelente e atendimento super atencioso."},
  {n:"Camila R.", t:"Comprei um vestido para um evento e recebi elogios a noite toda. Virei cliente fiel da loja."},
  {n:"Fernanda S.", t:"Entrega rápida e a blusa é ainda mais bonita pessoalmente. Recomendo demais."},
];

const faqs = [
  {q:"Quais as formas de pagamento?", a:"Aceitamos PIX, cartão de crédito parcelado e cartão de débito."},
  {q:"Qual o prazo de entrega?", a:"O prazo varia conforme sua região e é calculado automaticamente no checkout."},
  {q:"Posso trocar uma peça?", a:"Sim, você tem até 7 dias corridos após o recebimento para solicitar troca."},
  {q:"Como sei minha numeração?", a:"Cada peça tem uma tabela de medidas na descrição. Qualquer dúvida, fale conosco no WhatsApp."},
];

/* ---------- State ---------- */
let cart = [];
let favorites = new Set();
let activeFilter = "todos";
let searchTerm = "";

/* ---------- Render helpers ---------- */
const money = v => v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const placeholderImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23f9ece8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23b87b6c">LM Exclusive</text></svg>';
const imgSrc = p => {
  if (Array.isArray(p.img) && p.img.length > 0) return p.img[0] || placeholderImg;
  return p.img || placeholderImg;
};


function colorSwatch(colorStr) {
  if (!colorStr) return '';
  const colors = colorStr.split(',').map(s => s.trim());
  const map = {
    'preto':'#1a1a1a','branco':'#ffffff','rosa':'#f48fb1','pink':'#e91e63','fúcsia':'#d81b60','fucsia':'#d81b60',
    'vermelho':'#d32f2f','azul':'#1976d2','marinho':'#0d233a','azul marinho':'#0d233a','azul bebê':'#90caf9',
    'verde':'#2e7d32','verde militar':'#4b5320','oliva':'#556b2f','verde oliva':'#556b2f','menta':'#a8e6cf',
    'amarelo':'#fbc02d','mostarda':'#d4a373','laranja':'#f57c00','coral':'#ff7043','salmão':'#ff8a65','salmao':'#ff8a65',
    'cinza':'#9e9e9e','chumbo':'#424242','marrom':'#5d4037','bege':'#e0d2c7','nude':'#e8cbb9','caramelo':'#c68642',
    'roxo':'#7b1fa2','vinho':'#6a1b29','bordô':'#6a1b29','bordo':'#6a1b29','marsala':'#651e2b',
    'lilás':'#ba68c8','lilas':'#ba68c8','lavanda':'#b39ddb','off-white':'#f8f8f4','off white':'#f8f8f4',
    'dourado':'#d4af37','prata':'#bdc3c7','terracota':'#c85a32'
  };
  return colors.map(c => {
    const key = c.toLowerCase();
    const hex = map[key] || (key.includes('estamp') ? 'linear-gradient(45deg,#f48fb1,#90caf9,#a8e6cf)' : '#d5c4be');
    const isGradient = hex.startsWith('linear-gradient');
    const bgStyle = isGradient ? `background:${hex};` : `background-color:${hex};`;
    return `<span title="${c}" style="display:inline-block;width:13px;height:13px;border-radius:2px;${bgStyle}border:1px solid rgba(0,0,0,.2);margin-right:4px;vertical-align:middle;box-shadow:0 1px 2px rgba(0,0,0,0.1);"></span>`;
  }).join('');
}
function productCard(p){
  const isSold = (p.stock === 0 || p.status === 'indisponivel');
  const rawSizes = (p.size && p.size.trim() !== '') ? p.size : 'Único';
  const sizeList = rawSizes.split(',').map(s=>s.trim()).filter(Boolean);
  const initialSelectedSize = sizeList[0] || 'Único';
  const desc = p.desc || p.description || '';

  return `
  <div class="card ${isSold ? 'card-sold' : ''}" data-id="${p.id}" data-selected-size="${initialSelectedSize}">
    <div class="card-media">
      <img src="${imgSrc(p)}" alt="${p.name}" loading="lazy" class="zoom-img" data-pid="${p.id}" data-idx="0">
      ${Array.isArray(p.img) && p.img.length > 1 ? `
        <button class="mini-carousel-nav prev" data-dir="-1" data-pid="${p.id}" aria-label="Anterior">‹</button>
        <button class="mini-carousel-nav next" data-dir="1" data-pid="${p.id}" aria-label="Próximo">›</button>
      ` : ''}
      ${isSold ? '<span class="tag sold">Indisponível</span>' : (p.tag==='promo' ? '<span class="tag">Promoção</span>' : p.tag==='novo' ? '<span class="tag">Novo</span>' : '')}
      <button class="fav ${favorites.has(p.id)?'active':''}" data-fav="${p.id}" aria-label="Favoritar">${favorites.has(p.id)?'♥':'♡'}</button>
    </div>
    <div class="card-body">
      <span class="card-cat">${categories.find(c=>c.key===p.cat)?.name || p.cat}</span>
      <span class="card-name">${p.name}</span>
      ${desc ? `<p class="card-desc" title="${desc}">${desc}</p>` : ''}
      <span class="card-meta" style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
        ${colorSwatch(p.color)}<span>Cor: <strong>${p.color}</strong></span> • <span>Cód: ${p.code || ''}</span>
      </span>
      <div style="margin: 6px 0; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <span style="font-size:0.78rem; color:var(--muted); font-weight:600;">Tamanho:</span>
        <div class="size-options" style="display:inline-flex; gap:4px; flex-wrap:wrap;">
          ${sizeList.map((sz, sIdx) => `
            <button type="button" class="btn-size-opt ${sIdx===0?'active':''}" data-pid="${p.id}" data-size="${sz}">${sz}</button>
          `).join('')}
        </div>
      </div>
      <div class="price-row">
        <span class="price-new" style="${isSold ? 'opacity:0.7;' : ''}">${money(p.price)}</span>
        ${isSold ? '<span style="font-size:0.75rem; font-weight:700; color:#8B0000; text-transform:uppercase; letter-spacing:0.5px;">Peça Vendida</span>' : '<span style="font-size:0.72rem; color:var(--muted); font-weight:600;">Peça Única</span>'}
      </div>
      <div class="card-actions">
        ${isSold ? `
          <button class="mini-btn sold-btn" disabled>Indisponível</button>
        ` : `
          <button class="mini-btn" data-add="${p.id}">Adicionar</button>
          <button class="mini-btn" data-buy="${p.id}">Comprar</button>
        `}
      </div>
    </div>
  </div>`;
}
function renderCarousel(){
  const track = document.getElementById('carouselTrack');
  if(!track) return;
  const cards = products.map(p => {
    const isSold = (p.stock === 0 || p.status === 'indisponivel');
    return `
    <div class="carousel-card ${isSold ? 'is-sold' : ''}" data-buy="${p.id}">
      <img src="${imgSrc(p)}" alt="${p.name}" loading="lazy">
      ${isSold ? '<span class="carousel-sold-tag">Indisponível</span>' : ''}
      <div class="card-overlay">
        <span class="cc-name">${p.name}</span>
        <span>
          <span class="cc-price">${money(p.price)}</span>
          ${isSold ? '<span style="font-size:0.75rem; color:#FFB4AB; font-weight:700; margin-left:6px;">(Indisponível)</span>' : ''}
        </span>
      </div>
    </div>
  `;}).join('');
  // duplicar para loop infinito
  track.innerHTML = cards + cards;
}

function renderFilters(){
  const catsWithProducts = categories.filter(c => products.some(p => p.cat === c.key));
  const chips = ["todos", ...catsWithProducts.map(c=>c.key)];
  document.getElementById('filterChips').innerHTML = chips.map(k=>{
    const label = k==='todos' ? 'Todos' : catsWithProducts.find(c=>c.key===k).name;
    return `<button class="chip ${activeFilter===k?'active':''}" data-filter="${k}">${label}</button>`;
  }).join('');
}

function renderProducts(){
  let list = products.filter(p=>{
    const matchCat = activeFilter==='todos' || p.cat===activeFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || [p.name,p.cat,p.color].join(' ').toLowerCase().includes(term);
    return matchCat && matchSearch;
  });
  document.getElementById('productGrid').innerHTML = list.map(productCard).join('') || `<p style="grid-column:1/-1; text-align:center; color:var(--muted);">Nenhuma peça encontrada.</p>`;
  document.getElementById('newGrid').innerHTML = products.filter(p=>p.tag==='novo').map(productCard).join('');
}

function renderWhy(){
  document.getElementById('whyGrid').innerHTML = whyItems.map(w=>`
    <div class="why-card"><div class="ic">${w.ic}</div><h3>${w.t}</h3><p>${w.d}</p></div>
  `).join('');
}
function renderSteps(){
  document.getElementById('stepsGrid').innerHTML = steps.map(s=>`
    <div class="step"><div class="num">${s.n}</div><h3>${s.t}</h3><p>${s.d}</p></div>
  `).join('');
}
function renderTesti(customReviews = null){
  const container = document.getElementById('testiGrid');
  if(!container) return;
  const listToUse = (customReviews && customReviews.length > 0) ? customReviews : testimonials;
  container.innerHTML = listToUse.map(t=>`
    <div class="testi-card">
      <div class="stars">${'★'.repeat(t.rating || 5)}</div>
      <p style="font-style:italic; line-height:1.6; color:var(--ink); font-weight:500;">"${t.text || t.t}"</p>
      <div class="testi-name" style="font-weight:700; color:var(--rose-deep); margin-top:12px;">— ${t.name || t.n}</div>
    </div>
  `).join('');
}

function renderFeedbackForm(){
  const wrap = document.getElementById('feedbackFormWrap');
  if(!wrap) return;
  wrap.innerHTML = `
    <form id="customerFeedbackForm" style="display:flex; flex-direction:column; gap:14px; text-align:left;">
      <div>
        <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--ink); margin-bottom:5px;">Seu Nome *</label>
        <input type="text" id="fbName" placeholder="Ex: Mariana Silva" required style="width:100%; padding:11px 14px; border-radius:4px; border:1px solid var(--line); background:var(--cream); color:var(--ink); font-family:inherit; font-size:0.92rem; font-weight:500;">
      </div>
      <div>
        <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--ink); margin-bottom:5px;">Sua Avaliação</label>
        <select id="fbRating" style="width:100%; padding:11px 14px; border-radius:4px; border:1px solid var(--line); background:var(--cream); color:var(--ink); font-family:inherit; font-size:0.92rem; font-weight:500;">
          <option value="5">★★★★★ (5 estrelas - Excelente)</option>
          <option value="4">★★★★☆ (4 estrelas - Muito bom)</option>
          <option value="3">★★★☆☆ (3 estrelas - Bom)</option>
          <option value="2">★★☆☆☆ (2 estrelas - Regular)</option>
          <option value="1">★☆☆☆☆ (1 estrela - Ruim)</option>
        </select>
      </div>
      <div>
        <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--ink); margin-bottom:5px;">Sua Experiência *</label>
        <textarea id="fbText" rows="3" placeholder="Conte o que achou das peças, do tecido, do caimento ou do atendimento..." required style="width:100%; padding:11px 14px; border-radius:4px; border:1px solid var(--line); background:var(--cream); color:var(--ink); font-family:inherit; font-size:0.92rem; font-weight:500; resize:vertical;"></textarea>
      </div>
      <button type="submit" id="fbSubmitBtn" class="btn" style="margin-top:6px; background:var(--ink); color:#fff; border:none; padding:13px; font-weight:700; letter-spacing:1px; cursor:pointer; border-radius:4px; transition:opacity .2s; width:100%; font-size:0.88rem;">Enviar Avaliação</button>
      <div id="fbSuccessMsg" style="display:none; color:#1E7E34; text-align:center; font-weight:600; font-size:0.9rem; margin-top:8px;">✓ Obrigada! Seu depoimento foi publicado com sucesso no site.</div>
    </form>
  `;

  const fbForm = document.getElementById('customerFeedbackForm');
  if(fbForm){
    fbForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('fbName').value.trim();
      const text = document.getElementById('fbText').value.trim();
      const rating = Number(document.getElementById('fbRating').value || 5);
      const btn = document.getElementById('fbSubmitBtn');
      if(!name || !text) return;

      btn.disabled = true;
      btn.textContent = 'Enviando...';

      try {
        await addDoc(collection(db, "reviews"), {
          name,
          text,
          rating,
          createdAt: Date.now()
        });
        fbForm.reset();
        document.getElementById('fbSuccessMsg').style.display = 'block';
        setTimeout(()=>{
          const el = document.getElementById('fbSuccessMsg');
          if(el) el.style.display = 'none';
        }, 5000);
        showToast('Depoimento enviado com sucesso!');
      } catch(err){
        console.error('Erro ao enviar feedback:', err);
        alert('Erro ao enviar depoimento. Verifique a conexão.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar Avaliação';
      }
    });
  }
}
function renderFaq(){
  document.getElementById('faqList').innerHTML = faqs.map((f,i)=>`
    <div class="faq-item" data-i="${i}">
      <button class="faq-q"><span>${f.q}</span><span class="plus">+</span></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`).join('');
}

/* ---------- Cart logic ---------- */
function addToCart(id, silent, imgIdx = 0, chosenSize = null){
  const p = products.find(x=>x.id===id);
  if(!p || p.stock === 0 || p.status === 'indisponivel') {
    if(!silent) showToast('Esta peça exclusiva já está indisponível.');
    return;
  }
  const rawSizes = (p.size && p.size.trim() !== '') ? p.size : 'Único';
  const sizeList = rawSizes.split(',').map(s=>s.trim()).filter(Boolean);
  const sizeToUse = chosenSize || sizeList[0] || 'Único';
  const cartItemId = `${id}-${imgIdx}-${sizeToUse}`;
  const existing = cart.find(x=>x.id === id);
  if(existing){
    if(!silent) showToast(`"${p.name}" é peça única e já está na sua sacola!`);
    return;
  }
  cart.push({...p, cartItemId, imgIdx, selectedSize: sizeToUse, qty:1});
  updateCartUI();
  if(!silent) showToast(`${p.name} adicionado à sacola`);
}
function removeFromCart(cartItemId){
  cart = cart.filter(x=>x.cartItemId!==cartItemId);
  updateCartUI();
}
function changeQty(cartItemId, delta){
  const item = cart.find(x=>x.cartItemId===cartItemId);
  if(!item) return;
  if(delta > 0) {
    showToast('Cada peça é única e exclusiva (máx. 1 unidade).');
    return;
  }
  item.qty += delta;
  if(item.qty<=0) return removeFromCart(cartItemId);
  updateCartUI();
}

window.updateCartUI = updateCartUI;
function updateCartUI(){
  const count = cart.reduce((a,c)=>a+c.qty,0);
  document.getElementById('cartCount').textContent = count;
  const itemsEl = document.getElementById('drawerItems');
  const summaryEl = document.getElementById('drawerSummary');
  if(cart.length===0){
    itemsEl.innerHTML = `<div class="drawer-empty">Sua sacola está vazia.<br>Explore nossa coleção e adicione peças que combinam com você.</div>`;
    summaryEl.style.display='none';
    return;
  }
  summaryEl.style.display='block';
  itemsEl.innerHTML = cart.map(item=>{
        const imageToUse = Array.isArray(item.img) ? (item.img[item.imgIdx || 0] || item.img[0]) : item.img;
    const colors = item.color ? item.color.split(',').map(s=>s.trim()) : [];
    const colorToUse = colors[item.imgIdx] || item.color;
    const sizeToDisplay = item.selectedSize || item.size || 'Único';

    return `
    <div class="drawer-item">
      <div class="thumb" style="background-image:url(${imageToUse}); background-size:cover; background-position:center;"></div>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="meta" style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin-top:2px;">
          ${colorSwatch(colorToUse)} <span>${colorToUse}</span> • <span>Tam: <strong>${sizeToDisplay}</strong></span>
        </div>
        <div class="qty-ctrl" style="margin-top:4px;">
          <span style="font-size:0.74rem; font-weight:700; color:var(--rose-deep); background:var(--blush); padding:2px 8px; border-radius:10px;">Peça Única</span>
        </div>
        <a class="rm" data-rm="${item.cartItemId}" style="margin-top:6px; display:inline-block; font-size:0.76rem; color:#8B0000; cursor:pointer; font-weight:600;">Remover</a>
      </div>
      <div class="price">${money(item.price*item.qty)}</div>
    </div>`;
  }).join('');
  const subtotal = cart.reduce((a,c)=>a+c.price*c.qty,0);
  const wantsDelivery = document.getElementById('delivCheck')?.checked;
  const frete = wantsDelivery ? 15 : 0;

  const freteEl = document.getElementById('freteVal');
  if (freteEl) {
    freteEl.textContent = wantsDelivery ? money(15) : 'R$ 0,00';
  }
  const delivNoMsg = document.getElementById('delivNoMsg');
  if (delivNoMsg) {
    delivNoMsg.style.display = wantsDelivery ? 'none' : 'inline';
  }
  document.getElementById('subtotal').textContent = money(subtotal);
  document.getElementById('totalVal').textContent = money(subtotal + frete);

  const itemsList = cart.map(c => {
    const colors = c.color ? c.color.split(',').map(s=>s.trim()) : [];
    const colorToUse = colors[c.imgIdx] || c.color;
    const sz = c.selectedSize || c.size || 'Único';
    return `- ${c.name} (${colorToUse}, Tam: ${sz}) x${c.qty}: ${money(c.price * c.qty)}`;
  }).join('\n');

  const totalComFrete = subtotal + frete;
  let orderMsg = `Foi um prazer lhe atender, volte sempre !\n\n*Resumo do Pedido:*\n${itemsList}`;
  if (wantsDelivery) {
    orderMsg += `\n\n*Entrega solicitada (Frete R$ 15,00)*\n\n*Total:* ${money(totalComFrete)}`;
  } else {
    orderMsg += `\n\n*Entrega:* Cliente paga o Uber\n\n*Total:* ${money(totalComFrete)}`;
  }

  const btnWhats = document.getElementById('whatsCheckoutBtn');
  if(btnWhats) {
    btnWhats.href = `https://wa.me/5592981489393?text=${encodeURIComponent(orderMsg)}`;
    btnWhats.onclick = () => {
      if(typeof addSale === 'function') addSale(totalComFrete);
      if(typeof registerOrder === 'function') registerOrder(cart, totalComFrete, wantsDelivery, 'WhatsApp');
      closeDrawer();
    };
  }
} 

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Events ---------- */
document.addEventListener('click', e=>{
    const toggleStatusId = e.target.closest('[data-togglestatus]')?.dataset.togglestatus;
  if(toggleStatusId){
    toggleProductStatus(Number(toggleStatusId));
    return;
  }
const addId = e.target.closest('[data-add]')?.dataset.add;
  const buyId = e.target.closest('[data-buy]')?.dataset.buy;
  const favId = e.target.closest('[data-fav]')?.dataset.fav;
  const filter = e.target.closest('[data-filter]')?.dataset.filter;
  const catCard = e.target.closest('[data-cat]')?.dataset.cat;
  const rmId = e.target.closest('[data-rm]')?.dataset.rm;
  const qtyBtn = e.target.closest('[data-qty]');
  const faqItem = e.target.closest('.faq-item');
  const editId = e.target.closest('[data-edit]')?.dataset.edit;
  const delId = e.target.closest('[data-del]')?.dataset.del;

    if(e.target.classList.contains('btn-size-opt')){
    const btn = e.target;
    const card = btn.closest('.card');
    if(card){
      card.querySelectorAll('.btn-size-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      card.dataset.selectedSize = btn.dataset.size;
    }
  }

  if(addId) {
    const card = e.target.closest('.card');
    const imgEl = card ? card.querySelector('.zoom-img') : null;
    const idx = imgEl ? Number(imgEl.dataset.idx || 0) : 0;
    const selectedSize = card ? card.dataset.selectedSize : null;
    addToCart(Number(addId), false, idx, selectedSize);
  }
  if(buyId){ 
    const prod = products.find(x => x.id === Number(buyId));
    if (prod && (prod.stock === 0 || prod.status === 'indisponivel')) {
      showToast('Esta peça exclusiva já foi vendida (Indisponível).');
      return;
    }
    const card = e.target.closest('.card');
    const imgEl = card ? card.querySelector('.zoom-img') : null;
    const idx = imgEl ? Number(imgEl.dataset.idx || 0) : 0;
    const selectedSize = card ? card.dataset.selectedSize : null;
    addToCart(Number(buyId), true, idx, selectedSize); 
    openDrawer(); 
  }
  if(favId){
    const id = Number(favId);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    renderProducts();
  }
  if(filter){ activeFilter = filter; renderFilters(); renderProducts(); }
  if(catCard){ activeFilter = catCard; renderFilters(); renderProducts(); document.getElementById('produtos').scrollIntoView({behavior:'smooth'}); }
  if(rmId) removeFromCart(rmId);
  if(qtyBtn) changeQty(qtyBtn.dataset.cid, Number(qtyBtn.dataset.qty));
  if(faqItem) faqItem.classList.toggle('open');
  if(editId) editProduct(Number(editId));
  if(delId) { if(confirm('Tem certeza que deseja excluir esta peça da coleção?')) deleteProduct(Number(delId)); }
});

const sInput = document.getElementById('searchInput');
if(sInput) {
  sInput.addEventListener('input', e=>{
    searchTerm = e.target.value;
    renderProducts();
  });
}

function openDrawer(){
  document.getElementById('drawer').classList.add('show');
  document.getElementById('overlay').classList.add('show');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}
document.getElementById('cartBtn')?.addEventListener('click', openDrawer);
document.getElementById('closeDrawer')?.addEventListener('click', closeDrawer);
document.getElementById('overlay')?.addEventListener('click', closeDrawer);

/* FAQ auto max-height */
const faqObserver = new MutationObserver(()=>{
  document.querySelectorAll('.faq-item').forEach(item=>{
    const a = item.querySelector('.faq-a');
    a.style.maxHeight = item.classList.contains('open') ? a.scrollHeight+'px' : '0px';
  });
});
const flist = document.getElementById('faqList');
if(flist) faqObserver.observe(flist, {attributes:true, subtree:true, attributeFilter:['class']});

/* Reveal on scroll */
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('in'); });
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Petals */
function spawnPetals(){
  const wrap = document.getElementById('petals');
  if(!wrap) return;
  const rosePath = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1c3 3 3 7 0 9-3-2-3-6 0-9Z" opacity=".8"/></svg>`;
  for(let i=0;i<14;i++){
    const el = document.createElement('div');
    el.className='petal';
    const size = 10 + Math.random()*14;
    el.style.left = Math.random()*100+'vw';
    el.style.width = size+'px';
    el.style.height = size+'px';
    el.style.color = i%2===0 ? '#D9A79C' : '#E9C9C0';
    el.style.animation = `drift ${14+Math.random()*10}s linear ${Math.random()*14}s infinite`;
    el.innerHTML = rosePath;
    wrap.appendChild(el);
  }
}
spawnPetals();

/* Init */
renderCarousel();
renderFilters();
renderProducts();
renderWhy();
renderSteps();
renderTesti();
renderFeedbackForm();
renderFaq();
updateCartUI();

/* ---------- Persistence & Admin Logic (Firebase) ---------- */
onSnapshot(collection(db, "products"), (snapshot) => {
  products.length = 0;
  snapshot.forEach(doc => {
    products.push({ id: Number(doc.id), ...doc.data() });
  });
  products.sort((a,b) => b.id - a.id);
  renderCarousel();
  renderFilters();
  renderProducts();
  renderAdminTable();
  renderDashboard();
});

onSnapshot(collection(db, "reviews"), (snapshot) => {
  const reviews = [];
  snapshot.forEach(doc => {
    reviews.push({ id: doc.id, ...doc.data() });
  });
  reviews.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderTesti(reviews.length > 0 ? reviews : null);
});

async function migrateLocalData() {
  const saved = localStorage.getItem('lm_exclusive_products');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        for (const p of parsed) {
          if (Array.isArray(p.img)) {
            p.img = p.img.map(i => (i && i.length > 300000) ? placeholderImg : i);
          } else if (p.img && p.img.length > 300000) {
            p.img = placeholderImg;
          }
          await setDoc(doc(db, "products", p.id.toString()), p);
        }
      }
      localStorage.removeItem('lm_exclusive_products');
      console.log('Migração de produtos concluída.');
    } catch(e) { console.error('Erro migração:', e); }
  }
}
migrateLocalData();

function renderAdminTable(){
  const tableEl = document.getElementById('adminProductTable');
  const countEl = document.getElementById('admTotalCount');
  if(countEl) countEl.textContent = products.length;
  if(!tableEl) return;

  tableEl.innerHTML = products.map(p=>{
    const isSold = (p.stock === 0 || p.status === 'indisponivel');
    const desc = p.desc || p.description || '';
    return `
    <tr>
      <td><img src="${imgSrc(p)}" alt="${p.name}"></td>
      <td style="color:var(--ink);">
        <strong>${p.name}</strong><br>
        <small style="color:var(--muted); font-weight:600;">${p.code || ''}</small>
        ${desc ? `<br><small style="color:var(--muted); font-style:italic;">${desc.length > 50 ? desc.substring(0,50)+'...' : desc}</small>` : ''}
      </td>
      <td style="color:var(--ink); font-weight:500;">${categories.find(c=>c.key===p.cat)?.name || p.cat}</td>
      <td style="color:var(--ink); font-weight:600;">${money(p.price)}</td>
      <td>
        <span style="display:inline-block; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:700; ${isSold ? 'background:#FDE8E8; color:#9B1C1C;' : 'background:#DEF7EC; color:#03543F;'} margin-bottom:6px;">
          ${isSold ? '🔴 Indisponível' : '🟢 Disponível'}
        </span>
        <button class="mini-btn" data-togglestatus="${p.id}" style="background:${isSold ? '#1E7E34' : '#8B5E3C'}; color:#fff; border:none; margin-bottom:6px; display:block; width:100%; font-weight:600; padding:6px 8px; font-size:0.74rem; cursor:pointer;">
          ${isSold ? '✓ Marcar Disponível' : '✕ Marcar Vendido'}
        </button>
        <button class="mini-btn" data-edit="${p.id}" style="background:var(--ink); color:#fff; border:none; margin-bottom:6px; display:block; width:100%; font-weight:600; padding:6px 8px; font-size:0.74rem; cursor:pointer;">Editar</button>
        <button class="mini-btn" data-del="${p.id}" style="background:#8B0000; color:#fff; border:none; display:block; width:100%; font-weight:600; padding:6px 8px; font-size:0.74rem; cursor:pointer;">Remover</button>
      </td>
    </tr>
  `;}).join('');
}

window.toggleProductStatus = toggleProductStatus;
async function toggleProductStatus(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const isCurrentlySold = (p.stock === 0 || p.status === 'indisponivel');
  const newStatus = isCurrentlySold ? 'disponivel' : 'indisponivel';
  const newStock = isCurrentlySold ? 1 : 0;
  try {
    await updateDoc(doc(db, "products", id.toString()), {
      status: newStatus,
      stock: newStock
    });
    showToast(`Peça "${p.name}" marcada como ${newStatus === 'indisponivel' ? 'Indisponível' : 'Disponível'}!`);
  } catch(e) {
    console.error('Erro ao alternar status:', e);
    showToast('Erro ao atualizar status.');
  }
}

let editingProductId = null;

function editProduct(id) {
  const p = products.find(prod => prod.id === id);
  if(!p) return;
  editingProductId = id;
  
  document.getElementById('admName').value = p.name || '';
  document.getElementById('admCat').value = p.cat || 'vestidos';
  document.getElementById('admColor').value = p.color || '';
  document.getElementById('admPrice').value = p.price || '';
  if (document.getElementById('admStatus')) {
    document.getElementById('admStatus').value = (p.stock === 0 || p.status === 'indisponivel') ? 'indisponivel' : 'disponivel';
  }
  if (document.getElementById('admDesc')) {
    document.getElementById('admDesc').value = p.desc || p.description || '';
  }
  document.getElementById('admCode').value = p.code || '';
  document.getElementById('admTag').value = p.tag || '';
  document.getElementById('admSize').value = p.size || '';
  
  const submitBtn = document.querySelector('#newProductForm button[type="submit"]');
  submitBtn.innerHTML = '✏️ Atualizar Peça';
  
  let cancelBtn = document.getElementById('cancelEditBtn');
  if(!cancelBtn) {
    cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelEditBtn';
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn';
    cancelBtn.style.background = '#8B0000';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.fontWeight = '700';
    cancelBtn.style.marginLeft = '8px';
    cancelBtn.textContent = 'Cancelar Edição';
    cancelBtn.onclick = cancelEdit;
    submitBtn.parentNode.appendChild(cancelBtn);
  }
  cancelBtn.style.display = 'inline-block';
  document.querySelector('.admin-body').scrollTo({top: 0, behavior: 'smooth'});
}

function cancelEdit() {
  editingProductId = null;
  const form = document.getElementById('newProductForm');
  if(form) form.reset();
  const submitBtn = document.querySelector('#newProductForm button[type="submit"]');
  if(submitBtn) submitBtn.innerHTML = '✨ Publicar na Coleção';
  const cancelBtn = document.getElementById('cancelEditBtn');
  if(cancelBtn) cancelBtn.style.display = 'none';
}

document.getElementById('newProductForm')?.addEventListener('submit', async function(e){
  e.preventDefault();
  const submitBtn = document.querySelector('#newProductForm button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '⏳ Salvando na Nuvem...';
  submitBtn.disabled = true;

  const name = document.getElementById('admName').value.trim();
  const cat = document.getElementById('admCat').value;
  const color = document.getElementById('admColor').value.trim();
  const size = (document.getElementById('admSize')?.value.trim()) || 'Único';
  const price = parseFloat(document.getElementById('admPrice').value);
  const status = document.getElementById('admStatus')?.value || 'disponivel';
  const desc = document.getElementById('admDesc')?.value.trim() || '';
  const stock = status === 'indisponivel' ? 0 : 1;
  const code = document.getElementById('admCode').value.trim();
  const tag = document.getElementById('admTag').value;
  let imgStr = document.getElementById('admImgUrl').value.trim();
  let imgUrls = imgStr ? imgStr.split(',').map(s=>s.trim()) : null;
  const fileInput = document.getElementById('admImgFile');

  const addProductToFirestore = async (imgSrcArray) => {
    try {
      if (editingProductId) {
        const pRef = doc(db, "products", editingProductId.toString());
        const updateData = { name, cat, color, size, price, desc, status, stock, code, tag };
        if (imgSrcArray && imgSrcArray.length > 0) updateData.img = imgSrcArray;
        await updateDoc(pRef, updateData);
        showToast(`Peça "${name}" atualizada com sucesso!`);
        cancelEdit();
      } else {
        const newId = Date.now();
        const newProd = {
          id: newId,
          name, cat, color, size, price, desc, status, stock, code, tag,
          img: (imgSrcArray && imgSrcArray.length > 0) ? imgSrcArray : [placeholderImg]
        };
        await setDoc(doc(db, "products", newId.toString()), newProd);
        showToast(`Peça "${name}" publicada com sucesso!`);
        document.getElementById('newProductForm').reset();
      }
    } catch(err) {
      console.error('Erro ao salvar produto:', err);
      showToast('Erro ao salvar. Tente novamente.');
    }
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  };

  if(fileInput.files && fileInput.files.length > 0){
    const files = Array.from(fileInput.files);
    const compressedImages = [];
    let filesProcessed = 0;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(evt){ 
        const imgObj = new Image();
        imgObj.onload = function() {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 800;
          let width = imgObj.width;
          let height = imgObj.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgObj, 0, 0, width, height);
          compressedImages[index] = canvas.toDataURL('image/jpeg', 0.6);
          
          filesProcessed++;
          if(filesProcessed === files.length) {
            addProductToFirestore(compressedImages);
          }
        };
        imgObj.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  } else {
    addProductToFirestore(imgUrls);
  }
});

async function deleteProduct(id){
  const p = products.find(prod => prod.id === id);
  if(p){
    try {
      await deleteDoc(doc(db, "products", id.toString()));
      showToast(`Peça "${p.name}" removida.`);
    } catch(e) { console.error('Erro deletar', e); }
  }
}

// Category and Dashboard Logic
function renderCategorySelect() {
  const select = document.getElementById('admCat');
  if(!select) return;
  select.innerHTML = categories.map(c => `<option value="${c.key}">${c.name}</option>`).join('');
}

function renderCategoryTable() {
  const table = document.getElementById('adminCategoryTable');
  if(!table) return;
  table.innerHTML = categories.map(c => `
    <tr>
      <td style="color:var(--ink); font-weight:600;">${c.name}</td>
      <td><small style="color:var(--muted); font-weight:500;">${c.key}</small></td>
      <td>
        <button class="mini-btn" data-delcat="${c.key}" style="background:#8B0000; color:#fff; border:none; padding:6px 12px; font-weight:600; cursor:pointer;">Remover</button>
      </td>
    </tr>
  `).join('');
}

let totalSoldGlobal = 0;
onSnapshot(doc(db, "store", "sales"), (docSnap) => {
  if (docSnap.exists()) {
    totalSoldGlobal = docSnap.data().total || 0;
    renderDashboard();
  }
});

function renderDashboard() {
  const totalStock = products.reduce((acc, p) => acc + (p.price * (p.stock || 1)), 0);
  const stockEl = document.getElementById('dashTotalStock');
  if (stockEl) stockEl.textContent = money(totalStock);
  
  const soldEl = document.getElementById('dashTotalSold');
  if (soldEl) soldEl.textContent = money(totalSoldGlobal);
}

window.addSale = addSale;
async function addSale(amount) {
  try {
    totalSoldGlobal += amount;
    await setDoc(doc(db, "store", "sales"), { total: totalSoldGlobal });
  } catch(e) {}
}

document.getElementById('clearSalesBtn')?.addEventListener('click', async () => {
  if(confirm('Tem certeza que deseja zerar o histórico de vendas global?')) {
    try { await setDoc(doc(db, "store", "sales"), { total: 0 }); } catch(e) {}
  }
});

// Category form
document.getElementById('newCategoryForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('catName').value.trim();
  if(!name) return;
  const key = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
  if(categories.find(c => c.key === key)) {
    alert('Categoria já existe!');
    return;
  }
  categories.push({name, key});
  saveCategories();
  renderCategoryTable();
  renderCategorySelect();
  renderFilters();
  document.getElementById('newCategoryForm').reset();
});

// Delete category
document.getElementById('adminCategoryTable')?.addEventListener('click', (e) => {
  if(e.target.tagName === 'BUTTON' && e.target.dataset.delcat) {
    const key = e.target.dataset.delcat;
    if(confirm('Remover esta categoria? Os itens não serão excluídos, mas devem ser reatribuídos.')) {
      categories = categories.filter(c => c.key !== key);
      saveCategories();
      renderCategoryTable();
      renderCategorySelect();
      renderFilters();
    }
  }
});

// Tabs
document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(b => {
      b.classList.remove('active');
      b.style.color = 'var(--muted)';
      b.style.fontWeight = '500';
      b.style.borderBottom = '2px solid transparent';
    });
    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
    btn.classList.add('active');
    btn.style.color = 'var(--ink)';
    btn.style.fontWeight = '700';
    btn.style.borderBottom = '2px solid var(--rose-deep)';
    document.getElementById(btn.dataset.tab).style.display = 'block';
  });
});

window.openAdmin = openAdmin;
function openAdmin(){
  document.getElementById('loginModal').classList.add('show');
}
document.getElementById('closeLoginBtn')?.addEventListener('click', () => {
  document.getElementById('loginModal').classList.remove('show');
});
document.getElementById('doLoginBtn')?.addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (email === 'laryssa.melo2026@gmail.com' && pass === '123456') {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
    
    document.getElementById('adminModal').classList.add('show');
    renderCategorySelect();
    renderAdminTable();
    renderCategoryTable();
    renderDashboard();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
});
window.closeAdmin = closeAdmin;
function closeAdmin(){
  document.getElementById('adminModal').classList.remove('show');
}
document.getElementById('openAdminBtn')?.addEventListener('click', openAdmin);
document.getElementById('footAdminBtn')?.addEventListener('click', openAdmin);
document.getElementById('closeAdminBtn')?.addEventListener('click', closeAdmin);
document.getElementById('adminModal')?.addEventListener('click', function(e){
  if(e.target === this) closeAdmin();
});

// Image Carousel & Lightbox Logic
document.addEventListener('click', function(e) {
  const navBtn = e.target.closest('.mini-carousel-nav');
  if (navBtn) {
    e.stopPropagation();
    const pid = Number(navBtn.dataset.pid);
    const dir = Number(navBtn.dataset.dir);
    const p = products.find(x => x.id === pid);
    if (!p || !Array.isArray(p.img) || p.img.length <= 1) return;
    
    const cardMedia = navBtn.closest('.card-media');
    const img = cardMedia.querySelector('.zoom-img');
    let idx = Number(img.dataset.idx || 0);
    idx += dir;
    if (idx < 0) idx = p.img.length - 1;
    if (idx >= p.img.length) idx = 0;
    
    img.src = p.img[idx];
    img.dataset.idx = idx;
    return;
  }
  
  if (e.target.classList.contains('zoom-img')) {
    const pid = Number(e.target.dataset.pid);
    const p = products.find(x => x.id === pid);
    if (!p) return;
    openLightbox(p, Number(e.target.dataset.idx || 0));
  }
  
  if (e.target.classList.contains('lightbox-close') || e.target.id === 'lightboxModal') {
    closeLightbox();
  }
  
  const lbNav = e.target.closest('.lightbox-nav');
  if (lbNav) {
    e.stopPropagation();
    const dir = Number(lbNav.dataset.dir);
    navigateLightbox(dir);
  }
});

let currentLightboxProduct = null;
let currentLightboxIdx = 0;

function openLightbox(p, idx = 0) {
  currentLightboxProduct = p;
  currentLightboxIdx = idx;
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const navs = modal.querySelectorAll('.lightbox-nav');
  
  img.src = Array.isArray(p.img) ? p.img[idx] : p.img;
  modal.classList.add('show');
  
  if (Array.isArray(p.img) && p.img.length > 1) {
    navs.forEach(n => n.style.display = 'flex');
  } else {
    navs.forEach(n => n.style.display = 'none');
  }
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.remove('show');
  currentLightboxProduct = null;
}

function navigateLightbox(dir) {
  if (!currentLightboxProduct || !Array.isArray(currentLightboxProduct.img)) return;
  const len = currentLightboxProduct.img.length;
  currentLightboxIdx += dir;
  if (currentLightboxIdx < 0) currentLightboxIdx = len - 1;
  if (currentLightboxIdx >= len) currentLightboxIdx = 0;
  document.getElementById('lightboxImg').src = currentLightboxProduct.img[currentLightboxIdx];
}

// Theme Toggle
(function(){
  if(localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    let theme = 'light';
    if (!document.documentElement.hasAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'dark');
      theme = 'dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  });
}

// Sidebar Logic
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const burgerBtn = document.querySelector('.burger');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarAdminBtn = document.getElementById('sidebarAdminBtn');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
}

function closeSidebarMenu() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
}

if (burgerBtn) burgerBtn.addEventListener('click', openSidebar);
if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarMenu);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarMenu);

// Fechar sidebar ao clicar em um link
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', closeSidebarMenu);
});

if (sidebarAdminBtn) {
  sidebarAdminBtn.addEventListener('click', () => {
    closeSidebarMenu();
    const adminModal = document.getElementById('adminModal');
    if(adminModal) adminModal.style.display = 'flex';
  });
}



if(window.location.hash === '#admin' || window.location.pathname.endsWith('/admin') || window.location.pathname.endsWith('/admin.html')){
  window.openAdmin();
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    window.history.replaceState(null, null, '/#admin');
  }
}









// Interactive Precision Magnifying Zoom (By Moon Premium Standard)
document.addEventListener('mousemove', function(e) {
  const cardMedia = e.target.closest('.card-media');
  if (cardMedia) {
    const img = cardMedia.querySelector('.zoom-img');
    if (img) {
      const rect = cardMedia.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = 'scale(2.3)';
    }
  }
});

document.addEventListener('mouseout', function(e) {
  const cardMedia = e.target.closest('.card-media');
  if (cardMedia && (!e.relatedTarget || !cardMedia.contains(e.relatedTarget))) {
    const img = cardMedia.querySelector('.zoom-img');
    if (img) {
      img.style.transformOrigin = 'center center';
      img.style.transform = 'scale(1)';
    }
  }
});



// InfinitePay Checkout Integration (API Direct)
document.getElementById('infinitePayCheckoutBtn')?.addEventListener('click', async () => {
  if (cart.length === 0) return;

  const btn = document.getElementById('infinitePayCheckoutBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '⏳ Gerando Checkout...';

  try {
    const items = cart.map(item => {
      const colors = item.color ? item.color.split(',').map(s=>s.trim()) : [];
      const colorToUse = colors[item.imgIdx] || item.color;
      const sz = item.selectedSize || item.size || 'Único';
      return {
        quantity: item.qty,
        price: Math.round(item.price * 100), // Em centavos
        description: `${item.name} (${colorToUse}, Tam: ${sz})`
      };
    });

    const wantsDelivery = document.getElementById('delivCheck')?.checked;
    if (wantsDelivery) {
      items.push({
        quantity: 1,
        price: 1500, // R$ 15,00 em centavos
        description: 'Taxa de Entrega (Frete Padrão)'
      });
    }

    const orderNsu = `LM-${Date.now()}`;
    const payload = {
      handle: "laryssa-nascimento-9qf",
      items: items,
      order_nsu: orderNsu,
      redirect_url: window.location.origin + window.location.pathname + "?payment=success"
    };

    const response = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('InfinitePay Response:', data);

    const checkoutUrl = data.url || data.link || data.checkout_url || data.payment_url || (data.slug ? `https://checkout.infinitepay.io/${data.slug}` : null);

    if (checkoutUrl) {
      const subtotal = cart.reduce((a,c)=>a+c.price*c.qty,0);
      const frete = document.getElementById('delivCheck')?.checked ? 15 : 0;

      // NÃO marcar como vendido aqui: a cliente ainda não pagou.
      // Guardamos o carrinho e só processamos após o retorno com pagamento aprovado.
      try {
        localStorage.setItem('lm_pending_checkout', JSON.stringify({
          orderNsu, cart, total: subtotal + frete, wantsDelivery: Boolean(wantsDelivery), createdAt: Date.now()
        }));
      } catch(e) { console.error('Erro ao salvar checkout pendente:', e); }

      window.location.href = checkoutUrl;
    } else {
      throw new Error(data.message || 'Link de checkout não retornado.');
    }
  } catch(err) {
    console.error('Erro InfinitePay:', err);
    alert('Não foi possível iniciar o checkout online da InfinitePay no momento. Por favor, tente novamente ou finalize seu pedido pelo WhatsApp!');
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});

// Verificação de retorno de pagamento com sucesso
if (window.location.search.includes('payment=success')) {
  (async () => {
    let pending = null;
    try { pending = JSON.parse(localStorage.getItem('lm_pending_checkout') || 'null'); } catch(e) {}

    if (pending && Array.isArray(pending.cart) && pending.cart.length > 0) {
      // Só agora, com pagamento aprovado, a peça única fica indisponível
      for (const it of pending.cart) {
        try {
          await updateDoc(doc(db, "products", it.id.toString()), { status: 'indisponivel', stock: 0 });
        } catch(e) { console.error('Erro ao marcar vendido:', e); }
      }
      if (typeof addSale === 'function') addSale(pending.total || 0);
      if (typeof registerOrder === 'function') {
        await registerOrder(pending.cart, pending.total || 0, pending.wantsDelivery, 'InfinitePay');
      }
      localStorage.removeItem('lm_pending_checkout');
    }

    alert('🎉 Parabéns! Seu pagamento foi processado pela InfinitePay. Entraremos em contato para o envio do seu pedido!');
    window.history.replaceState(null, null, window.location.pathname);
  })();
}



/* ---------- ÁUDIO E NOTIFICAÇÃO SONORA DE PEDIDOS ---------- */
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

window.playOrderAlertSound = playOrderAlertSound;
function playOrderAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Tocar sequência de sino/campainha cristalina (C6 -> E6 -> G6 -> C7)
    const notes = [
      { freq: 1046.50, delay: 0.00, dur: 0.25 },
      { freq: 1318.51, delay: 0.16, dur: 0.30 },
      { freq: 1567.98, delay: 0.32, dur: 0.35 },
      { freq: 2093.00, delay: 0.48, dur: 0.70 }
    ];
    
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.delay);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + n.delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.delay + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.delay);
      osc.stop(ctx.currentTime + n.delay + n.dur);
    });
  } catch(err) {
    console.error('Erro na síntese de áudio:', err);
  }
}

// Botão de testar som
document.getElementById('testSoundBtn')?.addEventListener('click', () => {
  playOrderAlertSound();
  showToast('🔊 Som de alerta reproduzido com sucesso!');
});

// Botão de fechar banner de novo pedido
document.getElementById('dismissBannerBtn')?.addEventListener('click', () => {
  const b = document.getElementById('newOrderBanner');
  if (b) b.style.display = 'none';
});

/* ---------- PERSISTÊNCIA DE PEDIDOS NO FIRESTORE ---------- */
window.registerOrder = registerOrder;
async function registerOrder(items, total, wantsDelivery, method) {
  const orderId = `LM-${Date.now()}`;
  const orderData = {
    id: orderId,
    createdAt: Date.now(),
    items: items.map(it => ({
      id: it.id,
      name: it.name,
      color: it.color,
      size: it.selectedSize || it.size || 'Único',
      code: it.code || '',
      price: it.price,
      img: Array.isArray(it.img) ? (it.img[it.imgIdx || 0] || it.img[0]) : (it.img || '')
    })),
    total: total,
    wantsDelivery: Boolean(wantsDelivery),
    method: method, // 'InfinitePay' ou 'WhatsApp'
    status: 'pendente_separacao'
  };

  try {
    await setDoc(doc(db, "orders", orderId), orderData);
    console.log('Pedido registrado com sucesso no Firestore:', orderId);
    // Disparar notificação instantânea para o Telegram da dona
    if (typeof sendTelegramAlert === 'function') sendTelegramAlert(orderData);
  } catch(e) {
    console.error('Erro ao registrar pedido:', e);
  }
}

// Escuta em tempo real da coleção "orders"
const knownOrderIds = new Set();
let isInitialOrdersLoad = true;

onSnapshot(collection(db, "orders"), (snapshot) => {
  const orders = [];
  let hasNewPending = false;

  snapshot.forEach(docSnap => {
    const o = { docId: docSnap.id, ...docSnap.data() };
    orders.push(o);
    if (!isInitialOrdersLoad && o.status === 'pendente_separacao' && !knownOrderIds.has(o.id)) {
      hasNewPending = true;
    }
    knownOrderIds.add(o.id);
  });

  orders.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (hasNewPending) {
    playOrderAlertSound();
    showToast('🔔 NOVO PEDIDO RECEBIDO! Verifique a aba de Pedidos.');
    const banner = document.getElementById('newOrderBanner');
    if (banner) banner.style.display = 'block';
  }
  isInitialOrdersLoad = false;

  renderOrdersTab(orders);
});

// Renderizar aba de pedidos
function renderOrdersTab(orders) {
  const listEl = document.getElementById('adminOrdersList');
  const badgeEl = document.getElementById('admOrdersBadge');
  
  const pendingCount = orders.filter(o => o.status === 'pendente_separacao').length;
  if (badgeEl) {
    badgeEl.textContent = pendingCount;
    badgeEl.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }

  if (!listEl) return;

  if (orders.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--muted); font-size:0.92rem;">
        Nenhum pedido recebido ainda. Quando uma cliente comprar no site, o alarme tocará aqui e os detalhes da peça aparecerão instantaneamente! 🛎️
      </div>
    `;
    return;
  }

  listEl.innerHTML = orders.map(o => {
    const isPending = o.status === 'pendente_separacao';
    const dateObj = new Date(o.createdAt || Date.now());
    const dateFormatted = dateObj.toLocaleDateString('pt-BR') + ' às ' + dateObj.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

    return `
      <div class="order-card ${isPending ? 'pending' : 'completed'}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; border-bottom:1px solid var(--line); padding-bottom:10px; margin-bottom:12px;">
          <div>
            <strong style="font-size:1.05rem; color:var(--ink);">Pedido #${o.id}</strong>
            <span style="font-size:0.78rem; color:var(--muted); margin-left:8px;">${dateFormatted}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:12px; ${isPending ? 'background:#FEF3C7; color:#92400E;' : 'background:#DEF7EC; color:#03543F;'}">
              ${isPending ? '⏳ Aguardando Separação' : '✓ Peça Separada / Enviada'}
            </span>
            <span style="font-size:0.75rem; font-weight:600; padding:4px 8px; border-radius:10px; background:var(--blush); color:var(--ink);">
              ${o.method === 'InfinitePay' ? '💳 InfinitePay' : '💬 WhatsApp'}
            </span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
          ${(o.items || []).map(it => `
            <div style="display:flex; align-items:center; gap:12px; background:rgba(0,0,0,0.02); padding:8px 12px; border-radius:6px;">
              <img src="${it.img || placeholderImg}" style="width:48px; height:60px; object-fit:cover; border-radius:4px;">
              <div style="flex:1;">
                <strong style="color:var(--ink); font-size:0.92rem; display:block;">${it.name}</strong>
                <span style="font-size:0.78rem; color:var(--muted);">
                  Cor: <strong>${it.color}</strong> • Tamanho: <strong style="color:var(--rose-deep); font-size:0.84rem;">${it.size}</strong> ${it.code ? `• Ref: ${it.code}` : ''}
                </span>
              </div>
              <div style="font-weight:700; color:var(--ink); font-size:0.92rem;">${money(it.price)}</div>
            </div>
          `).join('')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-top:1px solid var(--line); padding-top:10px;">
          <div>
            <span style="font-size:0.8rem; color:var(--muted);">
              🚚 Envio: <strong>${o.wantsDelivery ? 'Frete Padrão (R$ 15,00)' : 'Cliente retira / paga Uber'}</strong>
            </span>
            <div style="font-size:1.05rem; font-weight:700; color:var(--ink); margin-top:2px;">
              Total: ${money(o.total || 0)}
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            ${isPending ? `
              <button type="button" class="mini-btn" data-orderdone="${o.id}" style="background:#1E7E34; color:#fff; border:none; padding:7px 14px; font-weight:700; font-size:0.8rem; border-radius:4px; cursor:pointer;">
                ✓ Marcar como Separado
              </button>
            ` : `
              <button type="button" class="mini-btn" data-orderreopen="${o.id}" style="background:#4F4352; color:#fff; border:none; padding:6px 12px; font-weight:600; font-size:0.76rem; border-radius:4px; cursor:pointer;">
                Reabrir Pedido
              </button>
            `}
            <button type="button" class="mini-btn" data-orderdel="${o.id}" style="background:#8B0000; color:#fff; border:none; padding:6px 10px; font-weight:600; font-size:0.76rem; border-radius:4px; cursor:pointer;">
              Excluir
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Ações nos botões de pedidos
document.addEventListener('click', async (e) => {
  const doneId = e.target.closest('[data-orderdone]')?.dataset.orderdone;
  const reopenId = e.target.closest('[data-orderreopen]')?.dataset.orderreopen;
  const delId = e.target.closest('[data-orderdel]')?.dataset.orderdel;

  if (doneId) {
    try {
      await updateDoc(doc(db, "orders", doneId), { status: 'separado' });
      showToast('Pedido marcado como separado / concluído! ✓');
    } catch(err) { console.error('Erro:', err); }
  }

  if (reopenId) {
    try {
      await updateDoc(doc(db, "orders", reopenId), { status: 'pendente_separacao' });
      showToast('Pedido reaberto como pendente.');
    } catch(err) { console.error('Erro:', err); }
  }

  if (delId) {
    if (confirm('Excluir este pedido do histórico?')) {
      try {
        await deleteDoc(doc(db, "orders", delId));
        showToast('Pedido removido.');
      } catch(err) { console.error('Erro:', err); }
    }
  }
});

// Limpar todos os pedidos
document.getElementById('clearOrdersBtn')?.addEventListener('click', async () => {
  if (confirm('Deseja apagar todo o histórico de pedidos da loja?')) {
    try {
      const snap = await getDocs(collection(db, "orders"));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, "orders", d.id));
      }
      showToast('Histórico de pedidos zerado com sucesso.');
    } catch(err) { console.error('Erro:', err); }
  }
});


/* ---------- INTEGRAÇÃO TELEGRAM (PUSH NOTIFICATIONS 24H) ---------- */
let tgConfig = { botToken: '', chatId: '', active: false };

// Escuta em tempo real da configuração do Telegram no Firestore
onSnapshot(doc(db, "store", "telegram"), (docSnap) => {
  if (docSnap.exists()) {
    tgConfig = { ...docSnap.data() };
    updateTelegramUI();
  }
});

function updateTelegramUI() {
  const tokenInput = document.getElementById('tgBotToken');
  const chatInput = document.getElementById('tgChatId');
  const badge = document.getElementById('tgStatusBadge');

  if (tokenInput && !tokenInput.value) tokenInput.value = tgConfig.botToken || '';
  if (chatInput && !chatInput.value) chatInput.value = tgConfig.chatId || '';

  if (badge) {
    if (tgConfig.botToken && tgConfig.chatId) {
      badge.textContent = '🟢 Alertas Ativos no Telegram';
      badge.style.background = '#DEF7EC';
      badge.style.color = '#03543F';
    } else {
      badge.textContent = '⚪ Não Configurado';
      badge.style.background = '#E5E7EB';
      badge.style.color = '#4B5563';
    }
  }
}

// Alternar exibição do painel de configuração do Telegram
document.getElementById('toggleTgConfigBtn')?.addEventListener('click', () => {
  const body = document.getElementById('tgConfigBody');
  if (body) {
    body.style.display = (body.style.display === 'none' || !body.style.display) ? 'block' : 'none';
  }
});

// Salvar configurações do Telegram no Firestore
document.getElementById('tgSaveBtn')?.addEventListener('click', async () => {
  const botToken = document.getElementById('tgBotToken')?.value.trim();
  const chatId = document.getElementById('tgChatId')?.value.trim();

  if (!botToken || !chatId) {
    alert('Por favor, preencha o Token do Bot e o Chat ID.');
    return;
  }

  try {
    await setDoc(doc(db, "store", "telegram"), {
      botToken: botToken,
      chatId: chatId,
      updatedAt: Date.now()
    });
    tgConfig = { botToken, chatId, active: true };
    updateTelegramUI();
    showToast('Configurações do Telegram salvas com sucesso! 📲');
  } catch(err) {
    console.error('Erro ao salvar Telegram:', err);
    showToast('Erro ao salvar configurações.');
  }
});

// Enviar alerta de teste para o Telegram
document.getElementById('tgTestBtn')?.addEventListener('click', async () => {
  const botToken = document.getElementById('tgBotToken')?.value.trim() || tgConfig.botToken;
  const chatId = document.getElementById('tgChatId')?.value.trim() || tgConfig.chatId;

  if (!botToken || !chatId) {
    alert('Preencha o Token do Bot e o Chat ID antes de enviar o teste.');
    return;
  }

  const testMsg = '🔔 <b>Venda Efetuada!!</b>\n\n' +
    '👗 <b>Item:</b> uma dose de paciência\n' +
    '💰 <b>Valor:</b> R$ 10.000,00\n\n' +
    '✨ <i>Teste de som e notificação concluído com sucesso!</i>';

  const btn = document.getElementById('tgTestBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Enviando...';
  btn.disabled = true;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMsg,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    if (data.ok) {
      alert('🎉 Alerta enviado com sucesso! Verifique seu Telegram no celular.');
      showToast('Notificação de teste enviada!');
    } else {
      throw new Error(data.description || 'Erro desconhecido');
    }
  } catch(err) {
    console.error('Erro no envio do teste:', err);
    alert('Não foi possível enviar a mensagem no Telegram. Verifique se o Token e o Chat ID estão corretos e se você já deu "Começar" na conversa com o bot.\n\nDetalhe: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Função para disparar mensagem de pedido para o Telegram
window.sendTelegramAlert = sendTelegramAlert;
async function sendTelegramAlert(orderData) {
  if (!tgConfig.botToken || !tgConfig.chatId) return;

  try {
    const itemsList = (orderData.items || []).map(it => {
      return `• <b>${it.name}</b>\n  - Cor: ${it.color}\n  - Tamanho: <b>${it.size}</b>\n  - Ref: ${it.code || 'N/A'}\n  - Preço: R$ ${Number(it.price || 0).toFixed(2).replace('.', ',')}`;
    }).join('\n\n');

    const envioTxt = orderData.wantsDelivery ? 'Frete Padrão (R$ 15,00)' : 'Cliente retira / paga Uber';
    const totalTxt = `R$ ${Number(orderData.total || 0).toFixed(2).replace('.', ',')}`;

    const message = `🔔 <b>NOVO PEDIDO NO SITE! - LM EXCLUSIVE</b>\n\n` +
      `📦 <b>Pedido:</b> #${orderData.id}\n` +
      `💳 <b>Pagamento:</b> ${orderData.method === 'InfinitePay' ? 'InfinitePay Online' : 'WhatsApp'}\n` +
      `🚚 <b>Envio:</b> ${envioTxt}\n` +
      `💰 <b>Total:</b> ${totalTxt}\n\n` +
      `👗 <b>Peças a Separar (Peça Única):</b>\n${itemsList}\n\n` +
      `⚠️ <i>Acesse o painel do site para marcar como separado!</i>`;

    await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgConfig.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    console.log('Alerta do pedido enviado para o Telegram com sucesso!');
  } catch(err) {
    console.error('Erro ao enviar alerta para o Telegram:', err);
  }
}


// Conectar Webhook do Bot para atendimento e catálogo automático na Vercel
document.getElementById('tgWebhookBtn')?.addEventListener('click', async () => {
  const botToken = document.getElementById('tgBotToken')?.value.trim() || tgConfig.botToken || '8777035783:AAGpUAyVw73WQpjuli0aRb7D729D4rVNvCI';
  const webhookUrl = 'https://lmstore-xi.vercel.app/api/telegram';

  const btn = document.getElementById('tgWebhookBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Conectando...';
  btn.disabled = true;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    if (data.ok) {
      alert('🎉 Sucesso! Seu bot agora responde clientes automaticamente 24h na Vercel com catálogo de fotos e tira-dúvidas!\n\nAbra o @Larystoreexclusive_bot e mande "oi" ou "/colecao" para testar!');
      showToast('Bot conectado para atendimento automático!');
    } else {
      throw new Error(data.description || 'Erro ao registrar webhook');
    }
  } catch(err) {
    console.error('Erro webhook:', err);
    alert('Erro ao ativar respostas automáticas: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});
