//remove the password hash before sending a user to the client
const omitPassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

//parse an id from the route: positive integer, or null when it is not valid
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

module.exports = { omitPassword, parseId };
