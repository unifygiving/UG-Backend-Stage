export const jsonParseErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.log(err);
        return res.status(400).json({ message: 'Syntax error. Check for invalid JSON in the body or your request.' });
    }
    next();
};