/* =======================
   🚀 INIT AFTER DOM READY
======================= */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  const submitBtn = document.getElementById("submitBtn");
  const pageTitle = document.getElementById("pageTitle");

  if (editId && submitBtn) {
    submitBtn.innerText = "Update Book";
    pageTitle.innerText = "✏️ Edit Book";
    loadBookData(editId);
  }
});


/* =======================
   🔘 SUBMIT (CREATE / UPDATE)
======================= */
function submitBook() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  if (editId) {
    updateBook(editId);
  } else {
    createBook();
  }
}

function showMessage(text, color = "green") {
  const el = document.getElementById("create-message");
  if (!el) return;

  el.style.color = color;
  el.innerText = text;

  setTimeout(() => (el.innerText = ""), 2000);
}


/* =======================
   ➕ CREATE BOOK
======================= */
async function createBook() {
  const title = document.getElementById("title").value;
  const detail = document.getElementById("detail").value;
  const cover = document.getElementById("cover").files[0];
  const pdf = document.getElementById("pdf").files[0];

  if (!title || !detail || !pdf) {
    return showMessage("กรุณากรอกข้อมูลให้ครบ", "red");
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("detail", detail);
  if (cover) formData.append("cover", cover);
  formData.append("pdf", pdf);

  try {
    const res = await fetch("/api/books", {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const result = await res.json();

    if (!res.ok) {
      return showMessage(result.message, "red");
    }

    showMessage("✅ สร้างหนังสือสำเร็จ");
    clearForm();

  } catch (err) {
    console.error(err);
    showMessage("❌ เกิดข้อผิดพลาด", "red");
  }
}


/* =======================
   ✏️ UPDATE BOOK
======================= */
async function updateBook(id) {
  const title = document.getElementById("title").value;
  const detail = document.getElementById("detail").value;
  const cover = document.getElementById("cover").files[0];
  const pdf = document.getElementById("pdf").files[0];

  if (!title || !detail) {
    return showMessage("กรุณากรอกข้อมูลให้ครบ", "red");
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("detail", detail);
  if (cover) formData.append("cover", cover);
  if (pdf) formData.append("pdf", pdf);

  try {
    const res = await fetch("/api/books/" + id, {
      method: "PUT",
      credentials: "include",
      body: formData
    });

    const result = await res.json();

    if (!res.ok) {
      return showMessage(result.message, "red");
    }

    showMessage("✅ แก้ไขสำเร็จ");
    setTimeout(() => (window.location.href = "/library.html"), 800);

  } catch (err) {
    console.error(err);
    showMessage("❌ เกิดข้อผิดพลาด", "red");
  }
}


/* =======================
   📥 LOAD BOOK (EDIT MODE)
======================= */
async function loadBookData(id) {
  try {
    const res = await fetch(`/api/books/${id}`, {
      credentials: "include"
    });

    const book = await res.json();

    document.getElementById("title").value = book.title || "";
    document.getElementById("detail").value = book.detail || "";

    if (book.coverImage?.url) {
      const preview = document.getElementById("coverPreview");
      preview.src = book.coverImage.url;
      preview.style.display = "block";
    }

    if (book.pdfFile?.url) {
      document.getElementById("pdfFileName").innerText =
        "Current file: " + book.pdfFile.url.split("/").pop();
    }

  } catch (err) {
    console.error("Load book error:", err);
  }
}


/* =======================
   🧹 CLEAR FORM
======================= */
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("detail").value = "";
  document.getElementById("cover").value = "";
  document.getElementById("pdf").value = "";
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
      credentials: "include"
    });

    if (res.status === 401) {
      return (window.location.href = "/login.html");
    }

    const data = await res.json();

    document.getElementById("totalBooks").innerText = data.totalBooks;
    document.getElementById("myBooks").innerText = data.myBooks;

    const table = document.getElementById("historyTable");
    if (!table) return;

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
