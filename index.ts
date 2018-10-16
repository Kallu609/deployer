import * as childProcess from 'child_process';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as util from 'util';
import * as path from 'path';

/* Environment variables */
dotenv.config();
const deployFolder = process.env.DEPLOY_FOLDER || '';
const webhookPort = Number(process.env.WEBHOOK_PORT) || 8080;
const remoteBranch = process.env.REMOTE_BRANCH || 'origin';
const localBranch = process.env.LOCAL_BRANCH || 'master';
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
    appName = path.basename(deployFolder);
  } catch {
    log('Deploy folder doesn\'t exist.');
    process.exit();
  }
}

async function createServer(): Promise<void> {
  const server = express();

  server.all('/git/hook', async (req, res) => {
    res.send('Ok');
    deploy();
  });

  server.listen(webhookPort, () => {
    log('Webhook is listening on port ' + webhookPort);
    deploy();
  });
}

async function deploy(): Promise<void> {
  await closeApp();
  await fetchFromGit();
  await build();
  await startApp();
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

async function startApp(): Promise<void> {
  log('Starting application');
  console.log(`pm2 start ${npmClient} --name "${appName}" -- start`);
  await exec(`pm2 start ${npmClient} --name "${appName}" -- start`);
  log(`App started. Type 'pm2 logs "${appName}"' to view logs`)
}

async function closeApp(): Promise<void> {
  try {
    await exec(`pm2 delete "${appName}"`);
    console.log('Closed old application');
  } catch { }
}

(() => {
  changeCwd();
  createServer();
})();
