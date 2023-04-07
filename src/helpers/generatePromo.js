module.exports = function generate() {
  const res = Date.now().toString(36);
  return `${res[5]}${res[3]}${res[0]}${res[7]}${res[2]}${res[6]}${res[1]}${res[4]}`;
};
