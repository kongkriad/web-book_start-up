document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("codeForm");
  const bookSelect = document.getElementById("bookSelect");
  const codeTable = document.getElementById("codeTable");

  /* =====================
     LOAD BOOKS
  ===================== */
  fetch("/api/books")
    .then(res => res.json())
    .then(books => {
      books.forEach(book => {
        const opt = document.createElement("option");
        opt.value = book._id;
        opt.textContent = book.title;
        bookSelect.appendChild(opt);
      });
    })
    .catch(err => {
      console.error("Load books error:", err);
    });

  /* =====================
     LOAD CODES
  ===================== */
  function loadCodes() {
    fetch("/api/books/BookCode")
      .then(res => res.json())
      .then(codes => {
        codeTable.innerHTML = "";

        if (!codes || codes.length === 0) {
          codeTable.innerHTML = `
            <tr>
              <td colspan="4" class="text-center">ยังไม่มีรหัส</td>
            </tr>
          `;
          return;
        }

        codes.forEach(c => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${c.code}</td>
            <td>${c.bookTitle}</td>
            <td>${c.used ? "ใช้แล้ว" : "ยังไม่ใช้"}</td>
            <td>${new Date(c.createdAt).toLocaleString()}</td>
          `;
          codeTable.appendChild(tr);
        });
      })
      .catch(err => {
        console.error("Load codes error:", err);
      });
  }

  loadCodes();

  /* =====================
     SUBMIT FORM
  ===================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!bookSelect.value) {
      alert("กรุณาเลือกหนังสือ");
      return;
    }

    try {
      const res = await fetch("/api/books/createcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookId: bookSelect.value,
          bookTitle: bookSelect.options[bookSelect.selectedIndex].text
        })
      });

      if (!res.ok) {
        alert("สร้างรหัสไม่สำเร็จ");
        return;
      }

      form.reset();
      loadCodes();
      alert("สร้างรหัสสำเร็จแล้ว");

    } catch (err) {
      console.error("Create code error:", err);
      alert("เกิดข้อผิดพลาด");
    }
  });
});
