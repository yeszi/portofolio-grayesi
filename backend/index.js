const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ambil data about_me (Home section)
app.get('/about_me', (req, res) => {
  db.query('SELECT * FROM about_me LIMIT 1', (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});

// Update about_me
app.put('/about_me/:id', (req, res) => {
  const { name, subtitle, description } = req.body;
  const id = req.params.id;

  db.query(
    'UPDATE about_me SET name = ?, subtitle = ?, description = ? WHERE id = ?',
    [name, subtitle, description, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, message: '✅ Halaman Home telah diperbarui!' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

