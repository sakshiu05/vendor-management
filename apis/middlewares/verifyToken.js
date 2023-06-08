const jwt = require('jwt-simple');
let config = require('../../config');

// module.exports = (req,res,next)=>{
const tokenAuthenticate = async (req,res,next) => {
    // const token = req.header('Authorization').replace('Bearer ','');
    const token = req.headers.authorization.split(' ')[1];
    if(!token) {
        return res.status(403).send({'message':'No token provided!'});
    }

    //verify token
    jwt.verify(token,config.TOKEN_SECRET,(error,decoded) => {
        if(error){
            return response.status(401).send({
                status: 'error',
                message: error.message,
              });
        }
    })

    // Append the parameters to the request object
    request.userId = decoded.id;
    request.tokenExp = decoded.exp;
    request.token = token;
    next();
  
  }

  module.exports = {
    tokenAuthenticate
  }