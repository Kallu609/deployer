# Deployer

Deploys Node.js apps

## Usage

Only requirement is that you should have _"start"_ script in your target project's _package.json_.

It creates new pm2 process with the same name as the projects directory, so make sure it doesn't have any funny characters in it.

### Requirements

* Node.js
* Yarn (May work with npm too)

### Installation

1. Copy `.env.example` to `.env` and fill with your details.
 
    * `NPM_CLIENT` variable can be `npm` or `yarn`


2. Setup Git Webhook on your GitHub projects `/settings/hooks` path.
    * Hook path is: http://localhost/git/hook

3. Run following commands:

```
yarn global add pm2
yarn install
```

### Running on windows

Just run `yarn start`.

### Running on linux

I recommend using `screen` on unix systems. If you don't want to use screen, just run `yarn start`.

| Action                      | command              |
| --------------------------- | -------------------- |
| Run on background           | yarn screen:start    |
| Resume (Ctrl+A D to detach) | yarn screen:resume   |
| Quit                        | yarn screen:quit     |
| View app logs               | pm2 logs yourappname |

That's it!