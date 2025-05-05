require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const urlParser = require('url');
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;
const shortUrls = {};
let urlCounter = 1;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;

  const parseUrl = urlParser.parse(url);
  if (!parseUrl.protocol || !parseUrl.hostname) {
    return res.json({ error: 'Invalid url' });
  }
  
  dns.lookup(parseUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'Invalid url' });
    }
    if (!shortUrls[url]) {
      shortUrls[url] = urlCounter++;
    }
    console.log(shortUrls, shortUrls[url])
    res.json({ original_url: url, short_url: shortUrls[url]});
  })

});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);
  const originalUrl = Object.keys(shortUrls).find(key => shortUrls[key] === shortUrl);

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
