/* =======================
   🚀 INIT AFTER DOM READY
======================= */
document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  const submitBtn = document.getElementById("submitBtn");
  const pageTitle = document.getElementById("pageTitle");

  /* 🔍 EDIT MODE */
  if (editId && submitBtn) {
    submitBtn.innerText = "Update Book";
    pageTitle.innerText = "✏️ Edit Book";
    loadBookData(editId);
  }

});


/* =======================
   🔘 SUBMIT (CREATE / UPDATE)
======================= */
async function submitBook() {
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

  setTimeout(() => {
    el.innerText = "";
  }, 2000);
}


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
  // if (cover) formData.append("cover", cover);
  // if (pdf) formData.append("pdf", pdf);

  try {
    const res = await fetch("/api/books", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message);
      return;
    }

    alert("✅ สร้างหนังสือสำเร็จ");

    clearForm();

  } catch {
    showMessage("❌ เกิดข้อผิดพลาด", "red");
  }
}


/* =======================
   ✏️ UPDATE BOOK
======================= */
async function updateBook(id) {
  const messageEl = document.getElementById("create-message");

  const title = document.getElementById("title").value;
  const cover = document.getElementById("cover").files[0];
  const pdf = document.getElementById("pdf").files[0];

  const formData = new FormData();
  formData.append("title", title);

  if (cover) formData.append("cover", cover);
  if (pdf) formData.append("pdf", pdf);

  try {
    const res = await fetch("/api/books/" + id, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message);
      return;
    }

    alert("✅ แก้ไขสำเร็จ");

    setTimeout(() => {
      window.location.href = "/library.html";
    }, 800);

  } catch {
    showMessage("❌ เกิดข้อผิดพลาด", "red");
  }
}


/* =======================
   📥 LOAD BOOK (EDIT MODE)
======================= */
async function loadBookData(id) {
  try {
    console.log("Loading book id:", id);

    const res = await fetch(`/api/books/${id}`, {
      credentials: "include"
    });

    const book = await res.json();
    console.log("BOOK DATA:", book);

    // title
    document.getElementById("title").value = book.title || "";

    // cover preview
    if (book.coverImage?.url) {
      const preview = document.getElementById("coverPreview");
      preview.src = book.coverImage.url;
      preview.style.display = "block";
    }

    // pdf name
    if (book.pdfFile?.url) {
      document.getElementById("pdfName").innerText =
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


//+++++++++++++++++++++++++
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
