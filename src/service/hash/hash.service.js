const bcrypt = require("bcrypt");

exports.generateHashPassword = async (passwords, saltRounds = 10) => {
    const password = passwords;
    return await bcrypt.hash(password, saltRounds);
};
exports.checkHashPassword = async (password, dbPassword) => {
    return await bcrypt.compare(password, dbPassword);
};
exports.generateHash = async (str, saltRounds = 6) => {
    return await bcrypt.hash(str, saltRounds);
};
exports.checkHash = async (str, hashStr) => {
    return await bcrypt.compare(str, hashStr);
};