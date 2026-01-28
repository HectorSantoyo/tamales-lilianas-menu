const sectionGrid = document.getElementById("sectionGrid");
const itemGrid = document.getElementById("itemGrid");
const home = document.getElementById("home");
const sectionView = document.getElementById("section");
const sectionTitle = document.getElementById("sectionTitle");
const backBtn = document.getElementById("backBtn");

/* Modal elements */
const modal = document.getElementById("itemModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalNotes = document.getElementById("modalNotes");
const modalPrice = document.getElementById("modalPrice");
const modalVariants = document.getElementById("modalVariants");

let currentCat = null;

function money(value){
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
}

function getVariants(it){
  // Supports both schemas: it.pricing.variants or it.variants
  const v1 = it?.pricing?.type === "variants" ? it.pricing.variants : null;
  const v2 = Array.isArray(it?.variants) ? it.variants : null;
  const variants = Array.isArray(v1) ? v1 : (Array.isArray(v2) ? v2 : []);
  return variants
    .filter(v => v && (v.name || v.price !== undefined))
    .map(v => ({
      name: String(v.name ?? "Opción").trim(),
      price: v.price
    }));
}

function getSinglePrice(it){
  // Supports: it.pricing.type single or it.price
  if (it?.pricing?.type === "single" && it.pricing.price !== undefined) return it.pricing.price;
  if (it?.price !== undefined) return it.price;
  return null;
}

function getPriceSummary(it){
  const single = getSinglePrice(it);
  if (single !== null && single !== undefined && single !== "") return money(single);

  const vars = getVariants(it);
  const prices = vars.map(v => Number(v.price)).filter(n => Number.isFinite(n));
  if (!prices.length) return "";

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return money(min);
  return `${money(min)} – ${money(max)}`;
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function renderVariantsBlock(variants){
  if (!variants.length) return "";
  return `
    <div class="variant-list">
      ${variants.map(v => `
        <div class="variant-row">
          <span class="variant-name">${escapeHtml(v.name)}</span>
          <span class="variant-dots"></span>
          <span class="variant-price">${money(v.price)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

fetch("menu.json").then(r=>r.json()).then(data=>{
  const cats = data.categories || data;
  cats.forEach(cat=>{
    const card = document.createElement("div");
    card.className = "section-card";
    card.innerHTML = `
      <div class="section-img" style="background-image:url(${cat.image || ""})"></div>
      <div class="section-content">
        <h3>${cat.category || cat.name}</h3>
        <p>${cat.items.length} platillos</p>
      </div>`;
    card.onclick = () => openSection(cat);
    sectionGrid.appendChild(card);
  });
});

function openSection(cat){
  currentCat = cat;
  home.classList.remove("active");
  sectionView.classList.add("active");
  sectionTitle.textContent = cat.category || cat.name;

  itemGrid.innerHTML = "";
  (cat.items || []).forEach(it=>{
    const variants = getVariants(it);
    const priceSummary = getPriceSummary(it);

    const card = document.createElement("div");
    card.className = "item-card";
    card.tabIndex = 0; // a11y focus

    card.innerHTML = `
      <div class="item-img" style="background-image:url(${it.image || ""})"></div>
      <div class="item-content">
        <div class="item-head">
          <h4>${escapeHtml(it.name)}</h4>
          ${priceSummary ? `<div class="price">${escapeHtml(priceSummary)}</div>` : ``}
        </div>
        ${it.description ? `<p>${escapeHtml(it.description)}</p>` : ``}
        ${variants.length ? renderVariantsBlock(variants) : ``}
        ${it.notes ? `<p class="notes">${escapeHtml(it.notes)}</p>` : ``}
      </div>
    `;

    card.addEventListener("click", () => openItemModal(it));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openItemModal(it);
      }
    });

    itemGrid.appendChild(card);
  });

  // scroll top so the fixed back button is consistent
  window.scrollTo({ top: 0, behavior: "instant" });
}

backBtn.onclick = () => {
  sectionView.classList.remove("active");
  home.classList.add("active");
  currentCat = null;
  window.scrollTo({ top: 0, behavior: "instant" });
};

/* Modal logic */
function openItemModal(it){
  // Image
  const img = it.image || "";
  if (img){
    modalImg.style.backgroundImage = `url(${img})`;
    modalImg.classList.remove("noimg");
  } else {
    modalImg.style.backgroundImage = "";
    modalImg.classList.add("noimg");
  }

  modalTitle.textContent = it.name || "";
  modalDesc.textContent = it.description || "";
  modalDesc.style.display = it.description ? "" : "none";

  modalNotes.textContent = it.notes || "";
  modalNotes.style.display = it.notes ? "" : "none";

  // Pricing
  const variants = getVariants(it);
  const single = getSinglePrice(it);

  modalVariants.innerHTML = "";
  modalPrice.textContent = "";

  if (variants.length){
    modalVariants.innerHTML = renderVariantsBlock(variants);
  } else if (single !== null && single !== undefined && single !== ""){
    modalPrice.textContent = money(single);
  }

  // Show
  modal.classList.add("open");
  document.body.classList.add("modal-open");

  // Focus close for accessibility
  setTimeout(() => modalClose.focus(), 50);
}

function closeItemModal(){
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

modalBackdrop.addEventListener("click", closeItemModal);
modalClose.addEventListener("click", closeItemModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeItemModal();
});
