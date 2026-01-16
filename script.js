/* ELEMENTOS PRINCIPAIS */
const container = document.getElementById("cards-container");
const searchInput = document.getElementById("search-input");
const searchCount = document.getElementById("search-count");
const accordion = document.getElementById("accordion");
const pagination = document.getElementById("pagination");
const resetBtn = document.getElementById("reset-btn");

/* MODAL */
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal");
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalStatus = document.getElementById("modal-status");
const modalSpecies = document.getElementById("modal-species");
const modalGender = document.getElementById("modal-gender");
const modalOrigin = document.getElementById("modal-origin");
const modalLocation = document.getElementById("modal-location");

/* ESTADO GLOBAL */
let allCharacters = [];
let currentList = [];
let currentPage = 1;
const itemsPerPage = 20;
let activeItem = null;

/* GRUPOS PRINCIPAIS (REGRA DE NEGÓCIO) */
const MAIN_GROUPS = ["Rick", "Morty", "Summer", "Beth", "Jerry"];

/* CONTROLE DO MODAL */
function openModal() {
  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.add("closing");

  setTimeout(() => {
    modal.classList.remove("show", "closing");
    document.body.classList.remove("modal-open");
  }, 300);
}

/* BUSCAR TODOS OS PERSONAGENS */
async function fetchAllCharacters() {
  let url = "https://rickandmortyapi.com/api/character";

  while (url) {
    const response = await fetch(url);
    const data = await response.json();

    allCharacters = allCharacters.concat(data.results);
    url = data.info.next;
  }

  init();
}

/* ATUALIZA A PÁGINA */
function updatePage() {
  container.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = currentList.slice(start, end);

  pageItems.forEach((character) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = character.image;
    img.alt = character.name;

    const name = document.createElement("h2");
    name.textContent = character.name;

    const status = document.createElement("p");
    status.textContent = `Status: ${character.status}`;

    card.addEventListener("click", () => {
      modalImage.src = character.image;
      modalName.textContent = character.name;
      modalStatus.textContent = `Status: ${character.status}`;
      modalSpecies.textContent = `Espécie: ${character.species}`;
      modalGender.textContent = `Gênero: ${character.gender}`;
      modalOrigin.textContent = `Origem: ${character.origin.name}`;
      modalLocation.textContent = `Localização: ${character.location.name}`;

      openModal();
    });

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(status);
    container.appendChild(card);
  });

  renderPagination();
}

/* PAGINAÇÃO */
function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(currentList.length / itemsPerPage);

  if (currentPage > 1) {
    const prev = document.createElement("button");
    prev.textContent = "Anterior";
    prev.onclick = () => {
      currentPage--;
      updatePage();
    };
    pagination.appendChild(prev);
  }

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  pageInfo.style.fontWeight = "bold";
  pagination.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const next = document.createElement("button");
    next.textContent = "Próxima";
    next.onclick = () => {
      currentPage++;
      updatePage();
    };
    pagination.appendChild(next);
  }
}

/* AGRUPAMENTO INTELIGENTE */
function groupCharacters(characters) {
  const groups = {};

  MAIN_GROUPS.forEach((group) => {
    groups[group] = [];
  });

  groups["Outros"] = [];

  characters.forEach((char) => {
    const name = char.name.toLowerCase();

    const matchedGroup = MAIN_GROUPS.find((group) =>
      name.includes(group.toLowerCase())
    );

    if (matchedGroup) {
      groups[matchedGroup].push(char);
    } else {
      groups["Outros"].push(char);
    }
  });

  return groups;
}

/* SIDEBAR */
function updateHomeButtonState() {
  const hasActiveAccordion =
    document.querySelector(".accordion-header.active") !== null;

  resetBtn.classList.toggle("active", !hasActiveAccordion);
}

