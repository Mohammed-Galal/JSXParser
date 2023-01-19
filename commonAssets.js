module.exports = {
  emptyStr: "",
  cut: String.prototype.slice === undefined ? "substring" : "slice",
  openingTagExp: /^\<\w/,
};
