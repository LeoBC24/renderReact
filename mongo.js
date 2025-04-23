const Person = require('./models/person');
const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

// Get MongoDB credentials from environment variables
const username = process.env.MONGO_USERNAME || 'LeoFullStack';
const password = process.env.MONGO_PASSWORD;

// Check if password is provided
if (!password) {
  console.log('Error: MongoDB password is required from environment variables or .env file.');
  process.exit(1);
}

// MongoDB URI construction
const url = `mongodb+srv://${username}:${password}@phonebook.oyndo8t.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// ADD PERSON: If 5 arguments: node mongo.js "Name" "Number"
if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save()
    .then(() => {
      console.log(`added ${person.name} number ${person.number} to phonebook`);
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Error saving person:', error.message);
      mongoose.connection.close();
    });

// LIST PERSONS: If only 3 arguments: node mongo.js
} else if (process.argv.length === 3) {
  Person.find({})
    .then(result => {
      console.log('phonebook:');
      result.forEach(p => {
        console.log(`${p.name} ${p.number}`);
      });
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Error retrieving persons:', error.message);
      mongoose.connection.close();
    });
} else {
  console.log('Usage:');
  console.log('  node mongo.js <password>              --> list entries');
  console.log('  node mongo.js <password> <name> <number>  --> add entry');
  mongoose.connection.close();
}
