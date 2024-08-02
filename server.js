const express = require('express');
const mongoose = require('mongoose');
const ShortId = require('shortid');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  clickCount: { type: Number, default: 0 }
});

const Url = mongoose.model('Url', urlSchema);

// Routes
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = ShortId.generate();
  const url = new Url({ originalUrl, shortUrl });

  await url.save();
  res.json(url);
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (url) {
    url.clickCount++;
    await url.save();
    res.redirect(url.originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
