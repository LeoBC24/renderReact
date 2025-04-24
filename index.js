require('dotenv').config();  // This should be at the top, before you use process.env

const errorHandler = require('./middleware/errorHandler')
const Person = require('./models/person');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const app = express();
const mongoose = require('mongoose');

// MongoDB connection URL
const url = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@phonebook.oyndo8t.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

morgan.token('post-data', (req) => {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify(req.body);
  }
  return '';
});

app.use(morgan(':method :url :status :response-time ms :post-data'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

// GET Home

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
});

// GET info

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const currentTime = new Date().toString();
    res.send(`<p>Phonebook has info for ${count} people</p><p>${currentTime}</p>`);
  });
});

// NEW Get persons
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

// GET person by id

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch(error => next(error));
});

// DELETE person by id

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  Person.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => next(error));
});



// POST

app.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' });
  }

  const person = new Person({ name, number });

  try {
    const savedPerson = await person.save();
    res.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

// PUT - update existing person
app.put('/api/persons/:id', async (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' });
  }

  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    );

    if (updatedPerson) {
      res.json(updatedPerson);
    } else {
      res.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    next(error);
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
