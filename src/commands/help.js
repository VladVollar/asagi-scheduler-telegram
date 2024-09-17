import { isAdmin } from '../functions/middleware/isAdmin.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';

const setupHelpCommand = (bot) => {
    bot.command('help', groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        const adminHelpMessage = `
Доступные команды для администраторов:
- /start - Запуск бота
- /help - Показать это сообщение
- /send - Отправить сообщение всем пользователям (используйте --silent для отправки без звука)
- /send_to_group - Отправить сообщение в учебную группу (используйте --silent для отправки без звука)
- /send_both - Отправить сообщение всем пользователям и в учебную группу (используйте --silent для отправки без звука)
- /weekdays - Выбрать дни недели
- /schedule_edit - Редактировать расписание
- /schedule_week - Показать расписание на неделю
- /schedule_today - Показать расписание на сегодня
- /schedule_tomorrow - Показать расписание на завтра
- /schedule_delete - Удалить расписание
- /schedule_export - Экспортировать расписание (JSON)
- /schedule_import - Импортировать расписание (JSON)
- /reminder_create - Установить напоминание
- /reminder_list - Показать все напоминания
- /reminder_delete - Удалить напоминание
- /reminder_calendar - Выбрать дату для напоминания
- /list_users - Показать список пользователей
- /toggle_registration - Открыть/закрыть регистрацию
    `;

        const userHelpMessage = `
Доступные команды:
- /start - Запуск бота
- /help - Показать это сообщение
- /schedule_week - Показать расписание на неделю
- /schedule_today - Показать расписание на сегодня
- /schedule_tomorrow - Показать расписание на завтра
- /reminder_create - Установить напоминание
- /reminder_list - Показать все напоминания
- /reminder_delete - Удалить напоминание
- /reminder_calendar - Выбрать дату для напоминания
    `;

        if (isAdmin(ctx)) {
            ctx.reply(adminHelpMessage);
        } else {
            ctx.reply(userHelpMessage);
        }
    });
};

export { setupHelpCommand };