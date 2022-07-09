// https://levelup.gitconnected.com/set-up-and-run-a-simple-node-server-project-38b403a3dc09
// ?? - https://www.npmjs.com/package/@artsy/express-reloadable

const Dictionary = require('./dictionary.js')
const FirstTokenDictionary = require('./firsttokendictionary.js')

const express = require('express'); //Import the express dependency
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

const env = process.argv[2] || 'dev';
const is_prod = (env == 'prod');

// ---- Utilities
function scanLines(file, perLine)
{
  console.log('Scanning ' + file)
  const data = new nReadlines(file);

  let line;
  while (line = data.next())
  {
    perLine(line)
  }
  console.log('Finished scanning ' + file)
}

function exposeStringEndpoint(endpoint, stringFunction)
{
  app.get(endpoint, (req, res) => {
    res.send(stringFunction())
  })
}

// -- /randombio
if (!is_prod) // too much data for GitHub
{
  const bio_dictionary = new Dictionary();
  scanLines('../../bios.txt', (line) =>
  {
    const bio = line.toString('ascii')
    if (bio.length <=1)
    {
      return;
    }
    bio_dictionary.addWholeEntryToDictionary(bio)
  })
  exposeStringEndpoint('/randombio', () => bio_dictionary.buildRandom())
}

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
if (!is_prod) // too much data for GitHub
{
  const song_dictionary = new FirstTokenDictionary();
  scanLines('../../data/unique_tracks.txt', (line) =>
  {
    const withsep = line.toString('utf-8')
    const separated = withsep.split('<SEP>')
    const artist = separated[2]
    const song = separated[3]
    song_dictionary.addToDictionary(song, artist)
  })
  exposeStringEndpoint('/randomsong', () => song_dictionary.buildRandom())
}
// --

// ----
