(()=>{
  const products=window.FORME_PRODUCTS, categories=window.FORME_CATEGORIES;
  const body=document.body, root=body.dataset.root||'', page=body.dataset.page||'home';
  const $=(selector,parent=document)=>parent.querySelector(selector);
  const $$=(selector,parent=document)=>[...parent.querySelectorAll(selector)];
  const eur=n=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const href=id=>`${root}products/${id}.html`;
  const photo=p=>`${root}assets/img/${p.id}.svg`;
  const find=id=>products.find(p=>p.id===id);
  const read=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(name))??fallback;}catch{return fallback;}};
  let cart=read('forme.cart',[]), favorites=read('forme.favorites',[]), searchOpen=false;
  const save=()=>{try{localStorage.setItem('forme.cart',JSON.stringify(cart));localStorage.setItem('forme.favorites',JSON.stringify(favorites));}catch(e){/* Some sandboxed previews disable storage. */}};
  const count=()=>cart.reduce((n,c)=>n+c.qty,0);
  const cartSum=()=>cart.reduce((n,c)=>n+find(c.id).price*c.qty,0);
  const svgIcon=(name)=>({
    bag:'<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    heart:'<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.7L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.7Z"/>',
    arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="M5 5 19 19M19 5 5 19"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
    chevron:'<path d="m7 10 5 5 5-5"/>',
    truck:'<path d="M3 5h12v12H3zM15 9h4l3 4v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
    shield:'<path d="m12 2 9 4v6c0 5-3 8-9 10-6-2-9-5-9-10V6l9-4Z"/><path d="m9 12 2 2 4-4"/>',
    refresh:'<path d="M20 11A8 8 0 0 0 6 5L4 7M4 3v4h4M4 13a8 8 0 0 0 14 6l2-2m0 4v-4h-4"/>',
    spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  })[name]||'';
  const icon=(name,size=20)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgIcon(name)}</svg>`;

  function header(){
    $('#site-header').innerHTML=`<div class="announcement">FREE SHIPPING ON ORDERS OVER €150 <span>✳</span> THE NEXT STEP STARTS HERE <span>✳</span> FREE SHIPPING ON ORDERS OVER €150</div>
     <header class="header-wrap glass"><a class="brand" href="${root}index.html" aria-label="FORME home"><span class="brand-mark"><i></i><i></i><i></i><i></i></span>forme<span class="brand-dot">.</span></a>
      <nav class="nav-links" aria-label="Main navigation"><a href="${root}shop.html" ${page==='shop'?'class="active"':''}>Shop all</a><a href="${root}category/sneakers.html" ${body.dataset.category==='sneakers'?'class="active"':''}>Sneakers</a><a href="${root}category/running.html" ${body.dataset.category==='running'?'class="active"':''}>Running</a><a href="${root}category/slides.html" ${body.dataset.category==='slides'?'class="active"':''}>Slides</a><a href="${root}category/boots.html" ${body.dataset.category==='boots'?'class="active"':''}>Boots</a></nav>
      <div class="header-actions"><button class="icon-button" data-search-open aria-label="Search products">${icon('search',21)}</button><button class="icon-button bag-button" data-cart-open aria-label="Open shopping bag">${icon('bag',21)}<span class="cart-count" aria-live="polite">${count()}</span></button><button class="icon-button mobile-menu-trigger" data-menu-open aria-label="Open menu">${icon('menu',23)}</button></div>
     </header>`;
    $('#overlays').innerHTML=`<div id="backdrop" class="overlay-backdrop" hidden></div>
      <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping bag" role="dialog" aria-modal="true" aria-hidden="true"></aside>
      <div id="search-modal" class="search-modal glass" role="dialog" aria-modal="true" aria-label="Search shoes" aria-hidden="true"><div class="search-top"><span>FIND YOUR FIT</span><button class="round-small" data-close aria-label="Close search">${icon('close')}</button></div><div class="big-search">${icon('search',28)}<input id="global-search" type="search" placeholder="Search sneakers, slides, boots..." autocomplete="off" aria-label="Search shoes"/></div><div class="search-results" id="global-search-results"></div></div>
      <div id="mobile-nav" class="mobile-nav glass" aria-hidden="true"><div class="mobile-nav-head"><span>EXPLORE</span><button class="round-small" data-close aria-label="Close menu">${icon('close')}</button></div>${[['Shop all','shop.html'],...categories.map(c=>[c.name,`category/${c.id}.html`])].map(([name,path])=>`<a href="${root}${path}">${name}${icon('arrow')}</a>`).join('')}</div>
      <div id="toast" role="status" aria-live="polite"></div>`;
    renderDrawer();
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-cart-open]'))showOverlay('cart');
      if(e.target.closest('[data-search-open]'))showOverlay('search');
      if(e.target.closest('[data-menu-open]'))showOverlay('menu');
      if(e.target.closest('[data-close]')||e.target.id==='backdrop')closeOverlays();
      const fav=e.target.closest('[data-favorite]');
      if(fav){e.preventDefault();toggleFav(fav.dataset.favorite);}
      const add=e.target.closest('[data-add-cart]');
      if(add){e.preventDefault();addItem(add.dataset.addCart,Number(add.dataset.size)||42);}
      const adjust=e.target.closest('[data-qty]');
      if(adjust){const [id,size,change]=adjust.dataset.qty.split('|');setQty(id,Number(size),Number(change));}
      if(e.target.closest('[data-demo-checkout]'))toast('Demo shop — no payments are connected.');
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlays();});
    $('#global-search').addEventListener('input',e=>renderSearch(e.target.value));
  }
  function showOverlay(which){
    closeOverlays();$('#backdrop').hidden=false;document.body.classList.add('no-scroll');
    const el=$(which==='cart'?'#cart-drawer':which==='search'?'#search-modal':'#mobile-nav');
    el.classList.add('open');el.setAttribute('aria-hidden','false');
    if(which==='cart')renderDrawer();
    if(which==='search'){renderSearch('');setTimeout(()=>$('#global-search').focus(),120);}
  }
  function closeOverlays(){
    $('#backdrop').hidden=true;document.body.classList.remove('no-scroll');
    for(const id of ['cart-drawer','search-modal','mobile-nav']){const el=document.getElementById(id);el.classList.remove('open');el.setAttribute('aria-hidden','true');}
  }
  function toast(message){let t=$('#toast');t.textContent=message;t.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('visible'),3300);}
  function updateCounts(){$$('.cart-count').forEach(el=>el.textContent=count());}
  function toggleFav(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();$$(`[data-favorite="${id}"]`).forEach(btn=>{btn.classList.toggle('is-favorite',favorites.includes(id));btn.setAttribute('aria-label',favorites.includes(id)?'Remove from favorites':'Add to favorites');});toast(favorites.includes(id)?'Added to your favorites':'Removed from favorites');}
  function addItem(id,size=42,qty=1,shade){let p=find(id);if(!p)return;let existing=cart.find(c=>c.id===id&&c.size===size&&c.color===(shade||p.color));if(existing)existing.qty+=qty;else cart.push({id,size,color:shade||p.color,qty});save();updateCounts();renderDrawer();showOverlay('cart');}
  function setQty(id,size,change){const item=cart.find(c=>c.id===id&&c.size===size);if(!item)return;item.qty+=change;cart=cart.filter(c=>c.qty>0);save();updateCounts();renderDrawer();if(page==='cart')renderCartPage();}
  function drawerLine(c){let p=find(c.id);return `<div class="drawer-item"><a href="${href(p.id)}" class="drawer-thumb" style="--tint:${p.bg}"><img src="${photo(p)}" alt="${p.name}"/></a><div class="drawer-item-details"><div class="micro muted">${p.type}</div><a class="drawer-name" href="${href(p.id)}">${p.name}</a><div class="micro muted">EU ${c.size} · ${c.color||p.color}</div><div class="drawer-item-bottom"><div class="qty-control"><button aria-label="Remove one" data-qty="${c.id}|${c.size}|-1">${icon('minus',14)}</button><span>${c.qty}</span><button aria-label="Add one" data-qty="${c.id}|${c.size}|1">${icon('plus',14)}</button></div><b>${eur(p.price*c.qty)}</b></div></div></div>`;}
  function renderDrawer(){let el=$('#cart-drawer');if(!el)return;let subtotal=cartSum(), remaining=Math.max(0,150-subtotal);el.innerHTML=`<div class="drawer-header"><div><span class="eyebrow">YOUR SELECTION</span><h2>Shopping bag <span class="muted">(${count()})</span></h2></div><button class="round-small" data-close aria-label="Close bag">${icon('close')}</button></div><div class="drawer-progress"><div>${remaining?`You're <b>${eur(remaining)}</b> away from free shipping`:'You unlocked free shipping!'}</div><div class="progress-track"><span style="width:${Math.min(100,subtotal/150*100)}%"></span></div></div><div class="drawer-body">${cart.length?cart.map(drawerLine).join(''):`<div class="empty-bag"><div class="empty-icon">${icon('bag',42)}</div><h3>Your bag is waiting.</h3><p>Looks like you haven't added anything yet.</p><a href="${root}shop.html" class="btn btn-primary" data-close>Explore shoes ${icon('arrow')}</a></div>`}</div><div class="drawer-footer">${cart.length?`<div class="sum-row"><span>Subtotal</span><b>${eur(subtotal)}</b></div><p class="tiny muted">Shipping and taxes calculated at checkout.</p><a class="btn btn-primary full" href="${root}cart.html">View shopping bag ${icon('arrow')}</a>`:`<p class="tiny muted center">Built for your next move.</p>`}</div>`;}
  function renderSearch(q){q=(q||'').trim().toLowerCase();const found=products.filter(p=>(p.name+' '+p.type+' '+p.category+' '+p.color).toLowerCase().includes(q)).slice(0,7);$('#global-search-results').innerHTML=`<div class="search-section-label">${q?`${found.length} RESULTS`:'POPULAR RIGHT NOW'}</div>${found.length?found.map(p=>`<a href="${href(p.id)}" class="search-result"><span class="search-result-image" style="--tint:${p.bg}"><img src="${photo(p)}" alt="" /></span><span><b>${p.name}</b><small>${p.type}</small></span><strong>${eur(p.price)}</strong>${icon('arrow',17)}</a>`).join(''):'<p class="muted" style="padding:22px 0">No matches. Try a different search.</p>'}`;}
  function productCard(p,index=0){return `<article class="product-card" style="--card-tint:${p.bg};--card-accent:${p.accent};animation-delay:${Math.min(index,8)*60}ms"><a href="${href(p.id)}" class="product-image-link" aria-label="View ${p.name}"><div class="product-visual"><div class="product-halo"></div><img src="${photo(p)}" alt="Illustration of ${p.name}" /></div>${p.tag?`<span class="product-tag ${p.tagType||''}">${p.tag}</span>`:''}</a><button class="favorite-button ${favorites.includes(p.id)?'is-favorite':''}" aria-label="${favorites.includes(p.id)?'Remove from':'Add to'} favorites" data-favorite="${p.id}">${icon('heart',19)}</button><div class="product-info"><div><p class="product-type">${p.type}</p><a href="${href(p.id)}" class="product-title">${p.name}</a></div><div class="product-price">${eur(p.price)}${p.oldPrice?`<s>${eur(p.oldPrice)}</s>`:''}</div></div><div class="card-lower"><span class="color-note"><i style="background:${p.bg}"></i>${p.color}</span><a class="card-shop-link" href="${href(p.id)}" aria-label="Shop ${p.name}">${icon('arrow',17)}</a></div></article>`;}
  function renderHome(){
    document.title='FORME. — Move different.';
    const featured=[find('aero-01'),find('velocity-runner'),find('cloud-slide'),find('mono-hi')];
    $('#app').innerHTML=`<section class="hero site-width"><div class="hero-atmosphere orb-purple"></div><div class="hero-atmosphere orb-green"></div>
      <div class="hero-copy"><div class="hero-kicker"><span class="kicker-line"></span>THE FUTURE LOOKS GOOD ON YOU <span class="kicker-star">✳</span></div><h1>MAKE<br/>YOUR <span>MOVE<span class="hero-period">.</span></span></h1><p>Where everyday comfort meets a little extraordinary. Find the pair that moves the way you do.</p><div class="hero-buttons"><a class="btn btn-primary" href="${root}shop.html">Explore the collection ${icon('arrow',18)}</a><a class="btn btn-ghost" href="${root}category/sneakers.html">Shop sneakers ${icon('arrow',17)}</a></div><div class="hero-stats"><div><b>12</b><small>CURATED STYLES</small></div><span></span><div><b>4</b><small>COLLECTIONS</small></div><span></span><div><b>∞</b><small>WAYS TO MOVE</small></div></div></div>
      <div class="hero-showcase"><div class="hero-showcase-glass glass"><div class="hero-floating-id">01 / 12 <span>THE NEW ESSENTIAL</span></div><div class="showcase-rings"><i></i><i></i><i></i></div><img class="hero-shoe" src="${photo(find('aero-01'))}" alt="Aero 01 sneaker" /><div class="hero-shoe-name">AERO <span>01</span></div><div class="hero-showcase-bottom"><div><span class="mini-label">THE EVERYDAY ICON</span><b>Designed to feel different.</b></div><a href="${href('aero-01')}" class="circle-arrow" aria-label="Shop Aero 01">${icon('arrow',22)}</a></div></div><div class="hero-sticker">NEW<br/>DROP <span>✳</span></div></div>
      <div class="hero-side-label">SCROLL TO EXPLORE — 2026</div></section>
      <section class="ticker" aria-label="Brand values"><div class="ticker-inner">MADE FOR YOUR EVERYDAY <span>✳</span> ELEVATE THE ORDINARY <span>✳</span> FIND YOUR FORM <span>✳</span> MADE FOR YOUR EVERYDAY <span>✳</span> ELEVATE THE ORDINARY <span>✳</span> FIND YOUR FORM <span>✳</span></div></section>
      <section class="section-wrap site-width" id="collections"><div class="section-heading"><div><div class="eyebrow">01 / THE LINEUP</div><h2>Find your <em>kind of move.</em></h2></div><p>Different days call for different energy. We have a pair for all of them.</p></div><div class="category-grid">${categories.map((c,i)=>`<a class="category-card glass" href="${root}category/${c.id}.html" style="--cat-tint:${find(c.featured).bg}"><span class="category-index">0${i+1} / EXPLORE</span><img src="${photo(find(c.featured))}" alt="${c.name}"/><span class="category-bottom"><span><b>${c.name}</b><small>${c.sub}</small></span><span class="circle-arrow small">${icon('arrow',18)}</span></span></a>`).join('')}</div></section>
      <section class="section-wrap site-width" id="featured"><div class="section-heading"><div><div class="eyebrow">02 / MOST WANTED</div><h2>Good things <em>move fast.</em></h2></div><a class="text-link" href="${root}shop.html">View all shoes ${icon('arrow',18)}</a></div><div class="product-grid">${featured.map(productCard).join('')}</div></section>
      <section class="campaign site-width"><div class="campaign-shine"></div><div class="campaign-content"><span class="eyebrow">A LITTLE MORE THAN FOOTWEAR</span><h2>DON'T JUST<br/>SHOW UP.<br/><em>STAND OUT.</em></h2><p>For the commutes, the detours, the moments in between. Your next chapter starts at ground level.</p><a href="${root}shop.html" class="btn btn-light">Find your fit ${icon('arrow',18)}</a></div><img src="${photo(find('mono-hi'))}" alt="Mono Hi sneaker"/><span class="campaign-decoration">FORME / 001</span></section>
      ${benefits()}${newsletter()}`;
  }
  function benefits(){return `<section class="benefits site-width"><div>${icon('truck',27)}<span><b>Free shipping over €150</b><small>Little perks, big moves.</small></span></div><div>${icon('refresh',27)}<span><b>30-day easy returns</b><small>Take the time to find your fit.</small></span></div><div>${icon('shield',27)}<span><b>Comfort, considered</b><small>Made for life's daily adventures.</small></span></div></section>`;}
  function newsletter(){return `<section class="newsletter site-width"><div><div class="eyebrow">THE GOOD STUFF, FIRST</div><h2>Get on the <em>inside.</em></h2><p>New drops, first looks, and occasional reasons to check your inbox.</p></div><form id="newsletter-form" class="newsletter-form"><label for="email">YOUR EMAIL ADDRESS</label><div><input type="email" required id="email" placeholder="you@example.com"/><button type="submit" aria-label="Join newsletter">${icon('arrow',23)}</button></div><small>No spam, just good shoes. Demo signup only.</small></form></section>`;}
  function renderListing(){
    const category=body.dataset.category||'', isCat=Boolean(category), cat=categories.find(c=>c.id===category), title=isCat?cat.name:'All shoes', desc=isCat?({sneakers:'The everyday icons. Uncomplicated comfort, unmistakable style.',running:'Find your pace, find your flow. Movement starts here.',slides:'Comfort on your own terms. Go off duty in style.',boots:'Weather the day. Take the road less ordinary.'})[category]:'A little something for every version of you. Discover your next favorite pair.';
    document.title=`${title} — FORME.`;
    $('#app').innerHTML=`<section class="listing-header site-width"><div class="eyebrow">HOME / ${isCat?cat.name.toUpperCase():'THE COLLECTION'}</div><div class="listing-heading"><div><h1>${title}<span class="title-spark">✳</span></h1><p>${desc}</p></div><div class="collection-number">${(isCat?products.filter(p=>p.category===category):products).length.toString().padStart(2,'0')}<span>STYLES</span></div></div></section>
     <section class="site-width shop-layout"><div class="shop-controls"><div class="filter-chips"><a href="${root}shop.html" class="filter-chip ${!isCat?'selected':''}">All shoes</a>${categories.map(c=>`<a href="${root}category/${c.id}.html" class="filter-chip ${category===c.id?'selected':''}">${c.name}</a>`).join('')}</div><div class="sort-control"><span id="result-count">${products.length} products</span><label for="sort-by">SORT BY</label><select id="sort-by" aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select>${icon('chevron',14)}</div></div><div class="product-grid shop-grid" id="listing-grid"></div></section>${benefits()}${newsletter()}`;
    let pool=products.filter(p=>!category||p.category===category);
    const display=()=>{let arr=[...pool],sort=$('#sort-by').value;if(sort==='price-low')arr.sort((a,b)=>a.price-b.price);if(sort==='price-high')arr.sort((a,b)=>b.price-a.price);if(sort==='name')arr.sort((a,b)=>a.name.localeCompare(b.name));$('#listing-grid').innerHTML=arr.map(productCard).join('');$('#result-count').textContent=`${arr.length} products`;};
    $('#sort-by').addEventListener('change',display);display();
  }
  function renderProduct(){
    let p=find(body.dataset.product);if(!p){$('#app').innerHTML='<h1>Product not found</h1>';return;}
    document.title=`${p.name} — FORME.`;
    let selectedSize=null,selectedColor=p.color;
    $('#app').innerHTML=`<main class="product-detail site-width"><div class="breadcrumb"><a href="${root}index.html">Home</a><span>/</span><a href="${root}category/${p.category}.html">${p.category}</a><span>/</span><span>${p.name}</span></div>
      <div class="detail-layout"><div class="detail-media"><div class="detail-image glass" style="--detail-tint:${p.bg}"><div class="detail-image-ring"></div><span class="detail-top-note">FORME / ${p.id.toUpperCase()}</span><img src="${photo(p)}" alt="${p.name} in ${p.color}"/><div class="detail-image-bottom"><span>01 / 01</span><span>MADE TO MOVE DIFFERENT</span></div></div><div class="detail-mini-row"><div class="detail-mini glass">${icon('spark',24)}<span>Thoughtfully designed<br/>for everyday movement.</span></div><div class="detail-mini glass">${icon('truck',24)}<span>Free delivery<br/>over €150.</span></div></div></div>
      <div class="detail-summary"><span class="eyebrow">${p.type.toUpperCase()} / FORME ORIGINALS</span><div class="detail-title-row"><h1>${p.name}</h1><button class="favorite-button detail-favorite ${favorites.includes(p.id)?'is-favorite':''}" data-favorite="${p.id}" aria-label="Add to favorites">${icon('heart',21)}</button></div><div class="detail-rating"><span class="rating-stars">★★★★★</span><span>Designed for everyday comfort</span></div><div class="detail-price">${eur(p.price)} ${p.oldPrice?`<s>${eur(p.oldPrice)}</s>`:''}</div><p class="detail-description">${p.description}</p>
      <div class="selection-block"><div class="selection-label"><span>COLOR</span><b id="color-name">${p.color}</b></div><div class="swatches">${p.colors.map((color,i)=>`<button class="swatch ${i===0?'active':''}" style="--swatch:${i===0?p.bg:i===1?'#f0ece4':'#343844'}" data-shade="${color}" title="${color}" aria-label="Select ${color}" aria-pressed="${i===0}"><i></i></button>`).join('')}</div></div>
      <div class="selection-block"><div class="selection-label"><span>SELECT SIZE <small>(EU)</small></span><button class="size-guide" id="size-guide-btn">Size guide ${icon('arrow',13)}</button></div><div class="size-list" id="size-list">${p.sizes.map(s=>`<button class="size-button" data-size="${s}" aria-pressed="false">${s}</button>`).join('')}</div><p class="size-error" id="size-error" hidden>Please select a size first.</p></div>
      <button class="btn btn-primary add-product" id="detail-add">Add to bag — ${eur(p.price)} ${icon('arrow',20)}</button><div class="details-under">${icon('truck',20)} <span>Free shipping on orders over €150</span></div>
      <div class="details-accordion"><details open><summary>Product details ${icon('plus',19)}</summary><ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul></details><details><summary>Shipping & returns ${icon('plus',19)}</summary><p>Demo storefront. We show free-shipping eligibility above €150 and a sample 30-day return policy. No real orders are processed.</p></details></div></div></div></main>
      <section class="section-wrap site-width recommended"><div class="section-heading"><div><div class="eyebrow">MORE TO EXPLORE</div><h2>You might also <em>like.</em></h2></div><a href="${root}shop.html" class="text-link">See all ${icon('arrow',18)}</a></div><div class="product-grid">${products.filter(x=>x.id!==p.id&&x.category===p.category).concat(products.filter(x=>x.category!==p.category)).slice(0,4).map(productCard).join('')}</div></section>${benefits()}`;
    $$('.size-button').forEach(btn=>btn.addEventListener('click',()=>{selectedSize=Number(btn.dataset.size);$$('.size-button').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',b===btn?'true':'false');});$('#size-error').hidden=true;}));
    $$('.swatch').forEach(btn=>btn.addEventListener('click',()=>{selectedColor=btn.dataset.shade;$('#color-name').textContent=selectedColor;$$('.swatch').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',b===btn?'true':'false');});}));
    $('#detail-add').addEventListener('click',()=>{if(!selectedSize){$('#size-error').hidden=false;$('#size-list').scrollIntoView({block:'center',behavior:'smooth'});return;}addItem(p.id,selectedSize,1,selectedColor);});
    $('#size-guide-btn').addEventListener('click',()=>toast('EU sizing: choose your usual size. This is a demo store.'));
  }
  function renderCartPage(){
    document.title='Shopping bag — FORME.';let subtotal=cartSum();
    $('#app').innerHTML=`<main class="cart-page site-width"><div class="eyebrow">YOUR NEXT MOVE</div><div class="cart-page-title"><h1>Shopping bag<span class="lime">.</span></h1><span>${count()} ${count()===1?'ITEM':'ITEMS'}</span></div>${cart.length?`<div class="cart-page-layout"><div class="cart-items glass">${cart.map(c=>`<div class="cart-page-item">${drawerLine(c)}</div>`).join('')}</div><aside class="order-summary glass"><div class="eyebrow">ORDER OVERVIEW</div><h2>Summary</h2><div class="summary-line"><span>Subtotal</span><b>${eur(subtotal)}</b></div><div class="summary-line"><span>Shipping</span><b>${subtotal>=150?'FREE':'Calculated later'}</b></div><div class="summary-total"><span>Estimated total</span><b>${eur(subtotal)}</b></div><button class="btn btn-primary full" data-demo-checkout>Continue to checkout ${icon('arrow',18)}</button><p class="tiny muted">Demo only. Payments and orders are not enabled.</p></aside></div>`:`<div class="cart-empty glass"><div>${icon('bag',54)}</div><h2>Nothing in the bag. Yet.</h2><p>Your next favorite pair is one click away.</p><a class="btn btn-primary" href="${root}shop.html">Explore the collection ${icon('arrow',18)}</a></div>`}</main>${benefits()}`;
  }
  function footer(){
    $('#site-footer').innerHTML=`<footer class="footer site-width"><div class="footer-top"><div class="footer-brand"><a class="brand" href="${root}index.html"><span class="brand-mark"><i></i><i></i><i></i><i></i></span>forme<span class="brand-dot">.</span></a><p>For moving through life in your own way. Considered shoes. Uncomplicated style.</p></div><div class="footer-column"><b>DISCOVER</b><a href="${root}shop.html">Shop all</a><a href="${root}category/sneakers.html">Sneakers</a><a href="${root}category/running.html">Running</a><a href="${root}category/slides.html">Slides</a><a href="${root}category/boots.html">Boots</a></div><div class="footer-column"><b>THE DETAILS</b><a href="${root}cart.html">Shopping bag</a><a href="${root}shop.html">Shop the collection</a><a href="#top">Back to top</a></div><div class="footer-wordmark">MOVE<br/>DIFFERENT<span>.</span></div></div><div class="footer-bottom"><span>© 2026 FORME. Concept storefront.</span><span>MADE FOR EVERY KIND OF MOVE <b>✳</b></span><span>Designed as a demo. No real orders.</span></div></footer>`;
  }
  header();footer();
  if(page==='home')renderHome();
  if(page==='shop'||page==='category')renderListing();
  if(page==='product')renderProduct();
  if(page==='cart')renderCartPage();
  const newsletterForm=$('#newsletter-form');
  if(newsletterForm)newsletterForm.addEventListener('submit',e=>{e.preventDefault();let email=$('#email').value;newsletterForm.innerHTML='<div class="newsletter-success">'+icon('check',24)+' You’re on the list (demo). Thanks!</div>';try{localStorage.setItem('forme.newsletter',email);}catch(e){}});
})();
