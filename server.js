const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const TwitterPackage = require('twitter');
const twitterConfig = require('./public/assets/js/twitterconfig.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true  }));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, function () {
  console.log('The website for the automated dissemination application is now available at http://localhost:3000')
})

app.post('/mendeley.html', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  storeDoc(JSON.stringify(req.body));

  // TEST - Uncomment to view the saved documents on the server in the terminal
  console.log(documents);
})


const documents = [];

function storeDoc(myDoc) {
  let myServerDoc = JSON.parse(myDoc);
  // if it its the first document on the server
  if (documents.length === 0) {
    documents.push({
      title: myServerDoc.Title,
      authors: myServerDoc.Author,
      year: myServerDoc.Year
    })
    // prepare the tweet
    let twitterStatus = `There is a new publication avaible: ${myServerDoc.Title}`;
    postTweet(twitterStatus);
  } else if (documents.length !== 0) {
    // check if the document is already stored on the server
    if (documents.find(checkDuplicates)) {
      // It's already there, so do nothing
    } else {
      documents.push({
        title: myServerDoc.Title,
        authors: myServerDoc.Author,
        year: myServerDoc.Year
      })
      let twitterStatus = `There is a new publication avaible: ${myServerDoc.Title}`;
      postTweet(twitterStatus);
    }
  }
  function checkDuplicates(document) {
    return document.title === myServerDoc.Title;
  }
}

// Twitter Notification
var Twitter = new TwitterPackage(twitterConfig);

function postTweet(twitterStatus) {
  Twitter.post('statuses/update', {status: twitterStatus},  function(error, tweet, response){
    if(error){
      console.log(error);
    }
    // TEST - Uncomment to display the content of the tweet in the terminal
    console.log('A new tweet with the following status was sent: ' + twitterStatus)
  });
}