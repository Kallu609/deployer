import * as childProcess from 'child_process';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as util from 'util';
import * as path from 'path';

/* Environment variables */
dotenv.config();
const deployFolder = process.env.DEPLOY_FOLDER || '';
const webhookPort = Number(process.env.WEBHOOK_PORT) || 8080;
const remoteBranch = process.env.REMOTE_BRANCH || 'origin';
const localBranch = process.env.REMOTE_BRANCH || 'master';
const npmClient = process.env.NPM_CLIENT || 'npm';
/* /Environment variables */

const exec = util.promisify(childProcess.exec);
let appName: string;

function log(text: string): void {
  const time = new Date;
  const timeStr =
    ('0' + time.getHours()).slice(-2) + ':' +
    ('0' + time.getMinutes()).slice(-2) + ':' +
    ('0' + time.getSeconds()).slice(-2);

  console.log(`[${timeStr}] ${text}`);
}

function changeCwd(): void {
  try {
    if (!deployFolder) {
      throw new Error();
    }

    process.chdir(deployFolder);
    appName = path.dirname(deployFolder);
  } catch (e) {
    console.log(e);
    log('Deploy folder doesn\'t exist.');
    process.exit();
  }
}

async function createServer(): Promise<void> {
  const server = http.createServer(async (req, res) => {
    res.end('Hi');

    if (req.url === '/git/hook') {
      await fetchFromGit();
      await build();
      await start();
    }
  });

  server.listen(webhookPort, () => {
    log('Webhook is listening on port ' + webhookPort);
  });
}

async function fetchFromGit(): Promise<void> {
  log('Build started. Fetching from Git');
  await exec(`git fetch --all`);
  await exec(`git reset --hard ${remoteBranch}/${localBranch}`);
}

async function build(): Promise<void> {
  log('Installing node modules');
  await exec(`${npmClient} install`);
}

async function start(): Promise<void> {
  log('Starting application');
  await exec(`pm2 delete "${appName}"`);
  await exec(`pm2 start ${npmClient} -- start --name "${appName}"`);
  log(`App started. Type 'ps2 logs "${appName}"' to view logs`)
}

(() => {
  changeCwd();
  createServer();
})();