# Frame - Electron & Web App

Frontend components and config for Frame, which builds for both Electron and the web.

IMPORT: Included in the folder is /custom_node_modules. You should replace the packages from this folder into your actual /node_modules after running "npm install", since there are certain unofficial fixes made to some libraries to fix bugs.

Notes:

- State management is done with key-value retrieval in Window.sessionStorage API and helper functions. As the project grows this should move to Redux and other libraries.
- Currently only builds for Windows have been created. For Linux and Mac, this needs to be done on machines with those OSes. Linux could probably be built on a VM; this should be tried soon.

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

First build and minify the web files:
```sh
$ npm run build
```

Then  build binaries for distribution:

Default platform (current machine):
```sh
$ npm run electron-build 
```

Or:

```sh
$ npm run electron-build --linux
```
```sh
$ npm run electron-build --mac
```
```sh
$ npm run electron-build --windows
```

(The reason why the above build commands aren't combined in the package file is because this way it's easier to handle slashes in the paths across Windows and other platforms).

Binary is saved along with its unpacked contents within ./dist. 