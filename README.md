# Madhatter 
## Unified Behat Project and Test Management
[![Gitter](https://badges.gitter.im/generalconsensus/Madhatter.svg)](https://gitter.im/generalconsensus/Madhatter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Madhatter is an all-in-one Behat Project Management Tool. Madhatter helps you manage your Behat Installations better by allowing you to list all local Behat projects and test runs, as well as detailed analysis on tests. It is currently a work in progress

## Project Listing
![Project Listing](https://raw.githubusercontent.com/generalconsensus/Madhatter/master/img/demo_2.png "Project Listing")
## Project Detail Page
![Project Detail Page](https://raw.githubusercontent.com/generalconsensus/Madhatter/master/img/demo_1.png "Project Detail Page")
## Feature Test Detail
![Feature Test Detail](https://raw.githubusercontent.com/generalconsensus/Madhatter/master/img/demo_3.png "Feature Test Detail")

## Usage
### Requirements
* [NodeJS](http://nodejs.org/) (with [NPM](https://www.npmjs.org/))
* [Bower](http://bower.io)
* [Gulp](http://gulpjs.com)
* [Electron](http://electron.atom.io) -- Included

### Installation
1. Clone the repository: `git clone https://github.com/generalconsensus/Madhatter`
2. Install the NodeJS dependencies: `npm install`.
3. Install the Bower dependencies: `bower install`.
4. Run the gulp build task: `gulp build`.
5. Run the gulp default task: `gulp`. This will build any changes made automatically
6. Run npm start. This will start electron with `electron main.js`

Ensure your preferred web server points towards the `dist` directory.

### Development
Continue developing the dashboard further by editing the `src` directory. With the `gulp` command, any file changes made will automatically be compiled into the specific location within the `dist` directory.

#### Modules & Packages
By default, Madhatter includes [`ui.bootstrap`](http://angular-ui.github.io/bootstrap/), [`ui.router`](https://github.com/angular-ui/ui-router), [`ngCookies`](https://docs.angularjs.org/api/ngCookies) and [`treeControl`](https://wix.github.io/angular-tree-control/)

If you'd like to include any additional modules/packages not included with Madhatter, add them to your `bower.json` file and then update the `src/index.html` file, to include them in the minified distribution output.


