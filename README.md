# Deployer

Deploys Node.js apps

## Requirements

* Node.js
* Yarn (Should work with npm too)
* You should have _"start"_ script in your target project's _package.json_

## Installation

1. Copy `.env.example` to `.env` and fill with your details.
 
    * `NPM_CLIENT` variable can be `npm` or `yarn`


2. Setup Git Webhook on your GitHub project's `Settings -> Hooks` page.
    * Payload URL is: http://yourserver:8080/git/hook (default port is 8080)

3. Run following commands:

```
yarn global add pm2
yarn install
```

## Running
### On Windows

Run `yarn start`.

### On Linux

I recommend using `screen` on unix systems. If you don't want to use screen, run `yarn start`.

| Action                      | command              |
| --------------------------- | -------------------- |
| Run on background           | yarn screen:start    |
| Resume (Ctrl+A D to detach) | yarn screen:resume   |
| Quit                        | yarn screen:quit     |
| View app logs               | pm2 logs yourappname |

That's it!
