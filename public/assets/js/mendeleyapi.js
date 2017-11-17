// ###### Mendeley API ######
// Authentification with the API
(() => {
  // OAuth2 Flow Configuration
  var config;
  // Set authentication method based on config
  if (typeof window.oauthImplicitGrantConfig === 'object') {
    MendeleySDK.API.setAuthFlow(MendeleySDK.Auth.implicitGrantFlow(window.oauthImplicitGrantConfig));
  } else {
    MendeleySDK.API.setAuthFlow(MendeleySDK.Auth.authCodeFlow({
    // The API authentication goes through server, so this URL clears cookies and forces a redirect
    apiAuthenticateUrl: '/login',
    refreshAccessTokenUrl: '/oauth/refresh'
    }));
  }
})();

// get all profile data
function getProfile() {
  MendeleySDK.API.profiles.retrieveByEmail(
    'disseminationtool@gmail.com'
  ).then(myProfile => {
    displayProfile(myProfile);
  });
}
getProfile();

// display the profile information
function displayProfile(myProfile) {
  const mendeleyProfile = document.querySelector('.mendeley-profile');
  myProfile.forEach(profile => {
    // profile name
    const profileNameP = document.querySelectorAll('.disseminationtool__profileName');
    profileNameP.forEach((profileName) => {
      profileName.textContent = (profile.display_name);
    })

    // link to profile page
    const profileLink = document.querySelector('.disseminationtool__profileLink');
    profileLink.setAttribute('href', profile.link);
    const profileLinkSpan = document.querySelector('.disseminationtool__profileLinkSpan');
    profileLinkSpan.textContent = (profile.link);
  })
}

// get all the publications
function getDocuments() {
  MendeleySDK.API.documents
  .list({
    // this option is used to get all publications of the specified user
    authored: true
  })
  .then(docs => {
    saveDocuments(docs);
  })
}
getDocuments();

// get the already chached publications, if there are none, create an empty array
const myDocs = JSON.parse(localStorage.getItem('myDocs')) || [];

// store the publications in an array
function saveDocuments(docs) {
  // author array for the statistics
  const totalAuthors = []; // needs to exist additionally to allAuthors, because this one should eliminate duplicates

  // a counter for the notifications needs to be added, to allow multiple notifications in firefox
  let notificationCount = 0;

  docs.forEach(doc => {
    const allAuthors = [];
    // create an object for every publication
    const myDoc = new Object();
    myDoc.title = doc.title;
    if (doc.year) {
      myDoc.year = doc.year;
    } else {
      myDoc.year = 'No year available'
    }
    if (doc.authors) {
      doc.authors.forEach(author => {
        allAuthors.push(author.last_name);
        if (totalAuthors.includes(author.last_name)) {
          // already existing, so do nothing
        } else {
          totalAuthors.push(author.last_name);
        }
        if (author.first_name) { // if there is more than one author
          allAuthors.push(author.first_name);
          if (totalAuthors.includes(author.first_name)) {
            // already existing, so do nothing
          } else {
            totalAuthors.push(author.first_name);
          }
        }
        myDoc.author = allAuthors.join(', ');
      })
    } else {
      myDoc.author = 'No author available'
    }
    if (doc.abstract) {
      myDoc.abstract = doc.abstract;
    } else {
      myDoc.abstract = 'No abstract available'
    }

    // send the publications to the server
    sendDataToServer(myDoc);

    // initial check for publications in the localstorage
    if (myDocs.length == 0) {
      myDocs.push(myDoc);
      notificationCount++;
      enableNotification(myDoc, notificationCount);
    } else if (myDocs.find(findTitle)) {  // Eliminate Duplicates
      // already existing, so do nothing

      // TEST - Uncomment to check in dev tools (strg + shift + i), which publications are already in the localstorage
      console.log(`The publication ${myDoc.title} is already stored in the localstorage.`);

    } else {
      myDocs.push(myDoc);
      notificationCount++;
      enableNotification(myDoc, notificationCount);
    }

    function findTitle(result) {
      return result.title === myDoc.title;
    }

  })
  // update the local storage
  localStorage.setItem('myDocs', JSON.stringify(myDocs));

  // TEST - Uncomment to view all publications available in the localstorage in the dev tools (strg + shift + i)
  console.table(JSON.parse(localStorage.getItem('myDocs')));

  displayTotalNum(myDocs);
  displayAllAuthors(totalAuthors);
  displayDocuments(myDocs);
}

// display the number of all publications in the statistics
function displayTotalNum(docs) {
  // total publications
  const statsTotal = document.querySelector('.disseminationtool__statsTotal');
  statsTotal.textContent = docs.length;
}

