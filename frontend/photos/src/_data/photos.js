const fs = require("fs");
const path = require("path");

function makeTitle(filename) {
  const name = filename.replace(/\.[^.]+$/, "");
  if (/^\d+$/.test(name)) return `Photo ${name}`;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

module.exports = function () {
  const photosDir = path.join(__dirname, "../photos");
  const files = fs.readdirSync(photosDir);

  return files
    .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map((file) => ({
      filename: file,
      title: makeTitle(file),
      url: `/photos/${file}`,
    }));
};
