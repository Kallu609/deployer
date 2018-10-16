# Deployer

Deploys Node.js apps

## Usage

Only requirement is that you should have _"start"_ script in your target project's _package.json_.

It creates new pm2 process with the same name as the projects directory, so make sure it doesn't have any funny characters in it.

### Installation

Copy `.env.example` to `.env` and fill with your details.

* `NPM_CLIENT` variable can be `npm` or `yarn`

Do `npm i -g yarn` if you don't have yarn already (You should).

```
yarn global add pm2
yarn install
```

### Running on windows

Just run `yarn start`.

### Running on linux

I recommend using screen on unix systems. If you don't want to use screen, just run `yarn start`.

| Action               	      | command  	           |
|---------------------------- |--------------------- |
| Run on background           | yarn screen:start  	 |
| Resume (Ctrl+A D to detach) | yarn screen:resume 	 |
| Quit                        | yarn screen:quit   	 |
| View app logs               | pm2 logs yourappname |

That's it!