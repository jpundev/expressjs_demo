//Logger to debug the recieved and sent requests (DEBUGGER)
const logger = (req,res,next)=>{
    console.log('Received: ' + `${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
};

module.exports = logger;