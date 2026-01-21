/* =======================
   ➕ CREATE BOOK
======================= */
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
      credentials: "include", // 🔥 สำคัญมาก (session)
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

/* =======================
   🚪 LOGOUT
======================= */
document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
  e.preventDefault();

  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  window.location.href = "/login.html";
});

/* =======================
   📊 DASHBOARD
======================= */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/books/dashboard", {
      credentials: "include" // 🔥 ใช้ session
    });

    // 🔒 ถ้า session หมด
    if (res.status === 401) {
      return location.href = "/login.html";
    }

    const data = await res.json();

    document.getElementById("totalBooks").innerText = data.totalBooks;
    document.getElementById("myBooks").innerText = data.myBooks;

    const table = document.getElementById("historyTable");
    table.innerHTML = "";

    data.history.forEach(b => {
      table.innerHTML += `
        <tr>
          <td>${b.title}</td>
          <td>${b.addedBy?.email || "-"}</td>
          <td>${new Date(b.createdAt).toLocaleString()}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Dashboard error:", err);
  }
});
