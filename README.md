# Automated Dissemination Tool
As a part of the masterthesis **"development of a communication and information concept for the dissemination of scientific results and publications"** this automated tool was developed to improve the dissemination of scientific results and publications from the IRIXYS Center.

## Getting started

### Installation

1. Download the project or clone it from bitbucket.

2. Download and install [NodeJS](https://nodejs.org/en/download/). It is used for the backend of this application.

3. In the terminal, switch to the project folder
```
cd disseminationtool
```


4. Now the dependancies of the project need to be installed. For this, the Node Package Manager (npm) is used. In the terminal type:
```
npm install
```

### Usage
Now the application is ready to go. In the terminal type:
```
npm start
```
or
```
node server
```

Both commands will start the local node server. It can be canceled with:
```
strg + c
```

The automated dissemination tool can now be used at: http://localhost:3000

Once you switch to the mendeley subpage, the connection to the **Mendeley API** is established and a login into a Mendeley Account is required. Use these login data:

**username:** disseminationtool@gmail.com

**password:** irixysDissemination2k17

Once the server is started and the connection to the Mendeley API is established

* all publications from the mendeley account will be loaded on the website

* they are stored in the localstorage of the browser and a browser push notification is enabled

* additionally the publications are stored on the server

* and a tweet about the new publication is sent. The tweets can be found at: https://twitter.com/Disseminatetool

## Testing & Debugging

### Upload or delete publications on mendeley

To test the application there are other publication files available in the **sample publication** folder.

Head over to the [mendeley website](https://www.mendeley.com/profiles/dissemination-tool/) and adjust the publications of the profile by adding new ones or deleting some of them, while the server is still running.

**Make sure to add or adjust the metadata like author, title and year on mendeley.**

Once you reload the page, the new data is loaded and new notifications are sent.

### Tests in the Code

There are several tests to check the different steps of the tool in the developer tools of the browser(str + shift + i). They need to be uncommented in the specific JavaScript file.

In the file _public/assets/js/mendeleyapi.js_

* line 119: shows if a publication is already stored in the localstorage

* line 137: lists all publications stored in the localstorage

* line 263: shows the result of the fetch API

* line 275: shows if a publication is new to the localstorage, the content of a browser push notification

The following tests can be seen in the terminal as they are running on the server.

In the file _server.js_

* line 22: shows all publications stored on the server

* line 68: shows the content of the sent tweet


To clear the localstorage of a browser type the following command in the developer tools console:
```
localStorage.clear()
```
