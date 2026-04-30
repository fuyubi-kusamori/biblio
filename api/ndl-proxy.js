// api/ndl-proxy.js
// Vercel Serverless Function — NDL SRU API proxy
// PHPの ndl-proxy.php と同等の機能をNode.jsで実装

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const isbn = (req.query.isbn || '').replace(/[^0-9X]/gi, '');
  if (!isbn) {
    res.status(400).setHeader('Content-Type', 'text/plain').send('ISBN required');
    return;
  }

  const ndlUrl =
    `https://ndlsearch.ndl.go.jp/api/sru` +
    `?operation=searchRetrieve` +
    `&recordSchema=dcndl` +
    `&query=isbn%3D${encodeURIComponent(isbn)}` +
    `&maximumRecords=1`;

  try {
    const response = await fetch(ndlUrl, {
      headers: { 'User-Agent': 'BiblioVercel/1.0' },
    });

    if (!response.ok) {
      res.status(502).send(`NDL returned ${response.status}`);
      return;
    }

    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.status(200).send(xml);

  } catch (err) {
    res.status(502).send(`Fetch error: ${err.message}`);
  }
}
