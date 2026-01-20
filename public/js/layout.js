async function loadComponent(id, path) {
  const res = await fetch(path)
  const html = await res.text()
  document.getElementById(id).innerHTML = html
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "/components/navbar.html")
  loadComponent("footer", "/components/footer.html")
})
