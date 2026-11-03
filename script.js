const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;

// Sample products: edit names, prices and images to match your real catalog.
const PRODUCTS = [
  { id: 1, name: "Pearl Drop Necklace", cat: ["Necklaces", "Silver"], price: 59, rating: 5, reviews: 48, img: U("photo-1599643478518-a784e5dc4c8f") },
  { id: 2, name: "Golden Halo Ring", cat: ["Rings", "Stainless Steel"], price: 39, rating: 5, reviews: 36, img: U("photo-1605100804763-247f67b3557e") },
  { id: 3, name: "Classic Link Bracelet", cat: ["Bracelets", "Stainless Steel"], price: 45, rating: 4, reviews: 27, img: U("photo-1611591437281-460bfbe1220a") },
  { id: 4, name: "Sterling Silver Chain", cat: ["Necklaces", "Silver"], price: 69, rating: 5, reviews: 52, img: U("photo-1573408301185-9146fe634ad0") },
  { id: 5, name: "Luna Steel Ring Set", cat: ["Rings", "Stainless Steel"], price: 34, rating: 4, reviews: 19, img: U("photo-1602173574767-37ac01994b2a") },
  { id: 6, name: "Aurora Pendant", cat: ["Necklaces"], price: 54, rating: 5, reviews: 41, img: U("photo-1535632066927-ab7c9ab60908") },
  { id: 7, name: "Silver Bangle", cat: ["Bracelets", "Silver"], price: 49, rating: 4, reviews: 22, img: U("photo-1611652022419-a9419f74343d") },
  { id: 8, name: "Gold Tone Layered Necklace", cat: ["Necklaces", "Stainless Steel"], price: 62, rating: 5, reviews: 33, img: U("photo-1515562141207-7a88fb7ce338") }
];
const CATS = ["All", "Necklaces", "Rings", "Bracelets", "Silver", "Stainless Steel"];

const $ = s => document.querySelector(s);
const money = n => "$" + n.toFixed(2);
let cart = [];
try { cart = JSON.parse(localStorage.getItem("wpa-cart")) || []; } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem("wpa-cart", JSON.stringify(cart)); } catch (e) {} };

/* Products + filters */
const grid = $("#products"), filters = $("#filters");
filters.innerHTML = CATS.map((c, i) => `<button role="tab" data-c="${c}" class="${i ? "" : "active"}">${c}</button>`).join("");

function renderProducts(filter = "All") {
  const list = PRODUCTS.filter(p => filter === "All" || p.cat.includes(filter));
  grid.innerHTML = list.map((p, i) => `
    <article class="card" style="animation-delay:${i * 60}ms">
      <div class="img"><img loading="lazy" src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"></div>
      <div class="body">
        <span class="tag">${p.cat[0]}</span>
        <h3>${p.name}</h3>
        <div class="stars" aria-label="${p.rating} out of 5">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)} <span class="rate">(${p.reviews})</span></div>
        <div class="row"><span class="price">${money(p.price)}</span><button class="add" data-id="${p.id}">Add to cart</button></div>
      </div>
    </article>`).join("");
}
function setFilter(c) {
  filters.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.c === c));
  renderProducts(c);
}
filters.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setFilter(b.dataset.c); });
document.querySelectorAll(".cat").forEach(b => b.addEventListener("click", () => {
  setFilter(b.dataset.filter);
  $("#collections").scrollIntoView({ behavior: "smooth" });
}));
grid.addEventListener("click", e => {
  const b = e.target.closest(".add");
  if (!b) return;
  addToCart(+b.dataset.id);
  b.textContent = "Added ✓";
  setTimeout(() => (b.textContent = "Add to cart"), 1200);
});

/* Cart */
function addToCart(id) {
  const l = cart.find(i => i.id === id);
  l ? l.qty++ : cart.push({ id, qty: 1 });
  updateCart();
  const bd = $("#badge"); bd.classList.add("pop"); setTimeout(() => bd.classList.remove("pop"), 250);
}
function updateCart() {
  save();
  $("#badge").textContent = cart.reduce((s, i) => s + i.qty, 0);
  const box = $("#cartItems");
  if (!cart.length) box.innerHTML = '<p class="empty">Your cart is empty.</p>';
  else box.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `<div class="line">
      <img src="${p.img}" alt="${p.name}">
      <div><h4>${p.name}</h4><small>${money(p.price)}</small>
        <div class="qty"><button data-act="dec" data-id="${p.id}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-act="inc" data-id="${p.id}" aria-label="Increase">+</button></div></div>
      <button class="rm" data-act="rm" data-id="${p.id}">Remove</button></div>`;
  }).join("");
  $("#subtotal").textContent = money(cart.reduce((s, i) => s + i.qty * PRODUCTS.find(x => x.id === i.id).price, 0));
}
$("#cartItems").addEventListener("click", e => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const id = +b.dataset.id, l = cart.find(i => i.id === id);
  if (b.dataset.act === "inc") l.qty++;
  if (b.dataset.act === "dec") l.qty--;
  if (b.dataset.act === "rm" || l.qty < 1) cart = cart.filter(i => i.id !== id);
  updateCart();
});
const drawer = $("#drawer"), overlay = $("#overlay");
function toggleCart(open) {
  drawer.classList.toggle("open", open);
  overlay.classList.toggle("show", open);
  drawer.setAttribute("aria-hidden", !open);
  document.body.style.overflow = open ? "hidden" : "";
}
$("#cartBtn").addEventListener("click", () => toggleCart(true));
$("#closeCart").addEventListener("click", () => toggleCart(false));
overlay.addEventListener("click", () => toggleCart(false));
document.addEventListener("keydown", e => { if (e.key === "Escape") toggleCart(false); });
$("#checkout").addEventListener("click", () => {
  $("#cartMsg").textContent = cart.length
    ? "Online checkout is not connected yet. Connect a payment provider to go live."
    : "Add a piece to your cart first.";
});

/* Nav */
const nav = $("#nav"), burger = $("#burger"), links = $("#links");
const onScroll = () => nav.classList.toggle("solid", scrollY > 60);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
burger.addEventListener("click", () => {
  const o = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", o);
  nav.classList.toggle("solid", o || scrollY > 60);
});
links.addEventListener("click", e => {
  if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); }
});

/* FAQ accordion */
document.querySelectorAll(".q").forEach(q => q.addEventListener("click", () => {
  const item = q.parentElement, open = !item.classList.contains("open");
  document.querySelectorAll(".item").forEach(i => { i.classList.remove("open"); i.querySelector(".q").setAttribute("aria-expanded", false); });
  item.classList.toggle("open", open);
  q.setAttribute("aria-expanded", open);
}));

/* Scroll reveal */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 5) * 70 + "ms"; io.observe(el); });

/* Newsletter (demo: nothing is sent or stored) */
$("#news").addEventListener("submit", e => {
  e.preventDefault();
  $("#newsMsg").textContent = "Thank you! Newsletter sign-up is not connected yet.";
  e.target.reset();
});

$("#year").textContent = new Date().getFullYear();
renderProducts();
updateCart();
