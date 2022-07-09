const { randomInt } = require('crypto');

class Dictionary
{
  static START_KEY = '<start>'
  static NONE_KEY = '<none>'
  static END_KEY = '<end>'

  // The maximum length of sequences to store in the dictionary.  For example 3 means 2 nested
  // layers of "leadup" words and then a layer of possible outcomes.
  static MAX_SEQ_LEN = 4

  static MAX_SENTENCES = 3

  static PUNCTUATION_SEARCH = /([.,;:!?])/g

  constructor()
  {
    this.dictionary = new Map()
  }

  // ------ buffer operations
  initStartingBuffer(size)
  {
    const buffer = new Array(size).fill(Dictionary.NONE_KEY)
    buffer[buffer.length - 1] = Dictionary.START_KEY
    return buffer
  }

  pushIntoBuffer(buffer, token)
  {
    buffer = buffer.slice(1)
    buffer.push(token)
    return buffer
  }

  padBufferWithPrecedingNone(buffer, size)
  {
    while (buffer.length < size)
    {
      buffer.unshift(Dictionary.NONE_KEY)
    }
    return buffer
  }

  // ------ build dictionary
  addSequenceToDictionary(seq) {
    // Recur on end subsequence
    if (seq.length > 2)
    {
      this.addSequenceToDictionary(seq.slice(1))
    }
    // For shorter sequences, pad seq up to MAX_SEQ_LEN with appended NONE_KEY
    seq = this.padBufferWithPrecedingNone(seq, Dictionary.MAX_SEQ_LEN)
    // Follow the sequence through the dictionary
    let currDictionary = this.dictionary
    for (let i = 0; i <= seq.length - 2 /* go to second to last token */; i++)
    {
      const token = seq[i]
      if (!currDictionary.get(token))
      {
        currDictionary.set(token, new Map());
      }
      currDictionary = currDictionary.get(token)
    }
    // Increment the sequence
    const finalToken = seq[seq.length - 1]
    if (!currDictionary.get(finalToken))
    {
      currDictionary.set(finalToken, 0);
    }
    currDictionary.set(finalToken, currDictionary.get(finalToken) + 1)
  }

  addWholeEntryToDictionary(entry)
  {
    const paddedentry = entry.replace(Dictionary.PUNCTUATION_SEARCH, ' $1')
    const alltokens = paddedentry.split(' ')

    let seq = this.initStartingBuffer(Dictionary.MAX_SEQ_LEN)
    for (let i = 0; i < alltokens.length; i++)
    {
      seq = this.pushIntoBuffer(seq, alltokens[i])
      this.addSequenceToDictionary(seq)
    }
    seq = this.pushIntoBuffer(seq, Dictionary.END_KEY)
    this.addSequenceToDictionary(seq)
  }

  // ------ build random string
  pickNextTokenFromOptions(optionsdictionary)
  {
    const nextoptionkeys = Array.from(optionsdictionary.keys())
    const nextoptionvalues = Array.from(optionsdictionary.values())

    let totalvalue = 0
    for (let i = 0; i < nextoptionkeys.length; i++)
    {
      totalvalue += nextoptionvalues[i]
    }

    const randomvalue = randomInt(totalvalue)
    let testvalue = 0
    let testindex = 0
    while (true)
    {
      testvalue += nextoptionvalues[testindex]
      if (testvalue > randomvalue)
      {
        break;
      }
      testindex++
    }
    return nextoptionkeys[testindex]
  }

  pickNextToken(originalbuffer)
  {
    let bufferworkingcopy = [...originalbuffer]

    // If buffer is too short, pad it
    bufferworkingcopy = this.padBufferWithPrecedingNone(bufferworkingcopy, Dictionary.MAX_SEQ_LEN - 1)

    let dictionary = this.dictionary;
    for (let i = 0; i < bufferworkingcopy.length; i++)
    {
      dictionary = dictionary.get(bufferworkingcopy[i])
      if (!dictionary)
      {
        break
      }
    }

    if (!dictionary || (originalbuffer.length > 1 && dictionary.size < 2))
    {
      return this.pickNextToken(originalbuffer.slice(1))
    }
    return this.pickNextTokenFromOptions(dictionary)
  }

  buildRandom()
  {
    let str = ''
    let nperiods = 0
    var buffer = [Dictionary.START_KEY]
    while (buffer[buffer.length - 1] !== Dictionary.END_KEY)
    {
        // Remove preceeding whitespace character for punctuation marks
        const currtoken = buffer[buffer.length - 1]
        if (currtoken.match(Dictionary.PUNCTUATION_SEARCH))
        {
          str = str.slice(0, -1)
        }
        if (currtoken !== Dictionary.START_KEY) // We dont enter loop for END_KEY so we only need to worry about START_KEY
        {
          str += `${currtoken} `
        }
        if (currtoken === '.')
        {
          nperiods++
          if (nperiods >= Dictionary.MAX_SENTENCES)
          {
            break
          }
        }

        const nexttoken = this.pickNextToken(buffer)
        // Build up the buffer until it reaches its maximum length
        if (buffer.length < Dictionary.MAX_SEQ_LEN - 1)
        {
          buffer.push(nexttoken)
        }
        else
        {
          buffer = this.pushIntoBuffer(buffer, nexttoken)
        }
    }
    return str
  }
}

module.exports = Dictionary
