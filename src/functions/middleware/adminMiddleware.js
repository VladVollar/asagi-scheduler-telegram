import { isAdmin } from './isAdmin.js';

const adminMiddleware = (ctx, next) => {
    if (isAdmin(ctx)) {
        return next();
    } else {
        ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
    }
};

export { adminMiddleware };