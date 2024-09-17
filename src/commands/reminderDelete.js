import { deleteReminder } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupReminderDeleteCommand = (bot) => {
    bot.command('reminder_delete', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const reminderId = args[0];

        if (reminderId) {
            const success = deleteReminder(reminderId, ctx);
            if (success) {
                ctx.reply(`Напоминание с ID ${reminderId} успешно удалено.`);
            }
        } else {
            ctx.reply('Ошибка: Пожалуйста, укажите ID напоминания для удаления.');
        }
    });
};

export { setupReminderDeleteCommand };