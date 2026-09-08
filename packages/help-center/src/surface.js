import {
  createSurfaceMotion,
  installInteractionMotion,
  readParentAppearance,
  getWorkspaceTheme,
  observeWorkspaceAppearance,
} from "@iden/ui-foundation";
import "./surface.css";

const params = new URLSearchParams(location.search);
const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme:dark)");
let branding;
const applyLogo = () => {
  if (!branding) return;
  const logo = document.querySelector(".brand-custom-logo");
  const mark = document.querySelector(".brand-mark");
  const dark = root.dataset.theme === "dark";
  const url = dark
    ? branding.darkLogoUrl || branding.logoUrl
    : branding.logoUrl || branding.darkLogoUrl;
  if (url) {
    logo.src = url;
    logo.style.display = "block";
    mark.style.display = "none";
  } else {
    logo.removeAttribute("src");
    logo.style.display = "none";
    mark.style.display = "block";
  }
};
const applyTheme = (theme) => {
  root.dataset.theme = theme;
  applyLogo();
};
const followSystem = () => {
  if (!params.has("theme")) applyTheme(getWorkspaceTheme());
};
applyTheme(
  params.get("theme") === "dark" || (!params.has("theme") && getWorkspaceTheme() === 'dark')
    ? "dark"
    : "light",
);
media.addEventListener("change", followSystem);
const unobserveAppearance = observeWorkspaceAppearance(followSystem);
const unlisten = readParentAppearance(applyTheme);
if (params.get("embedded") === "1") document.body.classList.add("embedded");
const menu = document.querySelector(".menu-button");
const sidebar = document.querySelector(".sidebar");
let disposeMenuMotion = () => {};
menu.setAttribute("aria-expanded", "false");
const closeMenu = () => {
  disposeMenuMotion();
  document.body.classList.remove("menu-open");
  menu.setAttribute("aria-expanded", "false");
};
menu.addEventListener("click", () => {
  const open = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", open);
  menu.setAttribute("aria-expanded", String(open));
  if (open) {
    disposeMenuMotion();
    disposeMenuMotion = createSurfaceMotion(sidebar);
    sidebar.querySelector("a")?.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && document.body.classList.contains("menu-open")) {
    const controls = [...sidebar.querySelectorAll("a[href],input,select,button"), menu]
      .filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!sidebar.contains(event.target) && !menu.contains(event.target))
    closeMenu();
});
const toc = document.querySelector(".toc");
for (const [index, heading] of [
  ...document.querySelectorAll("article h2"),
].entries()) {
  heading.id ||= `section-${index}`;
  const link = document.createElement("a");
  link.href = `#${heading.id}`;
  link.textContent = heading.textContent;
  toc.append(link);
}
const disposeMotion = createSurfaceMotion(document.querySelector("article"));
const disposeControls = installInteractionMotion(document.body);
window.addEventListener(
  "pagehide",
  () => {
    disposeMotion();
    disposeMenuMotion();
    disposeControls();
    unlisten();
    unobserveAppearance();
    media.removeEventListener("change", followSystem);
  },
  { once: true },
);

// Branding does not block navigation, reading or search.
void (async () => {
  try {
    const response = await fetch("/api/platform-branding", {
      credentials: "same-origin",
    });
    if (!response.ok) return;
    branding = await response.json();
    if (typeof branding.productName !== "string") return;
    for (const node of document.querySelectorAll("[data-platform-brand-name]"))
      node.textContent = branding.productName;
    for (const node of document.querySelectorAll(
      "[data-platform-brand-slogan]",
    ))
      node.textContent = branding.slogan;
    if (branding.hideOpenSourceNotice)
      for (const node of document.querySelectorAll("[data-open-source-notice]"))
        node.remove();
    applyLogo();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement?.closest("code,pre,script,style"))
        node.textContent =
          node.textContent?.replace(/\biden\b/gi, () => branding.productName) ??
          "";
    }
    document.title = document.title.replace(
      /iden/gi,
      () => branding.productName,
    );
  } catch {
    /* Optional branding failure must not interrupt the local documentation. */
  }
})();
const input = document.querySelector(".search[type=search]");
const results = document.querySelector(".search-results");
let pagefind;
let searchVersion = 0;
input.addEventListener("input", async () => {
  const version = ++searchVersion;
  const query = input.value.trim();
  results.replaceChildren();
  results.classList.remove("active");
  if (query.length < 2) return;
  try {
    pagefind ??= await import("/help/pagefind/pagefind.js");
    const response = await pagefind.search(query);
    const items = await Promise.all(
      response.results.slice(0, 8).map((item) => item.data()),
    );
    if (version !== searchVersion) return;
    for (const item of items) {
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = item.meta.title;
      results.append(link);
    }
    results.classList.toggle("active", items.length > 0);
  } catch {
    results.classList.remove("active");
  }
});
