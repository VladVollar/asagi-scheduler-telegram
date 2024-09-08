import { session } from 'telegraf';
import { addUser } from './src/functions/addUser.js';
import { bot } from './src/functions/botInstance.js';
import { sendMessageToAllUsers } from './src/functions/sendMessageToAllUsers.js';
import { getWeekdayKeyboard, handleWeekdayToggle } from './src/functions/weekdaySettings.js';
import {
    handleScheduleSelection,
    handleScheduleMessage,
    getFullSchedule,
    scheduleNotifications,
    exportSchedule,
    importSchedule,
    deleteSchedule,
    addReminder,
    listReminders,
    deleteReminder,
    scheduleReminders,
    getCalendarKeyboard,
    handleCalendarSelection,
    handleReminderMessage, getMonthYearKeyboard, getScheduleForDay
} from './src/functions/scheduleSettings.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {getUserInfo} from "./src/utils/getUserInfo.js";
import './src/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'src', 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const usersPath = path.join(__dirname, 'src', 'data', 'users.json');
const registeredUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

bot.use(session());

bot.use((ctx, next) => {
    if (!ctx.session) {
        ctx.session = {};
    }
    return next();
});

const deleteMessageAfterInactivity = (ctx, messageId, delay = 300000) => {
    let timeoutId;

    const resetTimeout = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            ctx.deleteMessage(messageId);
        }, delay);
    };

    bot.on('callback_query', (ctx) => {
        if (ctx.callbackQuery.message.message_id === messageId) {
            resetTimeout();
        }
    });

    resetTimeout();
};

const isAdmin = (ctx) => {
    const userId = ctx.message.from.id;
    return config.adminIds.includes(userId);
};

const reloadRegisteredUsers = () => {
    const usersPath = path.join(__dirname, 'src', 'data', 'users.json');
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
};

const isRegistered = (ctx) => {
    const userId = ctx.message ? ctx.message.from.id : ctx.callbackQuery.from.id;
    const registeredUsers = reloadRegisteredUsers();
    return registeredUsers.includes(userId);
};

const adminMiddleware = (ctx, next) => {
    if (isAdmin(ctx)) {
        return next();
    } else {
        ctx.reply('Ошибка: У вас нет прав для выполнения этой команды.');
    }
};

const registrationMiddleware = (ctx, next) => {
    if (isRegistered(ctx)) {
        return next();
    } else {
        ctx.reply('Ошибка: Вы не зарегистрированы.');
    }
};

const saveConfig = () => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

bot.start((ctx) => {
    if (!config.registrationOpen) {
        ctx.reply('Ошибка: Регистрация закрыта.');
        return;
    }
    const userId = ctx.message.from.id;
    const userName = ctx.message.from.first_name;
    addUser(userId);
    ctx.reply(`Привет, ${userName}! Для получения списка доступных команд используйте /help.`);
});

