import { addReminder } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupReminderCreateCommand = (bot) => {
    bot.command('reminder_create', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const [time, ...messageParts] = args;
        const message = messageParts.join(' ');
        if (time && message) {
            const success = addReminder(new Date().toISOString().split('T')[0], time, message, ctx);
            if (success) {
                ctx.reply(`Напоминание установлено на ${time}.`);
            }
        } else {
            ctx.reply('Пожалуйста, укажите время и сообщение для напоминания.');
        }
    });
};

export { setupReminderCreateCommand };