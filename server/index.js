const express = require('express')
require('./models/db.connection');
const authrouter=require('./routes/auth.router');
const drugrouter=require('./routes/drugs.router');

const app = express()
app.use(express.json())
app.use('/auth', authrouter);
app.use('/drugs', drugrouter);


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})