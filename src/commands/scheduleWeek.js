import { getFullSchedule } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupScheduleWeekCommand = (bot) => {
    bot.command('schedule_week', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const fullSchedule = getFullSchedule();
        ctx.reply(fullSchedule, { parse_mode: 'HTML' });
    });
};

export { setupScheduleWeekCommand };