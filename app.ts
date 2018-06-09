import * as childProcess from 'child_process';
import * as express from 'express';

import * as util from 'util';
const exec = util.promisify(childProcess.exec);

import * as dotenv from 'dotenv';
dotenv.config();

class WebHook {
  port: number;
  lastPid: number;
  deployInProgress: boolean;

  constructor() {
    this.port = Number(process.env.PORT);
    this.changeWorkingDirectory();
    this.createHTTPServer();
    this.deploy();
  }
  
  changeWorkingDirectory(): void {
    try {
      process.chdir(process.env.DEPLOY_FOLDER as string);
    } catch (e) {
      console.log('Deploy folder doesn\'t exist.');
      process.exit();
    }
  }

  log(text: string): void {
    const time = new Date;
    const timeStr = ('0' + time.getHours()).slice(-2) + ':' +
                    ('0' + time.getMinutes()).slice(-2) + ':' +
                    ('0' + time.getSeconds()).slice(-2);
    
    console.log(`[${timeStr}] ${text}`);
  }
  
  async deploy(): Promise<void> {
    if (this.deployInProgress) {
      setTimeout(() => {
        this.deploy();
      }, 1000);

      return;
    }

    this.deployInProgress = true;
    this.log('[info] Build started');

    this.log('[info] Pulling from origin');
    await exec(`git pull origin master`);

    this.log('[info] Reinstalling node modules');
    await exec('npm install');

    this.log('[info] Starting node app');
    if (this.lastPid) {
      process.kill(this.lastPid);
      this.lastPid = -1;
    }
    const proc = childProcess.exec('npm start');
    
    proc.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    proc.stderr.on('data', (data) => {
      if (this.lastPid !== -1) {
        process.stdout.write(data);
      }
    });
    
    setTimeout(async () => {
      const { stdout } = await exec('ps | grep node');
      const newestProc = stdout.trim().split('\n').pop();
      
      if (newestProc) {
        this.lastPid = Number(newestProc.split(' ')[0]);
      }

      this.log('[info] Build finished. Node PID: ' + this.lastPid);
  
      this.deployInProgress = false;
    }, 1000);
  }

  async createHTTPServer(): Promise<void> {
    const app = express();

    app.post('/git/hook', (req, res) => {
      this.deploy();
    });

    app.listen(this.port, () => {
      this.log(`[hook] Server listening on port ${this.port}`);
    });
  }
}

const hook = new WebHook();