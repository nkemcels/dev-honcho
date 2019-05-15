const crypto = require("crypto");

function getHashedString(password){
    let hash = crypto.createHmac("sha512", "cel5@DEV-h0nCH0");
    hash.update(password);
    return hash.digest("hex");
}

module.exports = {
    getHashedString
}