function updateDateTime() {
  const now = new Date();

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const weekday = now.toLocaleDateString("en-US", {
    weekday: "short",
  });
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dateString = `${weekday} ${day}/${month}`;

  document.getElementById("time").textContent = timeString;
  document.getElementById("date").textContent = dateString;
}

updateDateTime();

setInterval(updateDateTime, 1000);

window.openLightbox = function openLightbox(url, alt) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightboxImg.src = url;
  lightboxImg.alt = alt;
  lightbox.showModal();
};


const pageControls = document.querySelector(".photo-pages");

if (pageControls) {
  const tiles = [...document.querySelectorAll(".photo-div")];
  const [previous, next] = pageControls.querySelectorAll("button");
  const pageLabel = pageControls.querySelector("span");
  const portrait = window.matchMedia("(max-width: 768px) and (orientation: portrait)");
  const pageSize = 6;
  const pageCount = Math.ceil(tiles.length / pageSize);
  let page = 0;

  function showPage() {
    const focusedTile = tiles.indexOf(document.activeElement);
    if (portrait.matches && pageControls.contains(document.activeElement)) {
      tiles[page * pageSize].focus();
    }
    if (!portrait.matches && focusedTile >= 0) {
      page = Math.floor(focusedTile / pageSize);
    }

    pageControls.hidden = portrait.matches;
    tiles.forEach((tile, index) => {
      tile.hidden = !portrait.matches && Math.floor(index / pageSize) !== page;
    });
    previous.setAttribute("aria-disabled", String(page === 0));
    next.setAttribute("aria-disabled", String(page === pageCount - 1));
    pageLabel.textContent = `Page ${page + 1} of ${pageCount}`;
  }

  previous.addEventListener("click", () => {
    if (page === 0) return;
    page--;
    showPage();
  });

  next.addEventListener("click", () => {
    if (page === pageCount - 1) return;
    page++;
    showPage();
  });

  portrait.addEventListener("change", showPage);
  showPage();
}
