(() => {
  const params = new URLSearchParams(location.search);
  const legacySessionId = params.get("session");
  if (legacySessionId) {
    location.replace(`classroom.html?session=${encodeURIComponent(legacySessionId)}`);
    return;
  }

  const button = document.querySelector(".marketing-menu-button");
  const nav = document.querySelector(".marketing-nav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const open = document.body.classList.toggle("marketing-menu-open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close" : "Menu";
  });

  nav.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    document.body.classList.remove("marketing-menu-open");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Menu";
  });
})();
