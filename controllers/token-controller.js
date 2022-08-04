import jwt from "jsonwebtoken";
import {} from "dotenv/config";

export const tokenGenerator = async (request, response) => {
  try {
    const access_token = jwt.sign(
      { user: request.body.user, iat: Date.now()},
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 6 * 60 }
    );
    return response.json({ token: access_token });
  } catch (error) {
    console.log("Error: ", error);
  }
};

export const getUserIdFromToken = async (request, response) => {
  try {
    const access_token = request.body.access_token;
    jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, authData) => {
        if (authData === null) {
          response.sendStatus(403);
        } else {
          response.status(200).json({ user: authData });
        }
      }
    );
  } catch (error) {
    console.log("Error : ", error);
  }
};
