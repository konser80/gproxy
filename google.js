const { async, notify, tools } = global;
const DEBUG = false;

const doc = {};
let job;
let busy = false;
const G_WAIT = 500;

// ==============================================
async function onTrigger(obj, action) {
// async function onTrigger(obj, action, trigger) {

  if (action.act === 'google.close') googleClose(obj, action);
  if (action.act === 'google.write') actionGoogleWrite(obj, action);

  return obj;
}

// ==============================================
function init() {
  // every 30 seconds - clear google's busy status. just in case

  if (job) clearInterval(job);
  job = setInterval(() => {
    busy = false;
  }, 30 * 1000);
}
// ==============================================
function cancel() {
  if (job) clearInterval(job);
  if (DEBUG) console.debug('[+] cancel google schedules');
}

// ==============================================
async function googleOpen(docpath) {
  if (!docpath) return null;
  if (doc[docpath]) return true;

  const { GoogleSpreadsheet } = global.googlespreadsheet;

  /* eslint global-require: "off" */
  const creds = require(global.config.google_key);

  let docid;
  try {
    docid = new GoogleSpreadsheet(docpath);
    await docid.useServiceAccountAuth(creds);
    console.debug(`[+] google: authorized for ${docpath}`);
    await docid.loadInfo();
    console.debug(`[+] google: opened '${docid.title}'`);

  }
  catch (e) {
    console.error(`[-] google error: ${e.message}`);
    notify(`#error #${global.config.project} google: ${e.message}`);
    throw new Error(`google error: ${e.message}`);
    // return false;
  }
  doc[docpath] = docid;
  return docid;
}
// ==============================================
async function googleRead(docpath, sheet, cb) {
  if (DEBUG) console.debug(`[+] googleRead, docpath: ${docpath}, sheet: ${sheet}`);

  let contents;
  try {
    await googleOpen(docpath);
    contents = await doc[docpath].sheetsByTitle[sheet].getRows();
  }
  catch (e) {
    console.error(`[-] google: sheet '${sheet}' read error: ${e.message}`);
    if (DEBUG) console.log(e);
    notify(`#${global.config.project} google sheet '${sheet}' read error ${sheet}: ${e.message}`);
    if (cb) cb(e);
    return [];
  }

  console.debug(`[+] google: read ${sheet}`);
  if (cb) cb(null, contents);
  return contents;
}
// ==============================================
async function googleReadArray(array, callback) {

  if (DEBUG) console.debug(`[+] googleReadArray, array: ${tools.textify(array)}`);
  await googleOpen(global.config.docpath);

  // we use async because we read sheets simultaneously
  // TODO: promise.all
  const data = {};
  async.each(array, (sheet, cb) => {
    googleRead(global.config.docpath, sheet, (err, res) => {
      if (err) { cb(err); return; }
      data[sheet] = res;
      cb();
    });
  }, (err) => {

    if (err) return callback(err);
    callback(null, data);
  });
}
// ==============================================
async function googleWrite(docpath, sheet, row) {
  if (DEBUG) console.debug(`[+] googleWrite, sheet ${sheet}`);
  if (!docpath) return null;

  // wait queue
  if (busy) {
    if (DEBUG) console.debug('[·] google is busy, waiting...');
    setTimeout(() => {
      // wait and run
      googleWrite(docpath, sheet, row);
    }, G_WAIT);
    return;
  }

  if (DEBUG) console.debug('[·] google is free, writing...');
  busy = true;
  try {
    await googleOpen(docpath);
    await doc[docpath].sheetsByTitle[sheet].addRow(row);
  }
  catch (e) {
    busy = false;
    console.error(`[-] google: write error: ${e.message}`);
    console.log(e);
    notify(`#error #${global.config.project} google: write error: ${e.message}`);
    return;
  }

  busy = false;
  console.debug('[+] google: write OK');
}
// ==============================================
function googleClose() {

  console.debug('[+] google: documents are closed');
  Object.keys(doc).forEach((key) => {
    delete doc[key];
  });

}

// ==============================================
async function actionGoogleWrite(obj, item) {
  try {
    const docpath = item.to;
    const row = JSON.parse(item.opt);
    const { sheet } = row;
    delete row.sheet;

    Object.keys(row).forEach((key) => {
      row[key] = tools.replace(obj, row[key]);
    });
    if (DEBUG) console.debug(row);

    await googleWrite(docpath, sheet, row);
  }
  catch (e) {
    console.error(`[-] google.write: ${e.message}`);
    notify(`#error #${global.config.project} google.write: ${e.message}`);
    console.log(e);
  }
  console.debug('[+] google: write done');
}


module.exports.doc = doc;
module.exports.init = init;
module.exports.cancel = cancel;
module.exports.onTrigger = onTrigger;

module.exports.read = googleRead;
module.exports.readarray = googleReadArray;
module.exports.write = googleWrite;