function createSidebarList() {
  accordion.innerHTML = "";
  activeItem = null;

  const grouped = groupCharacters(allCharacters);

  Object.entries(grouped).forEach(([groupName, characters]) => {
    if (characters.length === 0) return;

    const item = document.createElement("div");
    item.classList.add("accordion-item");

    const header = document.createElement("div");
    header.classList.add("accordion-header");

    header.innerHTML = `
      <span>${groupName}</span>
      <span class="accordion-count">
        ${characters.length}
        <span class="accordion-arrow">▶</span>
      </span>
    `;

    header.addEventListener("click", () => {

      // 🔴 LIMPA BUSCA AO USAR ACCORDION
      searchInput.value = "";
      searchCount.style.display = "none";

      document
        .querySelectorAll(".accordion-header.active")
        .forEach((el) => el.classList.remove("active"));

      header.classList.add("active");
      activeItem = header;

      currentPage = 1;
      currentList = characters;
      updatePage();

      updateHomeButtonState();
    });

    item.appendChild(header);
    accordion.appendChild(item);
  });
}

/* RESET */
resetBtn.addEventListener("click", () => {
  
  searchInput.value = "";
  searchCount.style.display = "none";

  document
    .querySelectorAll(".accordion-header.active")
    .forEach((el) => el.classList.remove("active"));

  activeItem = null;

  currentList = allCharacters;
  currentPage = 1;

  updatePage();
  createSidebarList();

  updateHomeButtonState();
});

/* FECHAR MODAL */
closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  // 🔴 FECHAR MODAL
  if (e.key === "Escape" && modal.classList.contains("show")) {
    closeModal();
    return;
  }

  // 🔴 LIMPAR BUSCA COM ESC
  if (e.key === "Escape" && searchInput.value.trim() !== "") {
    searchInput.value = "";
    searchCount.style.display = "none";

    document
      .querySelectorAll(".accordion-header.active")
      .forEach(el => el.classList.remove("active"));

    activeItem = null;
    currentList = allCharacters;
    currentPage = 1;

    resetBtn.classList.add("active");

    updatePage();
    createSidebarList();
  }
});

/* TOGGLE SIDEBAR */
const toggleBtn = document.getElementById("toggle-sidebar");

/* RESTAURA ESTADO AO CARREGAR */
document.addEventListener("DOMContentLoaded", () => {
  const sidebarState = localStorage.getItem("sidebarState");
  const isCollapsed = sidebarState === "collapsed";

  document.body.classList.toggle("sidebar-collapsed", isCollapsed);

  toggleBtn.title = isCollapsed ? "Abrir Menu" : "Fechar Menu";

  updateHomeButtonState();
});

/* TOGGLE + SALVAR ESTADO */
toggleBtn.addEventListener("click", () => {
  const isCollapsed = document.body.classList.toggle("sidebar-collapsed");

  toggleBtn.title = isCollapsed ? "Abrir Menu" : "Fechar Menu";

  localStorage.setItem(
    "sidebarState",
    isCollapsed ? "collapsed" : "expanded"
  );
});

/* CAMPO DE BUSCA */
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();

  // 🔴 DESATIVA HOME AO DIGITAR
  resetBtn.classList.remove("active");

  // 🔴 LIMPA SELEÇÃO DO ACCORDION
  document
    .querySelectorAll(".accordion-header.active")
    .forEach(el => el.classList.remove("active"));

  activeItem = null;

  // TERMOS
  if (!term) {
    currentList = allCharacters;

    // 🔴 VOLTA HOME QUANDO BUSCA ESTÁ VAZIA
    resetBtn.classList.add("active");
    searchCount.style.display = "none";
  } else {
    currentList = allCharacters.filter(character =>
      character.name.toLowerCase().includes(term)
    );

    //RESULTADOS
    searchCount.textContent =
      currentList.length === 0
        ? "Nenhum Personagem Encontrado 😵"
        : `${currentList.length} resultado(s) encontrado(s)`;

    searchCount.style.display = "block";
  }

  currentPage = 1;
  updatePage();
  createSidebarList();
});

/* INICIAR */
fetchAllCharacters();

function init() {
  currentList = allCharacters;
  currentPage = 1;

  // 🔢 TOTAL DE PERSONAGENS
  document.getElementById("total-count").textContent =
    `(${allCharacters.length})`;

  updatePage();
  createSidebarList();
}