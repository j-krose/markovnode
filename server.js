// https://levelup.gitconnected.com/set-up-and-run-a-simple-node-server-project-38b403a3dc09
// ?? - https://www.npmjs.com/package/@artsy/express-reloadable

const Dictionary = require('./dictionary.js')
const FirstTokenDictionary = require('./firsttokendictionary.js')

const axios = require('axios');
const express = require('express'); //Import the express dependency
const fs = require('fs');
const nReadlines = require('n-readlines');

const port = process.env.PORT || 5000;                  //Save the port number where your server will be listening
const app = express();              //Instantiate an express app, the main work horse of this server

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
  console.log(`Now listening on port ${port}`);
});

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
  res.sendFile('index.html', { root: __dirname });      //server responds by sending the index.html file to the client's browser
  //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

const env = process.argv[2] || 'prod';
const is_prod = (env == 'prod');

// ---- Utilities
function scanString(str, perLine)
{
  const data = str.split(/\r?\n/);
  for (const line of data)
  {
    perLine(line)
  }
}

function scanLines(fileName, perLine)
{
  const fileLocation = `data/${fileName}`
  if (fs.existsSync(fileLocation))
  {
    console.log(`Parsing local ${fileLocation}`)
    fs.readFile(fileLocation, 'utf8', (err, data) => {
      if (err)
      {
        console.error(`Error reading ${fileLocation}: ${err}`);
      }
      else
      {
        scanString(data, perLine)
        console.log(`Finished parsing local ${fileLocation}`)
      }
    });
  }
  else
  {
    // Need to fetch from remote
    const url = `http://designer-speak-data.s3-website-us-east-1.amazonaws.com/${fileName}`
    console.log(`Parsing remote ${url}`)
    axios
      .get(url)
      .then(res => {
        // Write the file so that we do not need to fetch it next time
        const str = res.data
        fs.writeFile(fileLocation, str, (err) =>
        {
          if (err)
          {
            console.error(`Error saving ${fileName}: ${err}`);
          }
        });

        scanString(str, perLine)
        console.log(`Finished parsing remote ${url}`)
      })
      .catch(error => {
        console.error(`Error getting ${url}: ${error}`);
      });
  }
}

function exposeStringEndpoint(endpoint, stringFunction)
{
  app.get(endpoint, (req, res) => {
    const str = stringFunction()
    console.log(`${endpoint}: ${str}`)
    res.send(str)
  })
}
// ----

// -- /randombio
const bio_dictionary = new Dictionary();
scanLines('bios.txt', (line) =>
{
  const bio = line.toString('ascii')
  if (bio.length <=1)
  {
    return;
  }
  bio_dictionary.addWholeEntryToDictionary(bio)
})
exposeStringEndpoint('/randombio', () => bio_dictionary.buildRandom())
// --

// -- /randomtagline
const tagline_dictionary = new Dictionary();
scanLines('taglines.tsv', (line) =>
{
  const bio = line.toString('utf-8')
  tagline_dictionary.addWholeEntryToDictionary(bio)
})
exposeStringEndpoint('/randomtagline', () => tagline_dictionary.buildRandom())
// --

// -- /randomsong
const song_dictionary = new FirstTokenDictionary();
scanLines('unique_tracks.txt', (line) =>
{
  const separated = line.split('<SEP>')
  if (separated.length >= 4)
  {
    const artist = separated[2]
    const song = separated[3]
    song_dictionary.addToDictionary(song, artist)
  }
})
exposeStringEndpoint('/randomsong', () => song_dictionary.buildRandom())
// --
// ----