// display names of all authors in the statistics
function displayAllAuthors(totalAuthors) {
  const allAuthors = document.querySelector('.disseminationtool__statsAuthors');
  allAuthors.textContent = totalAuthors.join(', ');
}

// display all publications
function displayDocuments(docs) {
  let counter = 0;
  docs.forEach(displayOneDoc);
}

// initial display of one publication
function displayOneDoc(doc, counter) {
  const mendeleyResults = document.querySelector('.mendeley-results');
  counter++;
  // build the containing div
  const result = document.createElement('div');
  result.classList.add('disseminationtool__mendeleyDoc');

  // add the title
  const resultTitle = document.createElement('span');
  resultTitle.textContent = `Title: ${doc.title}`;
  result.appendChild(resultTitle);

  // add the year
  const resultYear = document.createElement('span');
  resultYear.textContent = `Year: ${doc.year}`;
  result.appendChild(resultYear);

  // add the author(s)
  const resultAuthor = document.createElement('span');
  resultAuthor.textContent = `Author: ${doc.author}`;
  result.appendChild(resultAuthor);

  // add the abstract
  if (doc.abstract) {
    const showAbstract = document.createElement('label');
    showAbstract.setAttribute('class', 'disseminationtool__showAbstract');
    showAbstract.htmlFor = counter;
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'checkbox';
    hiddenInput.id = counter;
    hiddenInput.setAttribute('class', 'disseminationtool__checkBox');
    showAbstract.textContent = 'Abstract';
    const abstractWrapper = document.createElement('div');
    abstractWrapper.textContent = doc.abstract;
    abstractWrapper.classList.add('disseminationtool__abstract');
    result.appendChild(showAbstract);
    result.appendChild(hiddenInput);
    result.appendChild(abstractWrapper);
  }

  mendeleyResults.appendChild(result);
}

// event Listener for user search input
const input = document.querySelector('.disseminationtool__input');
input.addEventListener('change', initializeSearch);
input.addEventListener('keyup', initializeSearch);

// prepare the search for publications
function initializeSearch() {
  const resultDiv = document.querySelector('.mendeley-results');
  const input = document.querySelector('.disseminationtool__input');
  const searchInput = input.value;
  const results = findDocuments(searchInput, myDocs);
  let counter = 0;
  const html = results.map(doc => {
    const regex = new RegExp(this.value, 'gi');
    // replace the matches/user input with a span and a css class to add highlighting
    const docTitle = doc.title.replace(regex, `<span class="disseminationtool__hl">${searchInput}</span>`);
    const docName = doc.author.replace(regex, `<span class="disseminationtool__hl">${searchInput}</span>`);
    counter++;
    return `
    <div class="disseminationtool__mendeleyDoc">
      <span>Title: ${docTitle}</span>
      <span>Year: ${doc.year}</span>
      <span>Author: ${docName}</span>
      <label for="${counter}"class="disseminationtool__showAbstract">Abstract</label>
      <input id="${counter}"type="checkbox" class="disseminationtool__checkBox"/>
      <div class="disseminationtool__abstract">${doc.abstract}</div>
    </div>
    `;
  })
  .join('');
  resultDiv.innerHTML = html;
}

// find the publications in the array
function findDocuments(searchInput, arrray) {
  return myDocs.filter(doc => {
    const regex = new RegExp(searchInput, 'gi');
    return doc.title.match(regex) || doc.author.match(regex);
  });
}

function sendDataToServer(myDoc) {
  // using the fetch API to send the data to the server
  fetch('/mendeley.html', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      Title: myDoc.title,
      Author: myDoc.author,
      Year: myDoc.year,
    }),
  })
  // TEST - Uncomment to debug the fetch API in the dev tools (strg + shift + i)
  // .then(function (response) {
  //   console.log('Request succeeded with JSON response' + response);
  // })
  // .catch(function (error) {
  //   console.log('Request failed', error);
  // });
}

// ### Notifications ###
// function to build notifications
function enableNotification(myDoc, notificationCount) {
  // TEST - Uncomment to view the new local publications in the dev tools (strg + shift + i)
  console.log(`There is a new publication available: ${myDoc.title}`);

  // Check for permission for notifications of the user
  if(window.Notification && Notification.permission !== "denied") {
    Notification.requestPermission(function(status) {  // status is "granted", if accepted by user
      // if there is more than 1 notification, trick firefox into thinking its just 1 by setting a timeout
      if (notificationCount >= 2) {
        setTimeout(() => {
          var n = new Notification('New Publication available:', {
            body: `${myDoc.title}, ${myDoc.year}, ${myDoc.author}`,
          });
        }, 700)
       } else {
          var n = new Notification('New Publication available:', {
            body: `${myDoc.title}, ${myDoc.year}, ${myDoc.author}`,
          });
       }
    });
  }
}




