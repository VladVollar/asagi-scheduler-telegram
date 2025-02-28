import { sendMessageToAllUsers } from '../functions/sendMessageToAllUsers.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupSendBothCommand = (bot, config) => {
    bot.command('send_both', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const silentFlagIndex = args.indexOf('--silent');
        const silent = silentFlagIndex !== -1;

        if (silent) {
            args.splice(silentFlagIndex, 1);
        }

        const message = args.join(' ');

        if (message) {
            const studyGroupId = config.studyGroupId;
            await sendMessageToAllUsers(message, { disable_notification: silent });
            await bot.telegram.sendMessage(studyGroupId, message, {
                disable_notification: silent,
                parse_mode: 'HTML'
            });
            ctx.reply(`Сообщение отправлено всем пользователям и в учебную группу${silent ? ' без звука' : ''}.`);
        } else {
            ctx.reply('Пожалуйста, укажите сообщение для отправки.');
        }
    });
};

export { setupSendBothCommand };