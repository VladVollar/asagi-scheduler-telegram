import { listReminders } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupReminderListCommand = (bot) => {
    bot.command('reminder_list', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const reminders = listReminders(ctx);
        if (reminders.length > 0) {
            ctx.reply(`Ваши напоминания:\n${reminders.join('\n')}`);
        } else {
            ctx.reply('У вас нет установленных напоминаний.');
        }
    });
};

export { setupReminderListCommand };