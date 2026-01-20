async function loadBooks() {
  const res = await fetch("/api/books");
  const books = await res.json();

  const container = document.getElementById("book-list");
  container.innerHTML = "";

  books.forEach((book) => {
    const div = document.createElement("div");
    div.className = "book-card";
    div.id = `book-${book._id}`;

    div.innerHTML = `
      <img src="${book.coverImage?.url}" alt="${book.title}">
      <p>${book.title}</p>
      <button class="btn btn-danger btn-sm" onclick="deleteBook('${book._id}')">
        Delete
      </button>
    `;

    container.appendChild(div);
  });
}

async function deleteBook(id) {
  if (!confirm("ลบหนังสือเล่มนี้?")) return;

  await fetch("/api/books/" + id, { method: "DELETE" });

  document.getElementById(`book-${id}`)?.remove();
}

loadBooks();
