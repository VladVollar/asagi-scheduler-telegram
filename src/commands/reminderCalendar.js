import { getCalendarKeyboard } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupReminderCalendarCommand = (bot) => {
    bot.command('reminder_calendar', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const now = new Date();
        ctx.reply(`Выберите дату:`, getCalendarKeyboard(now.getFullYear(), now.getMonth()));
    });
};

export { setupReminderCalendarCommand };