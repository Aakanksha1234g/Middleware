
const extractTokenFromHeader = (req,res,next) => {
  const authHeader = req.headers.authorization;
  console.log('authHeader:',authHeader);
  if(!authHeader){
    return res.status(401).json({message:"No authorization header found"});
  }
  // const token = authHeader.split('');
  const token = authHeader;
  
  console.log('token:',token); 
  if(!token){
    return res.status(401).json({message: "Invalid authorization header format"});
  }
  req.access_token = token;
  console.log('req.access_token:',req.access_token);
  next();         
}

module.exports = {extractTokenFromHeader};