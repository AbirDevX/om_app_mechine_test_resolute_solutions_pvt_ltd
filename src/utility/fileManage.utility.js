const {HttpException} = require("./exception/httpException");
const fs = require("fs").promises;

exports.ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, {recursive: true, mode: 0o777});
    } catch (error) {
        console.error(`Error creating folder at ${dirPath}:`, error.message);
    }
};

exports.destroyFile = async (path) => {
    try {
        await fs.unlink(path);
        console.log("File deleted successfully:", path);
    } catch (error) {
        console.error("Error deleting file:", error.message);
    }
};

exports.destroyFolder = async (path) => {
    try {
        await fs.rm(path, {recursive: true, force: true});
        console.log("Folder deleted successfully:", path);
    } catch (error) {
        console.error("Error deleting folder:", error.message);
    }
};