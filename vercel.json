// api/ndl-proxy.js
// Vercel Serverless Function — NDL SRU + 書影画像プロキシ

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const isbn = (req.query.isbn || '').replace(/[^0-9X]/gi, '');
  if (!isbn) { res.status(400).send('ISBN required'); return; }

  const mode = req.query.mode || 'sru';

  if (mode === 'cover') {
    // 書影画像プロキシ
    const url = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'BiblioVercel/1.0' } });
      if (!r.ok) { res.status(404).send('No cover'); return; }
      const buf = await r.arrayBuffer();
      if (buf.byteLength < 500) { res.status(404).send('No cover'); return; }
      res.setHeader('Content-Type', 'image/jpeg');
      res.status(200).send(Buffer.from(buf));
    } catch(e) {
      res.status(502).send('Fetch error: ' + e.message);
    }

  } else {
    // SRU書誌XML
    const url = `https://ndlsearch.ndl.go.jp/api/sru`
      + `?operation=searchRetrieve&recordSchema=dcndl`
      + `&query=isbn%3D${encodeURIComponent(isbn)}&maximumRecords=1`;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'BiblioVercel/1.0' } });
      if (!r.ok) { res.status(502).send(`NDL returned ${r.status}`); return; }
      const xml = await r.text();
      res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
      res.status(200).send(xml);
    } catch(e) {
      res.status(502).send('Fetch error: ' + e.message);
    }
  }
}
