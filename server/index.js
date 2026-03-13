const express = require('express')

const app = express()
app.use(express.json())

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})