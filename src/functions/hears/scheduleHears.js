import { getFullSchedule, getScheduleForDay } from '../scheduleSettings.js';
import { groupIgnoreMiddleware } from '../middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../middleware/registrationMiddleware.js';

const setupScheduleHears = (bot) => {
    bot.hears('Расписание на сегодня', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        let today = new Date().toLocaleDateString('ru-RU', { weekday: 'long' });
        today = today.charAt(0).toUpperCase() + today.slice(1);
        const todaySchedule = getScheduleForDay(today);

        if (todaySchedule) {
            ctx.reply(`<b>Расписание на сегодня (${today})</b>:\n\n${todaySchedule}`, { parse_mode: 'HTML', disable_web_page_preview: true });
        } else {
            ctx.reply('На сегодня нет запланированных пар.');
        }
    });

    bot.hears('Расписание на завтра', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow = tomorrow.toLocaleDateString('ru-RU', { weekday: 'long' });
        tomorrow = tomorrow.charAt(0).toUpperCase() + tomorrow.slice(1);
        const tomorrowSchedule = getScheduleForDay(tomorrow);

        if (tomorrowSchedule) {
            ctx.reply(`<b>Расписание на завтра (${tomorrow})</b>:\n\n${tomorrowSchedule}`, { parse_mode: 'HTML', disable_web_page_preview: true });
        } else {
            ctx.reply('На завтра нет запланированных пар.');
        }
    });

    bot.hears('Расписание на неделю', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const fullSchedule = getFullSchedule();
        ctx.reply(fullSchedule, { parse_mode: 'HTML', disable_web_page_preview: true });
    });
};

export { setupScheduleHears };