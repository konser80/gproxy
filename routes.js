function init() {

  const router = global.express.Router();

  // logger
  router.use((req, res, next) => {
    if (req.originalUrl === '/favicon.ico') return next();

    console.debug(`${req.headers['x-real-ip'] || req.ip} ${req.method} ${req.originalUrl} HTTP/${req.httpVersion} ${req.headers['user-agent']}`, { ms: false });
    next();
  });

  // json parse for POST request
  // router.use(global.bodyparser.json()); // support json encoded bodies
  // router.use(global.bodyparser.urlencoded({ extended: true })); // support encoded bodies

  // request
  router.get(`${global.config.web_key}/:cmd`, global.logic.onRequest);

  // all other
  router.get('/*', (req, res) => {
    res.send('14400 dialup modem connection: no signal');
  });

  return router;
}

module.exports.init = init;
