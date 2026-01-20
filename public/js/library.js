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
      <img src="${book.coverImage.url}" />
      <p>${book.title}</p>
      <small>${book.bookCode || ""}</small>
      <button onclick="deleteBook('${book._id}')">Delete</button>
    `;

    container.appendChild(div);
  });
}

window.deleteBook = async function (id) {
  if (!confirm("ต้องการลบหนังสือเล่มนี้หรือไม่?")) return;

  await fetch("/api/books/" + id, { method: "DELETE" });
  document.getElementById(`book-${id}`).remove();
};

loadBooks();
