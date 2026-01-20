async function loadBooks() {
  const res = await fetch("/api/books");
  const books = await res.json();

  const container = document.getElementById("book-list");
  container.innerHTML = "";

  books.forEach((book) => {
    div.innerHTML += `
  <div class="book-card" id="book-${book._id}">
    <img src="${book.coverImage}" />
    <p>${book.title}</p>
    <button onclick="deleteBook('${book._id}')">Delete</button>
  </div>
`;
  });
  window.deleteBook = async function (id) {
    console.log("DELETE:", id);

    await fetch("/api/books/" + id, {
      method: "DELETE",
    });

    document.getElementById(`book-${id}`).remove();
  };
}

loadBooks();
