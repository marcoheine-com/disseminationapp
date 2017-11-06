// ###### Mendeley API ######
(() => {
  // OAuth2 Flow Configuration
  var config;
  // Set authentication method based on config
  if (typeof window.oauthImplicitGrantConfig === 'object') {
    MendeleySDK.API.setAuthFlow(MendeleySDK.Auth.implicitGrantFlow(window.oauthImplicitGrantConfig));
  } else {
    // Auth code flow can be configured with a couple fo extra URLs...
    MendeleySDK.API.setAuthFlow(MendeleySDK.Auth.authCodeFlow({
    // The API authentication goes through server, so this URL clears cookies and forces a redirect
    apiAuthenticateUrl: '/login',
    // You can optionally provide a URL on *your* server where the token can be refreshed
    refreshAccessTokenUrl: '/oauth/refresh'
    }));
  }
})();

// get all profile data
function getProfile() {
  MendeleySDK.API.profiles.retrieveByEmail(
    'marcokuehbauch@gmail.com'
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

// get all the documents
function getDocuments() {
  MendeleySDK.API.documents
  .list({
    // this option is used to get all publications of the user
    authored: true
  })
  .then(docs => {
    displayStats(docs);
    saveDocuments(docs);
  })
  // .catch(function(response) {
  //   console.log('Failed!');
  //   console.log('Status:', response.status);
  // });
}
getDocuments();

// display stats about the publications
function displayStats(docs) {
  // total publications
  const statsTotal = document.querySelector('.disseminationtool__statsTotal');
  statsTotal.textContent = docs.length;

  // all authors
  const statsAuthors = document.querySelector('.disseminationtool__statsAuthors');
  const allAuthors = [];
  docs.forEach(doc => {
    doc.authors.forEach(author => {
      allAuthors.push(author.last_name);
      if (author.first_name) { // if there is more than one author
        allAuthors.push(author.first_name);
      }
    })
  })
  statsAuthors.textContent = allAuthors.join(', ');

  // all types
  const statsType = document.querySelector('.disseminationtool__statsType');
  const allTypes = [];
  docs.forEach(doc => {
    let type = doc.type;
    // capitalize first letter
    type = type.charAt(0).toUpperCase() + type.slice(1);
    // eliminate duplicates
    if (allTypes.find(findType)) {
      // do nothing
    } else {
      allTypes.push(type);
    }
    function findType(result) {
      return result.type === allTypes.type;
    }
    statsType.textContent = allTypes.join(', ');
  })

}


// get the already chached publications, if there are none, create an empty array
const myDocs = JSON.parse(localStorage.getItem('myDocs')) || [];

function saveDocuments(docs){
  docs.forEach(doc => {
    const allAuthors = [];
    // create an object for every publication
    const myDoc = new Object();
    myDoc.title = doc.title;
    myDoc.year = doc.year;
    doc.authors.forEach(author => {
      allAuthors.push(author.last_name);
      if (author.first_name) { // if there is more than one author
        allAuthors.push(author.first_name);
      }
      myDoc.author = allAuthors.join(', ');
    })
    myDoc.abstract = doc.abstract;

    // send the document to the server
    sendDataToServer(myDoc);

    // initial check for publications in the localstorage
    if (myDocs.length == 0) {
      myDocs.push(myDoc);
      enableNotification(myDoc);
    } else if (myDocs.find(findTitle)) {  // Eliminate Duplicates
      // Do nothing

      // TEST - Uncomment to check, which publications are already in the localstorage
      // console.log('Already exists');
    } else {
      myDocs.push(myDoc);
      enableNotification(myDoc);
    }
    function findTitle(result) {
      return result.title === myDoc.title;
    }
  })
  // update the local storage
  localStorage.setItem('myDocs', JSON.stringify(myDocs));

  // TEST - Uncomment to view all documents available in the localstorage
  // console.table(JSON.parse(localStorage.getItem('myDocs')));
  displayDocuments(myDocs);
}

// display all documents
function displayDocuments(docs) {
  let counter = 0;
  docs.forEach(displayOneDoc);
}

// initial display of one document
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

// event Listener for user  search input
const input = document.querySelector('.disseminationtool__input');
input.addEventListener('change', initializeSearch);
input.addEventListener('keyup', initializeSearch);

// search for documents
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

// find the documents in the array
function findDocuments(searchInput, arrray) {
  return myDocs.filter(doc => {
    const regex = new RegExp(searchInput, 'gi');
    return doc.title.match(regex) || doc.author.match(regex);
  });
}

window.addEventListener('load', function () {
  // Check if permission for notification is available
  // If not, ask for it
  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }
});

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
  .then(function (response) {
    console.log('Request succeeded with JSON response' + response);
  })
  .catch(function (error) {
    console.log('Request failed', error);
  });
}

// ### Notifications ###
// function to build notifications
function enableNotification(myDoc) {
  // TEST - Uncomment to view the new local publications
  console.log(`There is a new Publication available: ${myDoc.title}`);

  // Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
  // Check for permission for notifications of the user
  if (window.Notification && Notification.permission === "granted") {
    // build the new notification
    var n = new Notification(`New publication available: ${myDoc.title}, ${myDoc.year}, ${myDoc.author}`);
  }
}




