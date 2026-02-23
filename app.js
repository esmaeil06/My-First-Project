// Mini Shop app.js
const products = [
	{ id: 1, title: 'Cozy Mug', price: 12.99, img: 'https://picsum.photos/seed/mug/400/300', desc: 'A warm mug for your coffee.' },
	{ id: 2, title: 'Comfort Tee', price: 19.5, img: 'https://picsum.photos/seed/tee/400/300', desc: 'Soft cotton tee.' },
	{ id: 3, title: 'Notebook', price: 8.25, img: 'https://picsum.photos/seed/notebook/400/300', desc: 'Handy notebook for ideas.' },
	{ id: 4,    title: 'Desk Plant', price: 14.0, img: 'https://picsum.photos/seed/plant/400/300', desc: 'Low-maintenance desk plant.' }
];

let cart = JSON.parse(localStorage.getItem('mini_cart') || '[]');

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function formatCurrency(n){return '$' + n.toFixed(2)}

function renderProducts(list = products){
	const root = document.getElementById('products');
	root.innerHTML = '';
	list.forEach(p => {
		const el = document.createElement('article');
		el.className = 'product';
		el.innerHTML = `
			<img src="${p.img}" alt="${p.title}" />
			<div class="product-body">
				<h3 class="product-title">${p.title}</h3>
				<div class="product-desc">${p.desc}</div>
				<div class="product-meta">
					<div class="price">${formatCurrency(p.price)}</div>
					<button class="btn primary" data-id="${p.id}">Add</button>
				</div>
			</div>
		`;
		root.appendChild(el);
	});
	root.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click',e=>addToCart(Number(e.currentTarget.dataset.id))));
}

function saveCart(){localStorage.setItem('mini_cart', JSON.stringify(cart));}

function addToCart(id){
	const p = products.find(x=>x.id===id); if(!p) return;
	const item = cart.find(i=>i.id===id);
	if(item) item.qty++;
	else cart.push({id:p.id,title:p.title,price:p.price,img:p.img,qty:1});
	saveCart(); renderCart();
}

function removeFromCart(id){cart = cart.filter(i=>i.id!==id); saveCart(); renderCart();}

function changeQty(id, delta){
	const it = cart.find(i=>i.id===id); if(!it) return;
	it.qty += delta; if(it.qty < 1) removeFromCart(id); else {saveCart(); renderCart()}
}

function renderCart(){
	const root = document.getElementById('cart-items');
	const totalEl = document.getElementById('cart-total');
	const countEl = document.getElementById('cart-count');
	root.innerHTML = '';
	if(cart.length===0){root.innerHTML = '<li class="empty">Your cart is empty</li>'; totalEl.textContent = formatCurrency(0); countEl.textContent = '0'; return}
	let total = 0; let count = 0;
	cart.forEach(i=>{
		total += i.price * i.qty; count += i.qty;
		const li = document.createElement('li');
		li.innerHTML = `
			<img src="${i.img}" alt="${i.title}" />
			<div style="flex:1">
				<div style="font-weight:600">${i.title}</div>
				<div class="muted">${formatCurrency(i.price)} × ${i.qty}</div>
			</div>
			<div class="quantity">
				<button class="btn" data-action="dec" data-id="${i.id}">-</button>
				<div>${i.qty}</div>
				<button class="btn" data-action="inc" data-id="${i.id}">+</button>
				<button class="btn" data-action="rm" data-id="${i.id}">Remove</button>
			</div>
		`;
		root.appendChild(li);
	});
	totalEl.textContent = formatCurrency(total);
	countEl.textContent = String(count);

	root.querySelectorAll('button[data-action]').forEach(b=>{
		const id = Number(b.dataset.id);
		const act = b.dataset.action;
		b.addEventListener('click',()=>{
			if(act==='dec') changeQty(id,-1);
			if(act==='inc') changeQty(id,1);
			if(act==='rm') removeFromCart(id);
		});
	});
}

function toggleCart(open){
	const cartEl = document.getElementById('cart');
	if(open){cartEl.classList.add('open');cartEl.classList.remove('hidden');cartEl.setAttribute('aria-hidden','false')}
	else {cartEl.classList.remove('open');cartEl.classList.add('hidden');cartEl.setAttribute('aria-hidden','true')}
}

document.addEventListener('DOMContentLoaded',()=>{
	renderProducts(); renderCart();
	document.getElementById('cartBtn').addEventListener('click',()=>toggleCart(true));
	document.getElementById('closeCart').addEventListener('click',()=>toggleCart(false));
	document.getElementById('checkout').addEventListener('click',()=>alert('Checkout is stubbed for demo.'));
	document.getElementById('search').addEventListener('input',e=>{
		const q = e.target.value.trim().toLowerCase();
		if(!q) renderProducts(); else renderProducts(products.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)));
	});
});