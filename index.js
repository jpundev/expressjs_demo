//Grab Express.js Library
const express = require('express');
const logger = require('./middleware/logger')
//Init Express
const app = express();

//Handle Endpoints and route Handlers
app.use('/api/emissions',require('./routes/emissions/api'));

//init the logger
app.use(logger);

//Listen on Port
//Check local Port and if errors go to 8080
const PORT = process.env.PORT || 8080;
//Return in console what port we are using
app.listen(PORT, ()=> console.log(`Server started on Port ${PORT}`))

