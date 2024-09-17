import { sendMessageToAllUsers } from '../functions/sendMessageToAllUsers.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupSendCommand = (bot) => {
    bot.command('send', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const silentFlagIndex = args.indexOf('--silent');
        const silent = silentFlagIndex !== -1;

        if (silent) {
            args.splice(silentFlagIndex, 1);
        }

        const message = args.join(' ');

        if (message) {
            await sendMessageToAllUsers(message, { disable_notification: silent });
            ctx.reply(`Сообщение отправлено всем пользователям${silent ? ' без звука' : ''}.`);
        } else {
            ctx.reply('Пожалуйста, укажите сообщение для отправки.');
        }
    });
};

export { setupSendCommand };