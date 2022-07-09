// Ideally, borrows heavily from dictionaryjs in a way that is laughable that it was not done as inheritance

const { randomInt } = require('crypto');

class FirstTokenDictionary
{

  static SONG_KEY = 's'
  static ARTIST_KEY = 'k'

  constructor()
  {
    this.songlist = [];
    this.songstarttosongs = new Map();
  }

  splitSong(song)
  {
    return song.split(' ')
  }

  addToDictionary(song, artist)
  {
    this.songlist.push({
        [FirstTokenDictionary.SONG_KEY] : song,
        [FirstTokenDictionary.ARTIST_KEY] : artist
      });
    const index = this.songlist.length - 1

    const songstarttoken = this.splitSong(song)[0]
    if (!this.songstarttosongs.get(songstarttoken))
    {
      this.songstarttosongs.set(songstarttoken, [])
    }
    this.songstarttosongs.get(songstarttoken).push(index)
  }

  buildRandom()
  {
    let index = randomInt(this.songlist.length)
    while (true)
    {
      const song = this.songlist[index][FirstTokenDictionary.SONG_KEY]
      console.log(song)
      const splitsong = this.splitSong(song)
      const songend = splitsong[splitsong.length - 1]

      if (this.songstarttosongs.get(songend))
      {
        const choices = this.songstarttosongs.get(songend)
        const choice = randomInt(choices.length)
        index = choices[choice]
        // next loop
      }
      else
      {
        break
      }
    }
  }

}

module.exports = FirstTokenDictionary