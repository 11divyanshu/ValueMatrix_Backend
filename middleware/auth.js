// FORMAT OF TOKEN
// Authorization: BEARER  <access_token>

function verifyToken(req,res,next){
    // Get auth header value
    const bearerHeader =  req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof(bearerHeader) !== 'undefined'){
        // Split at the space
        const bearer = bearerHeader.split(" ");
        // Get token
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // next middleware
        
        next();
    }   
    else{
        // Forbidden
        res.sendStatus(403);
    }
}
export default verifyToken;