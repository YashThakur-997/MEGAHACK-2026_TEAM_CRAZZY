const crypto = require("crypto");

function sortObject(obj) {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

function canonicalize(data) {
  return JSON.stringify(sortObject(data));
}

function computeBatchHash(batchData) {
  const canonical = canonicalize(batchData);
  return "0x" + crypto.createHash("sha256").update(canonical).digest("hex");
}

module.exports = { computeBatchHash, canonicalize };