import {getWeekdayKeyboard} from '../functions/weekdaySettings.js';
import {groupIgnoreMiddleware} from '../functions/middleware/groupIgnoreMiddleware.js';
import {registrationMiddleware} from '../functions/middleware/registrationMiddleware.js';
import {adminMiddleware} from '../functions/middleware/adminMiddleware.js';
import {deleteMessageAfterInactivity} from '../utils/deleteMessageAfterInactivity.js';

const setupScheduleEditCommand = (bot) => {
    bot.command('schedule_edit', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, (ctx) => {
        ctx.reply('Выберите день недели для редактирования расписания:', getWeekdayKeyboard('schedule'))
            .then((sentMessage) => {
                deleteMessageAfterInactivity(bot, ctx, sentMessage.message_id);
            });
    });
};

export {setupScheduleEditCommand};