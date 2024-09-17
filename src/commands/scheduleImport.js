import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupScheduleImportCommand = (bot) => {
    bot.command('schedule_import', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, (ctx) => {
        ctx.session.awaitingImport = true;
        ctx.reply('Пожалуйста, отправьте JSON файл или вставьте JSON код для импорта расписания.');
    });
};

export { setupScheduleImportCommand };