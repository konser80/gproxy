const DEBUG = false;

// ==============================================
async function onRequestHTTP(req, res) {
  if (DEBUG) console.debug(`[ ] cmd: ${req.params.cmd}`);

  if (req.params.cmd === 'get') {
    const reply = await getRecords(req);
    res.json(reply);
  }
  else {
    res.json({ cmd: req.params.cmd, reply: 'OK' });
  }

}

// ==============================================
async function getRecords(req) {
  if (!req.query.doc) return {};
  if (!req.query.sheet) return {};

  const docpath = req.query.doc;
  const { sheet } = req.query;

  // reopen? clear doc id
  if (req.query.reopen) global.google.doc[docpath] = null;

  console.debug(`[ ] get doc ${docpath}, sheet ${sheet}`);
  const raw = await global.google.read(docpath, sheet);

  if (!raw || raw.length === 0) {
    console.log('[-] got zero data');
    return {};
  }

  const data = [];
  const headers = global.google.doc[docpath].sheetsByTitle[sheet].headerValues;
  raw.forEach((row) => {
    const rec = {};
    headers.forEach((field) => {
      rec[field] = row[field];
    });
    data.push(rec);
  });

  if (DEBUG) console.debug(data);
  return data;
}


module.exports.onRequest = onRequestHTTP;
