const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.stringValue}`;
    return new AppError(message, 400);
};

const handleDuplicateKeyErrorDB = (err) => {
    const message = `Duplicate field value: ${err.errorResponse.keyValue.name}`;
    return new AppError(message, 400);
};

const handleValidatorError = (err) => {
    const message = `Validation failed: ${err.errors.name.message}: ${err.errors.name.properties.value}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError("Invalid token, please log in again!", 401);

const handleJWTExpiredError = () =>
    new AppError("Your token has expired, please log in again", 401);

const sendErrorDev = (err, req, res) => {
    // 1 API
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    // 2 RENDERED WEBSITE
    return res.status(err.statusCode).render("error", {
        title: err.statusCode + " Error",
        msg: err.stack,
    });
};

const sendErrorProd = (err, req, res) => {
    // 1 API
    if (req.originalUrl.startsWith("/api")) {
        // Operational error
        if (err.isOperational) {
            console.log(err);
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });

            //Unknown error, we dont want to send info about the error
        }
        // 1 LOG ERROR
        console.error("ERROR", err);

        // 2 SEND GENERIC ERROR
        return res.status(500).json({
            status: "error",
            message: err.stack,
        });
    }

    // 2 RENDERED WEBSITE
    if (err.isOperational) {
        console.log(err);
        return res.status(err.statusCode).render("error", {
            title: err.statusCode + " Error",
            msg: err.message,
        });
    }

    // Unknown error, we dont want to send info about the error
    return res.status(err.statusCode).render("error", {
        title: err.statusCode + " Error",
        msg: err.stack,
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;

        if (String(error.reason).includes("BSONError")) {
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) error = handleDuplicateKeyErrorDB(error);

        if (String(error.errors?.name.kind).includes("minlength")) {
            error = handleValidatorError(error);
        }

        if (String(error.name) === "JsonWebTokenError")
            error = handleJWTError();

        if (String(error.name) === "TokenExpiredError")
            error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};
