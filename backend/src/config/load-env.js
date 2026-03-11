const fs = require("fs");
const path = require("path");

const ENV_FILE_PATHS = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env")
];

function loadEnvFiles() {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  ENV_FILE_PATHS.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      process.loadEnvFile(filePath);
    }
  });
}

module.exports = {
  loadEnvFiles
};
