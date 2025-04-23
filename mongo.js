const mongoose = require('mongoose')

// Get the password from command-line arguments
const password = process.argv[2]

// Your MongoDB connection string (update <username> and cluster)
const url = `mongodb+srv://LeoFullStack:${password}@phonebook.oyndo8t.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Phonebook`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

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