bot.command('help', registrationMiddleware, (ctx) => {
    const adminHelpMessage = `
Доступные команды для администраторов:
- /start - Запуск бота
- /help - Показать это сообщение
- /send - Отправить сообщение всем пользователям
- /weekdays - Выбрать дни недели
- /schedule_edit - Редактировать расписание
- /schedule_week - Показать расписание на неделю
- /schedule_today - Показать расписание на сегодня
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

bot.command('send', adminMiddleware, registrationMiddleware, async (ctx) => {
    const message = ctx.message.text.split(' ').slice(1).join(' ');
    if (message) {
        await sendMessageToAllUsers(message);
        ctx.reply('Сообщение отправлено всем пользователям.');
    } else {
        ctx.reply('Пожалуйста, укажите сообщение для отправки.');
    }
});

bot.command('weekdays', adminMiddleware, registrationMiddleware, (ctx) => {
    ctx.reply('Выберите дни недели:', getWeekdayKeyboard()).then((sentMessage) => {
        deleteMessageAfterInactivity(ctx, sentMessage.message_id);
    });
});

bot.command('schedule_edit', adminMiddleware, registrationMiddleware, (ctx) => {
    ctx.reply('Выберите день недели для редактирования расписания:', getWeekdayKeyboard('schedule')).then((sentMessage) => {
        deleteMessageAfterInactivity(ctx, sentMessage.message_id);
    });
});

bot.command('schedule_week', registrationMiddleware, (ctx) => {
    const fullSchedule = getFullSchedule();
    ctx.reply(fullSchedule);
});

bot.command('schedule_today', registrationMiddleware, (ctx) => {
    // Получаем название дня недели
    let today = new Date().toLocaleDateString('ru-RU', { weekday: 'long' });

    // Преобразуем первую букву в заглавную
    today = today.charAt(0).toUpperCase() + today.slice(1);

    const todaySchedule = getScheduleForDay(today);

    if (todaySchedule) {
        ctx.reply(`Расписание на сегодня (${today}):\n\n${todaySchedule}`);
    } else {
        ctx.reply('На сегодня нет запланированных пар.');
    }
});

bot.command('schedule_delete', adminMiddleware, registrationMiddleware, (ctx) => {
    deleteSchedule();
    ctx.reply('Расписание сброшено до дефолтного состояния.');
});

bot.command('schedule_export', adminMiddleware, registrationMiddleware, (ctx) => {
    const scheduleJson = exportSchedule();
    const dataDir = path.join(__dirname, 'src', 'data');
    const filePath = path.join(dataDir, 'schedule.json');

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    fs.writeFileSync(filePath, scheduleJson);
    ctx.replyWithDocument({ source: filePath }).then(() => {
        fs.unlinkSync(filePath);
    });
});

bot.command('schedule_import', adminMiddleware, registrationMiddleware, (ctx) => {
    ctx.session.awaitingImport = true;
    ctx.reply('Пожалуйста, отправьте JSON файл или вставьте JSON код для импорта расписания.');
});

bot.command('reminder_create', registrationMiddleware, (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const [time, ...messageParts] = args;
    const message = messageParts.join(' ');
    if (time && message) {
        const success = addReminder(new Date().toISOString().split('T')[0], time, message, ctx);
        if (success) {
            ctx.reply(`Напоминание установлено на ${time}.`);
        }
    } else {
        ctx.reply('Пожалуйста, укажите время и сообщение для напоминания.');
    }
});

bot.command('reminder_list', registrationMiddleware, (ctx) => {
    const reminders = listReminders(ctx);
    if (reminders.length > 0) {
        ctx.reply(`Ваши напоминания:\n${reminders.join('\n')}`);
    } else {
        ctx.reply('У вас нет установленных напоминаний.');
    }
});

bot.command('reminder_delete', registrationMiddleware, (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const reminderId = args[0];

    if (reminderId) {
        const success = deleteReminder(reminderId, ctx);
        if (success) {
            ctx.reply(`Напоминание с ID ${reminderId} успешно удалено.`);
        }
    } else {
        ctx.reply('Ошибка: Пожалуйста, укажите ID напоминания для удаления.');
    }
});

bot.command('reminder_calendar', registrationMiddleware, (ctx) => {
    const now = new Date();
    ctx.reply(`Выберите дату:`, getCalendarKeyboard(now.getFullYear(), now.getMonth()));
});

bot.command('list_users', adminMiddleware, registrationMiddleware, async (ctx) => {
    const { users, count } = await getUserInfo();
    const message = `Всего пользователей: ${count}\n\n` + users.map(user => `ID: ${user.id}, Имя: ${user.name}, Юзернейм: @${user.username}`).join('\n');
    ctx.reply(message);
});

bot.command('toggle_registration', adminMiddleware, registrationMiddleware, (ctx) => {
    config.registrationOpen = !config.registrationOpen;
    saveConfig();
    ctx.reply(`Регистрация ${config.registrationOpen ? 'открыта' : 'закрыта'}.`);
});

bot.action(/calendar_(\d+)_(\d+)_(\d+)/, registrationMiddleware, (ctx) => {
    handleCalendarSelection(ctx);
});

bot.action(/calendar_(prev|next)_(\d+)_(\d+)/, registrationMiddleware, (ctx) => {
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

    // Ensure the new date is not in the past
    if (newDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
        return ctx.answerCbQuery('Нельзя выбрать прошлые месяцы');
    }

    ctx.editMessageReplyMarkup(getCalendarKeyboard(newDate.getFullYear(), newDate.getMonth()).reply_markup);
});

bot.action(/calendar_(\d+)_(\d+)/, registrationMiddleware, (ctx) => {
    const year = parseInt(ctx.match[1]);
    const month = parseInt(ctx.match[2]);
    ctx.editMessageReplyMarkup(getMonthYearKeyboard(year, month).reply_markup);
});

bot.action(/select_year_(\d+)/, registrationMiddleware, async (ctx) => {
    const year = parseInt(ctx.match[1]);
    const messageId = ctx.callbackQuery.message.message_id;

    // Получаем текущую разметку сообщения
    const currentMarkup = ctx.callbackQuery.message.reply_markup;
    const currentYear = currentMarkup.inline_keyboard[0][0].callback_data.split('_')[1];

    // Проверяем, совпадает ли выбранный год
    if (year === parseInt(currentYear)) {
        return ctx.answerCbQuery(); // Ответ без сообщения
    }

    const newMarkup = getMonthYearKeyboard(year).reply_markup;

    // Если разметка одинаковая — отменяем дальнейшие действия
    if (JSON.stringify(currentMarkup) === JSON.stringify(newMarkup)) {
        return ctx.answerCbQuery(); // Ответ без сообщения
    }

    // Удаляем предыдущее сообщение перед отправкой нового, если редактирование невозможно
    try {
        await ctx.editMessageReplyMarkup(newMarkup);
    } catch (error) {
        await ctx.deleteMessage(messageId);
        ctx.reply('Выберите дату:', { reply_markup: newMarkup });
    }
});

bot.action(/select_month_(\d+)_(\d+)/, registrationMiddleware, (ctx) => {
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

bot.on('text', registrationMiddleware, (ctx) => {
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

bot.on('document', registrationMiddleware, async (ctx) => {
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

bot.action(/toggle_(.+)/, registrationMiddleware, (ctx) => {
    handleWeekdayToggle(ctx);
});

bot.action(/schedule_(.+)/, registrationMiddleware, (ctx) => {
    handleScheduleSelection(ctx);
});

bot.launch();
scheduleNotifications(bot);
scheduleReminders(bot);

console.log('Bot is running...');
