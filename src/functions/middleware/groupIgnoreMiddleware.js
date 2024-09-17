export const groupIgnoreMiddleware = (ctx, next) => {
    if (ctx.chat.type === 'private') {
        return next();
    }
};