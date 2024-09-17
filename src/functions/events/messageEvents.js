import { importSchedule, handleScheduleMessage, handleReminderMessage } from '../scheduleSettings.js';
import { groupIgnoreMiddleware } from '../middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../middleware/registrationMiddleware.js';

const setupMessageEvents = (bot) => {
    bot.on('text', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        if (ctx.session.awaitingImport) {
            try {
                importSchedule(ctx.message.text, ctx);
                ctx.reply('Расписание успешно импортировано.');
            } catch (error) {
                ctx.reply(error.message);
            } finally {
                ctx.session.awaitingImport = false;
            }
        } else if (ctx.session.selectedDay !== undefined && ctx.session.selectedSlot !== undefined) {
            handleScheduleMessage(ctx);
        } else if (ctx.session.selectedDate) {
            handleReminderMessage(ctx);
        } else {
            ctx.deleteMessage(ctx.message.message_id);
        }
    });

    bot.on('document', groupIgnoreMiddleware, registrationMiddleware, async (ctx) => {
        if (ctx.session.awaitingImport) {
            const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
            const response = await fetch(fileLink.href);
            const scheduleJson = await response.text();
            try {
                importSchedule(scheduleJson, ctx);
                ctx.reply('Расписание успешно импортировано.');
            } catch (error) {
                ctx.reply(error.message);
            } finally {
                ctx.session.awaitingImport = false;
            }
        }
    });
};

export { setupMessageEvents };