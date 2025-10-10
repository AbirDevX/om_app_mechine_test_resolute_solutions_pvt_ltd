class HttpException extends Error {
    constructor(statusCode, message, errorData) {
        super();
        this.message = message;
        this.status = statusCode;
        if (errorData) {
            this.data = errorData;
        }
    }
}

module.exports = { HttpException };
