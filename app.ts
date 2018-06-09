import * as childProcess from 'child_process';
import * as express from 'express';
import * as util from 'util';

const exec = util.promisify(childProcess.exec);
const DEPLOY_FOLDER = '';
const PORT = 2840;

class WebHook {
  previousPid: number;

  constructor() {
    this.createHTTPServer();
  }

  async deploy(): Promise<void> {
    console.log('Pulling from origin');
    await exec(`git pull origin master`);
    console.log('Done pulling');

    console.log('Reinstalling node modules');
    await exec('npm install');

    if (this.previousPid) {
      console.log('Killing previous process');
      process.kill(this.previousPid);
    }

    console.log('Starting with `npm start`');
    const proc = childProcess.exec('npm start');
    this.previousPid = proc.pid;
    console.log(this.previousPid);
    console.log('Started');
  }

  async createHTTPServer(): Promise<void> {
    const app = express();

    app.post('/git/hook', (req, res) => {
      console.log('Deploying');
      this.deploy();
    });

    await app.listen(PORT, () => {
      console.log(`Server listening: http://localhost:${PORT}`);
    });
  }
}

try {
  process.chdir(DEPLOY_FOLDER);
} catch (e) {
  console.log('Deploy folder doesn\'t exist.');
  process.exit();
}

new WebHook();