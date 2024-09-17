import {getWeekdayKeyboard} from '../functions/weekdaySettings.js';
import {groupIgnoreMiddleware} from '../functions/middleware/groupIgnoreMiddleware.js';
import {registrationMiddleware} from '../functions/middleware/registrationMiddleware.js';
import {adminMiddleware} from '../functions/middleware/adminMiddleware.js';
import {deleteMessageAfterInactivity} from "../utils/deleteMessageAfterInactivity.js";

const setupWeekdaysCommand = (bot) => {
    bot.command('weekdays', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, (ctx) => {
        ctx.reply('Выберите дни недели:', getWeekdayKeyboard()).then((sentMessage) => {
            deleteMessageAfterInactivity(bot, ctx, sentMessage.message_id);  // Передаём bot
        });
    });
};

export {setupWeekdaysCommand};