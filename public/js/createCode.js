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
    });

  /* =====================
     LOAD CODES
  ===================== */
  function loadCodes() {
    fetch("/api/books/bookcodes")
      .then(res => res.json())
      .then(codes => {
        codeTable.innerHTML = "";

        if (!codes || codes.length === 0) {
          codeTable.innerHTML = `
            <tr>
              <td colspan="5" class="text-center">ยังไม่มีรหัส</td>
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
            <td>
              ${
                c.qrImage?.url
                  ? `<a href="${c.qrImage.url}" target="_blank" class="btn btn-success btn-sm">ดู QR</a>`
                  : `<button class="btn btn-primary btn-sm" onclick="createQR('${c._id}')">สร้าง QR</button>`
              }
            </td>
          `;
          codeTable.appendChild(tr);
        });
      })
      .catch(err => console.error(err));
  }

  loadCodes();

  /* =====================
     SUBMIT
  ===================== */
  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!bookSelect.value) {
      alert("กรุณาเลือกหนังสือ");
      return;
    }

    const res = await fetch("/api/books/createcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: bookSelect.value,
        bookTitle: bookSelect.options[bookSelect.selectedIndex].text
      })
    });

    if (res.ok) {
      form.reset();
      loadCodes();
      alert("สร้างรหัสสำเร็จ");
    } else {
      alert("สร้างรหัสไม่สำเร็จ");
    }
  });
});
async function createQR(codeId) {
  if (!confirm("สร้าง QR Code ?")) return;

  const res = await fetch(`/api/books/bookcodes/${codeId}/qrcode`, {
    method: "POST",
  });

  if (res.ok) {
    alert("สร้าง QR สำเร็จ");
    loadCodes();
  } else {
    alert("สร้าง QR ไม่สำเร็จ");
  }
}

/* =====================
   GLOBAL FUNCTIONS
===================== */
function showQR(code) {
  document.getElementById("qrBox").innerHTML = "";
  document.getElementById("barcode").innerHTML = "";

  new QRCode(document.getElementById("qrBox"), {
    text: code,
    width: 200,
    height: 200
  });

  new bootstrap.Modal(
    document.getElementById("codeModal")
  ).show();
}

function showBarcode(code) {
  document.getElementById("qrBox").innerHTML = "";
  document.getElementById("barcode").innerHTML = "";

  JsBarcode("#barcode", code, {
    format: "CODE128",
    width: 2,
    height: 80,
    displayValue: true
  });

  new bootstrap.Modal(
    document.getElementById("codeModal")
  ).show();
}
