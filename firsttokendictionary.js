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
    let str = ''
    let index = randomInt(this.songlist.length)
    let nSongs = 0
    while (true)
    {
      nSongs++
      if (nSongs > 5)
      {
        break
      }
      const song = this.songlist[index][FirstTokenDictionary.SONG_KEY]
      str += `${song}|`
      const splitsong = this.splitSong(song)
      const songend = splitsong[splitsong.length - 1]

      if (this.songstarttosongs.get(songend))
      {
        const choices = this.songstarttosongs.get(songend)
        const choice = randomInt(choices.length)
        let nextIndex = choices[choice]
        if (choices.length === 1 && index === nextIndex)
        {
          // dead end
          break
        }
        index = nextIndex
        // next loop
      }
      else
      {
        break
      }
    }

    if (nSongs == 1)
    {
      // try again
      return this.buildRandom()
    }
    else
    {
      str = str.slice(0, -1) // remove trailing space
      return str
    }
  }
}

module.exports = FirstTokenDictionary