
const sectionGrid = document.getElementById("sectionGrid");
const itemGrid = document.getElementById("itemGrid");
const home = document.getElementById("home");
const sectionView = document.getElementById("section");
const sectionTitle = document.getElementById("sectionTitle");
const backBtn = document.getElementById("backBtn");

fetch("menu.json").then(r=>r.json()).then(data=>{
  const cats = data.categories || data;
  cats.forEach(cat=>{
    const card=document.createElement("div");
    card.className="section-card";
    card.innerHTML=`
      <div class="section-img" style="background-image:url(${cat.image || ""})"></div>
      <div class="section-content">
        <h3>${cat.category||cat.name}</h3>
        <p>${cat.items.length} platillos</p>
      </div>`;
    card.onclick=()=>openSection(cat);
    sectionGrid.appendChild(card);
  });
});

function openSection(cat){
  home.classList.remove("active");
  sectionView.classList.add("active");
  sectionTitle.textContent=cat.category||cat.name;
  itemGrid.innerHTML="";
  cat.items.forEach(it=>{
    const card=document.createElement("div");
    card.className="item-card";
    card.innerHTML=`
      <div class="item-img" style="background-image:url(${it.image || ""})"></div>
      <div class="item-content">
        <h4>${it.name}</h4>
        <p>${it.description||""}</p>
        <div class="price">$${it.price||""}</div>
      </div>`;
    itemGrid.appendChild(card);
  });
}

backBtn.onclick=()=>{
  sectionView.classList.remove("active");
  home.classList.add("active");
};
