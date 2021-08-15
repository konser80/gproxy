require('./require');

const { config, routes } = global;
const { async, express, notify } = global;

// terminate
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

// starting
async.auto({

  http: (cb) => {

    const app = express();
    const router = routes.init();
    app.use(router);

    app.listen(config.web_port, config.web_host, () => {
      console.debug(`[+] init http://${config.web_host}:${config.web_port}${config.web_key}`);
      cb();
    });
  }

}, (e) => {
  if (e) {
    console.error('[-] FATAL, service can\'t start');
    // console.log(e);
    notify(`#error #${global.config.project} FATAL, service can't start: ${e.message || e}`);

    setTimeout(() => { shutdown('errOnStart'); }, 3000);
    return;
  }

  console.log('[+] service started');
});

// ==============================================
function shutdown(signal) {
  console.info(`[x] ${signal} signal received`);
  process.exit(0);
}
