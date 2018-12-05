# React Electron & Web Boilerplate

- This boilerplate out the box will allow you to develop and build your react application both as a web based application as well as an Electron app.  
- Straight off you will be able to build, and package the application producing a ready to go windows executable.  Of course you can package for mac os, linux etc as well.
- A sample login and landing page written using Semantic UI React is included showing how to use redux and redux-thunk, and the corresponding actions, reducers.  Included is sample service/api the actions can talk to.
- Included is a 'SecureRoute' wrapper which checks if the user is logged in before rendering the secure page.
- The boiler plate comes with the routing history wired up to redux.
- The folder structure shows how to reasonably seperate containers (connected components) from normal react components.


# Installation
To install all the packages run either:

```sh
$ yarn
```
or

```sh
$ npm install
```
# Running the source for web
To run in a browser using the webpack dev server in development mode
```sh
$ npm start
```

# Running the source using Electron

To run a production build
```sh
$ npm run electron-prod
```
To run a development build
```sh
$ npm run electron-dev
```


# Building the source for the web

To build for production
```sh
$ npm run build
```
To make a development build
```sh
$ npm run build-dev
```

# Building the source for Electron

To build for production
```sh
$ npm run electron-build
```
# Packaging the electron build for Windows

To package the production electron build produced from running (above) 'npm run electron-build'
```sh
$ npm run electron-package
```
The output binaries can be found in electron/package/react-electron-web-boilerplate-win32-ia32


