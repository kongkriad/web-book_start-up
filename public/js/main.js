async function createBook() {
  const title = document.getElementById('title').value;
  if (!title) return alert('Please enter book title');

  const res = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  const data = await res.json();

  document.getElementById('result').innerHTML = `
    <div class="result-box">
      Book Code Created: ${data.bookCode}
    </div>
  `;
}
