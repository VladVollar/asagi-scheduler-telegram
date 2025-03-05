import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupSendToGroupCommand = (bot, config) => {
    bot.command('send_to_group', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const silentFlagIndex = args.indexOf('--silent');
        const silent = silentFlagIndex !== -1;

        if (silent) {
            args.splice(silentFlagIndex, 1);
        }

        const message = args.join(' ');

        if (message) {
            const studyGroupId = config.studyGroupId;
            await bot.telegram.sendMessage(studyGroupId, message, {
                disable_notification: silent,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            ctx.reply(`Сообщение отправлено в учебную группу${silent ? ' без звука' : ''}.`);
        } else {
            ctx.reply('Пожалуйста, укажите сообщение для отправки.');
        }
    });
};

export { setupSendToGroupCommand };