# Wealth UI Project

## Setup Instructions
To download and run this project you will need
1. [Git](https://git-scm.com/downloads)
2. [NodeJs 16](https://nodejs.org/dist/v16.17.0/)
3. [Yarn](https://classic.yarnpkg.com/en/docs/install#debian-stable)

To clone ([how to use ssh](https://docs.github.com/en/authentication/connecting-to-github-with-ssh))
```bash
cd to/your/desired/folder
# for ssh auth
git clone git@github.com:Qontigo/Qontigo.OptimizerWealth.UI.App.git
# for https auth
git clone https://github.com/Qontigo/Qontigo.OptimizerWealth.UI.App.git

# after cloning
cd Wealth-UI-App
yarn
yarn start
```

To use the application, navigate to:
```
http://localhost:5000/
```

## Tooling
Once all dependencies have been installed you should see something like
```bash
1) Middleware: Ready
2) Webpack: 230/230 still running.
3) Typescript: Started
Press a number to see more options
```
By pressing numbers you will be able to restart or see the output of each process.

Those 3 process that you see running cover most of the development workflow.
1. The middleware serves the html/js/css files on http://localhost:5000, which allows you to navigate your local branch
2. Webpack is the one that transforms typescript to javascript, sass to css and so on, it also bundles the many files of a module into one
3. Typescript is used solely to type check for code correctness, but webpack is the one that does the transpilation (without type check which is much faster)