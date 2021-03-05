const crypto = require("crypto"); 

exports.isValidPassword = (password) => {
  const re = /[A-Fa-f0-9]{64}/g;
  return re.test(password);
};

exports.isValidEmail = (email) => {
  // const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !re.test(email);
};

exports.getCallerIP = (req) => {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  
  ip = ip.split(",")[0];
  ip = ip.split(":").slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"

  return ip[0];
};

exports.transformUser = (user) => {
  const userObj = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    mfaType: user.mfaType,
    isMfaEnabled: user.isMfaEnabled,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
  return userObj;
};


exports.md5 = (s) => {
  // s = s.encode('utf-8')
  // m = hashlib.md5(s)
  // m.update(s)
  return crypto.createHash('md5').update(s, 'utf8').digest()

  // return m.hexdigest()
}