const destructUser = (user) => {
  const { password, ...rest } = user;

  return { ...rest };
};

module.exports = { destructUser };
