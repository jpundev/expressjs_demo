//Grab Express.js Library
const express = require('express');
//Logger is used for debugging purposes. Prints stuff into console every time there is a request.
const logger = require('./middleware/logger')
//Init Express
const app = express();

//Handle Endpoints and route Handlers
app.use('/api/emissions',require('./routes/emissions/api'));

//init the logger
// app.use(logger);

//Listen on Port
// 8080
const PORT = 8080;
//Return in console what port we are using
app.listen(PORT, ()=> console.log(`Server started on Port ${PORT}`))

