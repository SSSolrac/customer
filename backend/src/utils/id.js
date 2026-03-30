function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
}

module.exports = { makeId };
