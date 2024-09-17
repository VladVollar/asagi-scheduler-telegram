import { getScheduleForDay } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupScheduleTomorrowCommand = (bot) => {
    bot.command('schedule_tomorrow', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow = tomorrow.toLocaleDateString('ru-RU', { weekday: 'long' });
        tomorrow = tomorrow.charAt(0).toUpperCase() + tomorrow.slice(1);
        const tomorrowSchedule = getScheduleForDay(tomorrow);

        if (tomorrowSchedule) {
            ctx.reply(`<b>Расписание на завтра (${tomorrow})</b>:\n\n${tomorrowSchedule}`, { parse_mode: 'HTML' });
        } else {
            ctx.reply('На завтра нет запланированных пар.');
        }
    });
};

export { setupScheduleTomorrowCommand };