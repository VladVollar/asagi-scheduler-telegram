import {
    getCalendarKeyboard,
    getMonthYearKeyboard,
    handleCalendarSelection,
    handleScheduleSelection
} from '../scheduleSettings.js';
import { groupIgnoreMiddleware } from '../middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../middleware/registrationMiddleware.js';
import {handleWeekdayToggle} from "../weekdaySettings.js";

const setupCalendarActions = (bot) => {
    bot.action(/calendar_(\d+)_(\d+)_(\d+)/, groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        handleCalendarSelection(ctx);
    });

    bot.action(/calendar_(prev|next)_(\d+)_(\d+)/, groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const action = ctx.match[1];
        const year = parseInt(ctx.match[2]);
        const month = parseInt(ctx.match[3]);

        let newDate;
        if (action === 'prev') {
            newDate = new Date(year, month - 1);
        } else {
            newDate = new Date(year, month + 1);
        }

        const now = new Date();

        if (newDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
            return ctx.answerCbQuery('Нельзя выбрать прошлые месяцы');
        }

        ctx.editMessageReplyMarkup(getCalendarKeyboard(newDate.getFullYear(), newDate.getMonth()).reply_markup);
    });

    bot.action(/calendar_(\d+)_(\d+)/, groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const year = parseInt(ctx.match[1]);
        const month = parseInt(ctx.match[2]);
        ctx.editMessageReplyMarkup(getMonthYearKeyboard(year, month).reply_markup);
    });

    bot.action(/select_year_(\d+)/, groupIgnoreMiddleware, registrationMiddleware, async (ctx) => {
        const year = parseInt(ctx.match[1]);
        const messageId = ctx.callbackQuery.message.message_id;

        const currentMarkup = ctx.callbackQuery.message.reply_markup;
        const currentYear = currentMarkup.inline_keyboard[0][0].callback_data.split('_')[1];

        if (year === parseInt(currentYear)) {
            return ctx.answerCbQuery();
        }

        const newMarkup = getMonthYearKeyboard(year).reply_markup;

        if (JSON.stringify(currentMarkup) === JSON.stringify(newMarkup)) {
            return ctx.answerCbQuery();
        }

        try {
            await ctx.editMessageReplyMarkup(newMarkup);
        } catch (error) {
            await ctx.deleteMessage(messageId);
            ctx.reply('Выберите дату:', { reply_markup: newMarkup });
        }
    });

    bot.action(/select_month_(\d+)_(\d+)/, groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const year = parseInt(ctx.match[1]);
        const month = parseInt(ctx.match[2]);
        const currentMarkup = ctx.update.callback_query.message.reply_markup;
        const [currentYear, currentMonth] = currentMarkup.inline_keyboard[0][0].callback_data.split('_').slice(1).map(Number);

        if (year === currentYear && month === currentMonth) {
            return ctx.answerCbQuery('Этот месяц уже выбран');
        }

        if (year === currentYear && month < currentMonth) {
            return ctx.answerCbQuery('Нельзя выбрать прошлые месяцы');
        }

        const newMarkup = getCalendarKeyboard(year, month).reply_markup;

        if (JSON.stringify(currentMarkup) === JSON.stringify(newMarkup)) {
            return ctx.answerCbQuery('Этот месяц уже выбран');
        }

        ctx.editMessageReplyMarkup(newMarkup);
    });
};

export { setupCalendarActions };