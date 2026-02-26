// fonction success
exports.success = (result) => {
    return {
        status: 'success',
        result: result
    }
};

// fonction error
exports.error = (message) => {
    return {
        status: 'error',
        message: message
    }
};