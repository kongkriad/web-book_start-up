document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("codeForm");
  const bookSelect = document.getElementById("bookSelect");

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

  loadCodes();

  form.addEventListener("submit", async (e) => {
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
        bookTitle: bookSelect.options[bookSelect.selectedIndex].text,
      }),
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

// async function createQR(codeId) {
//   if (!confirm("สร้าง QR Code ?")) return;

//   const res = await fetch(`/api/books/bookcodes/${codeId}/qrcode`, {
//     method: "POST",
//   });

//   if (res.ok) {
//     alert("สร้าง QR สำเร็จ");
//     loadCodes();
//   } else {
//     alert("สร้าง QR ไม่สำเร็จ");
//   }
// }
async function createQR(codeId) {
  if (!confirm("สร้าง QR Code ?")) return;

  const toolCell = document.getElementById(`tool-${codeId}`);
  toolCell.innerHTML = `
    <button class="btn btn-secondary btn-sm" disabled>
      กำลังสร้าง...
    </button>
  `;

  const res = await fetch(`/api/books/bookcodes/${codeId}/qrcode`, {
    method: "POST",
  });

  if (!res.ok) {
    alert("สร้าง QR ไม่สำเร็จ");
    loadCodes(); // rollback
    return;
  }

  const updatedCode = await res.json();

  // 🔥 เปลี่ยนเป็นปุ่ม "ดู QR" ทันที
  const row = document.getElementById(`code-${codeId}`);
  row.innerHTML = renderRow(updatedCode);

  alert("สร้าง QR สำเร็จ");
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
    height: 200,
  });

  new bootstrap.Modal(document.getElementById("codeModal")).show();
}

function showBarcode(code) {
  document.getElementById("qrBox").innerHTML = "";
  document.getElementById("barcode").innerHTML = "";

  JsBarcode("#barcode", code, {
    format: "CODE128",
    width: 2,
    height: 80,
    displayValue: true,
  });

  new bootstrap.Modal(document.getElementById("codeModal")).show();
}

function renderRow(c) {
  return `
    <td>${c.code}</td>
    <td>${c.bookTitle}</td>
    <td>${c.used ? "ใช้แล้ว" : "ยังไม่ใช้"}</td>
    <td>${new Date(c.createdAt).toLocaleString()}</td>
    <td id="tool-${c._id}">
      ${
        c.qrImage?.url
          ? `<a href="${c.qrImage.url}" target="_blank"
               class="btn btn-success btn-sm me-1">ดู QR</a>`
          : `<button class="btn btn-primary btn-sm me-1"
               onclick="createQR('${c._id}')">สร้าง QR</button>`
      }

      <button class="btn btn-danger btn-sm"
        onclick="deleteCode('${c._id}')">
        ลบ
      </button>
    </td>
  `;
}
function loadCodes() {
  fetch("/api/books/bookcodes")
    .then(res => res.json())
    .then(codes => {
      const codeTable = document.getElementById("codeTable");
      codeTable.innerHTML = "";

      if (!codes.length) {
        codeTable.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">ยังไม่มีรหัส</td>
          </tr>`;
        return;
      }

      codes.forEach(c => {
        const tr = document.createElement("tr");
        tr.id = `code-${c._id}`;
        tr.innerHTML = renderRow(c);
        codeTable.appendChild(tr);
      });
    });
}
async function deleteCode(codeId) {
  if (!confirm("ต้องการลบรหัสนี้ใช่หรือไม่?")) return;

  const res = await fetch(`/api/books/bookcodes/${codeId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    alert("ลบไม่สำเร็จ");
    return;
  }

  const row = document.getElementById(`code-${codeId}`);
  if (row) row.remove();

  alert("ลบข้อมูลเรียบร้อย");
}

