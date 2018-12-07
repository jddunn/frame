# Frame UI - Electron & Web 

Frontend components and config for Frame, which builds for both Electron and the web.

Notes:

- State management is done with key-value retrieval in Window.sessionStorage API and helper functions. As the project grows this should move to Redux and other libraries.

# Installation
To install all the packages run either:
```sh
$ npm install
```
# Running the source for web
To run in a browser using the webpack dev server in development mode with hot reloading:

```sh
$ npm run start
```

# Running the source using Electron

To run a development build with hot reloading in Electron:
```sh
$ npm run electron-dev
```

# Building the source for the web

To build for production:
```sh
$ npm run build
```
To make a development build:
```sh
$ npm run build-dev
```

# Building the source with Electron-Builder

To build binaries for production:
```sh
$ npm run electron-build
```