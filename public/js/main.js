async function createBook() {
  const messageEl = document.getElementById("create-message");

  const title = document.getElementById("title").value;
  const cover = document.getElementById("cover").files[0];
  const pdf = document.getElementById("pdf").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("cover", cover);
  formData.append("pdf", pdf);

  try {
    const res = await fetch("/api/books", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      messageEl.style.color = "red";
      messageEl.textContent = result.message || "Create book failed";
      return;
    }

    messageEl.style.color = "green";
    messageEl.textContent = "✅ สร้างหนังสือเรียบร้อยแล้ว";

    document.getElementById("title").value = "";
    document.getElementById("cover").value = "";
    document.getElementById("pdf").value = "";

  } catch (err) {
    messageEl.style.color = "red";
    messageEl.textContent = "เกิดข้อผิดพลาด";
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
  e.preventDefault();

  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  window.location.href = "/login.html";
});
