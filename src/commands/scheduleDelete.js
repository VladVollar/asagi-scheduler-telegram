import { deleteSchedule } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupScheduleDeleteCommand = (bot) => {
    bot.command('schedule_delete', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, (ctx) => {
        deleteSchedule();
        ctx.reply('Расписание сброшено до дефолтного состояния.');
    });
};

export { setupScheduleDeleteCommand };