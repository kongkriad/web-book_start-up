async function createBook() {
  const title = document.getElementById('title').value;
  const cover = document.getElementById('cover').files[0];
  const pdf = document.getElementById('pdf').files[0];

  if (!title || !cover || !pdf) {
    alert('Please complete all fields');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('cover', cover);
  formData.append('pdf', pdf);

  const res = await fetch('/api/books', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  document.getElementById('result').innerHTML = `
    <div class="result-box">
      ✅ Book Created<br/>
      Code: ${data.bookCode}
    </div>
  `;
}
