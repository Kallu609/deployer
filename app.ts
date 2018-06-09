import * as childProcess from 'child_process';
import * as express from 'express';
import * as util from 'util';

const exec = util.promisify(childProcess.exec);
const DEPLOY_FOLDER = 'X:\\Desktop\\Tuplabotti-Jr';
const PORT = 2840;

class WebHook {
  previousPid: number;

  constructor() {
    this.createHTTPServer();
    hook.deploy();
  }

  async deploy(): Promise<void> {
    if (this.previousPid) {
      console.log('Killing previous process');
      process.kill(this.previousPid);
    }

    console.log('Pulling from origin');
    await exec(`git pull origin master`);
    console.log('Done pulling');

    console.log('Reinstalling node modules');
    await exec('npm install');

    console.log('Starting with `npm start`');
    const proc = childProcess.exec('npm start');
    this.previousPid = proc.pid;
    console.log('PID: ' + this.previousPid);
    const { stdout } = await exec('pidof node');
    console.log('PIDof: ' + (stdout));

    proc.stdout.on('data', (data) => {
      process.stdout.write('STDOUT: ' + data);
    });

    proc.stderr.on('data', (data) => {
      process.stdout.write('STDERR: ' + data);
    });

    proc.on('close', (code) => {
      process.stdout.write('Closing code: ' + code);
    });
    
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

const hook = new WebHook();