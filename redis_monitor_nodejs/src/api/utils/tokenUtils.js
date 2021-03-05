exports.extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    return token;
  } else {
    return null;
  }
}
