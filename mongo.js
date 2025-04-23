const Person = require('./models/person')
const mongoose = require('mongoose')
require('dotenv').config()  // Load environment variables

// Get password from command-line arguments or environment variable
const password = process.argv[2] || process.env.MONGO_PASSWORD
const username = process.env.MONGO_USERNAME || 'LeoFullStack'

// If password is missing, show an error
if (!password) {
  console.log('Error: Please provide the MongoDB password either as a command-line argument or in the .env file.')
  process.exit(1)
}

// MongoDB URI (you can also pass username and password via environment variables)
const url = `mongodb+srv://${username}:${password}@phonebook.oyndo8t.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

// ADD PERSON: If 5 arguments: node mongo.js password "Name" "Number"
if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })

// LIST PERSONS: If only 3 arguments: node mongo.js password
} else if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(p => {
      console.log(`${p.name} ${p.number}`)
    })
    mongoose.connection.close()
  })

} else {
  console.log('Usage:')
  console.log('  node mongo.js <password>              --> list entries')
  console.log('  node mongo.js <password> <name> <number>  --> add entry')
  mongoose.connection.close()
}
