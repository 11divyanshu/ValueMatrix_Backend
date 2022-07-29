import jwt from 'jsonwebtoken';
import {} from "dotenv/config";

export const tokenGenerator = async(request, response) => {
    try {
        const access_token = jwt.sign({ user: request.body.user}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 6*60});         
        return response.json({token:access_token});
    } catch (error) {
        console.log("Error: ",error);
    }
}