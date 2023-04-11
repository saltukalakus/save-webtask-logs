## Webtask-logs-export Chrome plugin

A Chrome extension to export Auth0's Real-time Webtask logs to your computer as files.

### How to install the extension

- Download the zip file and extract it to a folder on your computer.

<img width="1522" alt="Screen Shot 2021-09-01 at 23 12 53" src="https://user-images.githubusercontent.com/815705/131738573-44bc4731-a08a-4bca-9bf6-388cbeeed6ea.png">


- Navigate to chrome://extensions/ and install the extension with <b>Load unpacked</b> from the unzipped dist folder.

<img width="1704" alt="Screen Shot 2021-09-01 at 23 08 29" src="https://user-images.githubusercontent.com/815705/131738736-11cd9e9d-1f0a-431c-8038-37d648cc503a.png">


### How to use the extension.

- Start the <b>Real-time Webtask Logs</b> extension. You should see a button to download the logs as files to your computer.

<img width="1093" alt="Screen Shot 2021-09-01 at 23 04 00" src="https://user-images.githubusercontent.com/815705/131738763-6b7910cf-1537-49b0-894c-eece525a829d.png">


### Fine tune extension - optional

<img width="534" alt="Screen Shot 2021-09-01 at 23 05 37" src="https://user-images.githubusercontent.com/815705/131738820-a210ab13-ee4d-4642-a90e-b8442180ff2d.png">


Based off of https://github.com/chibat/chrome-extension-typescript-starter

## Prerequisites

* [node + npm](https://nodejs.org/) (see `.nvmrc` for version)

## Option

* [Visual Studio Code](https://code.visualstudio.com/)

## Includes the following

* TypeScript
* Webpack
* React
* Jest
* Example Code
    * Chrome Storage
    * Options Version 2
    * content script
    * count up badge number
    * background

## Project Structure

* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory
* dist/js: Generated JavaScript files

## Setup

```
npm install
```

## Import as Visual Studio Code project

...

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory

## Test
`npx jest` or `npm run test`
