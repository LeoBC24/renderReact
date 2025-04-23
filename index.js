const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const app = express()

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))

app.use(express.json())

morgan.token('post-data', (req) => {
  if (req.method === 'POST' && req.body) {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :response-time ms :post-data'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    { 
      "id": "5",
      "name": "Leonardo Lastname", 
      "number": "12-34-56789"
    }
]


// GET Home

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
    
})

// GET info

app.get('/info', (request, response) => {
    const currentTime = new Date().toString()
    const numberOfEntries = persons.length
    response.send(`<p>Phonebook has info for ${numberOfEntries} people</p><p>${currentTime}</p>`)
})

// GET all persons 
  
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// GET person by id

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

// DELETE person by id

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

// POST

app.post('/api/persons', (request, response) => {
  const { name, number } = request.body

  // Check if name or number is missing
  if (!name || !number) {
      return response.status(400).json({
          error: 'Name and number are required'
      })
  }

  // Check if the name already exists
  if (persons.some(person => person.name === name)) {
      return response.status(400).json({
          error: 'Name must be unique'
      })
  }

  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id))) 
    : 0

  const person = {
      name,
      number,
      id: String(maxId + 1)
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})