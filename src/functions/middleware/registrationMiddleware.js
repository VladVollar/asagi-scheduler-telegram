import { isRegistered } from './isRegistered.js';

const registrationMiddleware = (ctx, next) => {
    if (isRegistered(ctx)) {
        return next();
    } else {
        ctx.reply('Ошибка: Вы не зарегистрированы.');
    }
};

export { registrationMiddleware };