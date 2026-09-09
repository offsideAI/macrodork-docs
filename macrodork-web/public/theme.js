// Run before the app/styles load to avoid flashing the wrong saved theme.
(() => {
  let preference;
  try {
    preference = localStorage.getItem("mark-1-theme");
  } catch {
    // Storage may be unavailable in private or restricted browsing.
  }
  const theme =
    preference === "light" || preference === "dark"
      ? preference
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#151916" : "#f5f4ef");
})();
