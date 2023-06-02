const jwt = require("jsonwebtoken");
const jwtSecrets = process.env.JWT_SECRETS;

function verifyUser(token) {
  const result = jwt.verify(token, jwtSecrets);
  return result;
}
