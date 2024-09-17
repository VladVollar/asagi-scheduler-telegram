import { Markup } from 'telegraf';
import fs from 'fs';
import schedule from 'node-schedule';

const filePath = './src/data/scheduleSettings.json';
const usersFilePath = './src/data/users.json';
const remindersFilePath = './src/data/reminders.json';

const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const timeslots = [
    { time: '08:00', label: '1 пара (08:00 - 09:20)' },
    { time: '09:30', label: '2 пара (09:30 - 10:50)' },
    { time: '11:20', label: '3 пара (11:20 - 12:40)' },
    { time: '12:50', label: '4 пара (12:50 - 14:10)' },
    { time: '14:20', label: '5 пара (14:20 - 15:40)' },
    { time: '15:50', label: '6 пара (15:50 - 17:10)' },
    { time: '17:20', label: '7 пара (17:20 - 18:40)' },
    { time: '18:50', label: '8 пара (18:50 - 20:10)' }
];
const timeZone = 'Europe/Kiev';

const loadSettings = () => {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
};

const loadUsers = () => {
    if (fs.existsSync(usersFilePath)) {
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        return users;
    }
    return [];
};

const saveSettings = (settings) => {
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
};

const loadReminders = () => {
    if (fs.existsSync(remindersFilePath)) {
        return JSON.parse(fs.readFileSync(remindersFilePath, 'utf-8'));
    }
    return [];
};

const saveReminders = (reminders) => {
    fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2));
};

const cancelJob = (jobName) => {
    const job = schedule.scheduledJobs[jobName];
    if (job) {
        job.cancel();
    }
};

const cancelAllJobs = (specificJob = null) => {
    if (specificJob) {
        cancelJob(specificJob);
    } else {
        const allJobs = schedule.scheduledJobs;
        for (const job in allJobs) {
            allJobs[job].cancel();
        }
    }
};

export const exportSchedule = () => {
    const settings = loadSettings();
    return JSON.stringify(settings, null, 2);
};

export const importSchedule = (scheduleJson, ctx) => {
    let schedule;
    try {
        schedule = JSON.parse(scheduleJson);
    } catch (error) {
        throw new Error('Ошибка: Неверный формат JSON.');
    }

    if (Object.keys(schedule).length === 0) {
        saveSettings({});
        cancelAllJobs();
        scheduleNotifications(ctx.bot);
        return;
    }

    if (!validateSchedule(schedule)) {
        throw new Error('Ошибка: Неверный формат расписания.');
    }

    saveSettings(schedule);
    cancelAllJobs();
    scheduleNotifications(ctx.bot);
};

export const deleteSchedule = () => {
    const defaultSchedule = {
        "Понедельник": {},
        "Вторник": {},
        "Среда": {},
        "Четверг": {},
        "Пятница": {},
        "Суббота": {},
        "Воскресенье": {}
    };
    saveSettings(defaultSchedule);
    cancelAllJobs();
};

const validateSchedule = (schedule) => {
    if (Object.keys(schedule).length === 0) {
        return true;
    }

    const validWeekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    const validTimeslots = [
        '1 пара (08:00 - 09:20)', '2 пара (09:30 - 10:50)', '3 пара (11:20 - 12:40)',
        '4 пара (12:50 - 14:10)', '5 пара (14:20 - 15:40)', '6 пара (15:50 - 17:10)',
        '7 пара (17:20 - 18:40)', '8 пара (18:50 - 20:10)'
    ];

    if (typeof schedule !== 'object' || schedule === null) {
        return false;
    }

    for (const day in schedule) {
        if (!validWeekdays.includes(day)) {
            return false;
        }
        const daySchedule = schedule[day];
        if (typeof daySchedule !== 'object' || daySchedule === null) {
            return false;
        }
        for (const slot in daySchedule) {
            if (!validTimeslots.includes(slot)) {
                return false;
            }
        }
    }

    return true;
};

export const getScheduleKeyboard = (dayIndex) => {
    const settings = loadSettings();
    const day = weekdays[dayIndex];
    const buttons = timeslots.map((slot, index) => {
        const hasContent = settings[day] && settings[day][slot.label];
        const buttonText = hasContent ? `${slot.label} *` : slot.label;
        return Markup.button.callback(buttonText, `schedule_${dayIndex}_${index}`);
    });
    return Markup.inlineKeyboard(buttons, { columns: 1 });
};

export const handleScheduleSelection = (ctx) => {
    if (!ctx.session) {
        ctx.session = {};
    }

    const [dayIndex, slotIndex] = ctx.match[1].split('_').map(Number);

    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex >= weekdays.length) {
        ctx.answerCbQuery('Ошибка: Пожалуйста, выберите день недели сначала.', { show_alert: true });
        return;
    }

    const day = weekdays[dayIndex];

    if (isNaN(slotIndex)) {
        ctx.session.selectedDay = dayIndex;
        const newText = `Выберите время для ${day}:`;
        ctx.editMessageText(newText, getScheduleKeyboard(dayIndex));
        return;
    }

    if (slotIndex < 0 || slotIndex >= timeslots.length) {
        ctx.answerCbQuery('Ошибка: Неверный временной интервал.', { show_alert: true });
        return;
    }

    if (ctx.session.selectedDay === undefined) {
        ctx.session.selectedDay = dayIndex;
    }

    const slot = timeslots[slotIndex].label;
    ctx.session.selectedSlot = slotIndex;

    ctx.answerCbQuery(`Вы выбрали: ${day}, ${slot}. Пожалуйста, отправьте сообщение.`, { show_alert: true });

    const newText = `Выберите время для ${day}:`;
    if (ctx.update.callback_query.message.text !== newText) {
        ctx.editMessageText(newText, getScheduleKeyboard(dayIndex));
    }
};

export const handleScheduleMessage = (ctx) => {
    if (ctx.message.text.startsWith('/')) {
        return;
    }

    if (!ctx.session) {
        ctx.session = {};
    }

    // Extract the day of the week from the message text if not already set
    if (ctx.session.selectedDay === undefined) {
        const messageText = ctx.update.callback_query.message.text;
        const day = weekdays.find(day => messageText.includes(day));
        if (day) {
            ctx.session.selectedDay = weekdays.indexOf(day);
        }
    }

    if (ctx.session.selectedDay === undefined || ctx.session.selectedSlot === undefined) {
        ctx.reply('Пожалуйста, выберите день и время пары сначала.');
        return;
    }

    const settings = loadSettings();
    const dayIndex = ctx.session.selectedDay;
    const day = weekdays[dayIndex];
    const slotIndex = ctx.session.selectedSlot;
    const slot = timeslots[slotIndex].label;
    const messageText = ctx.message.text.trim();

    if (messageText === '-') {
        if (settings[day] && settings[day][slot]) {
            delete settings[day][slot];
            ctx.reply(`Пара на <b>${day}</b>, <b>${slot}</b> удалена.`, { parse_mode: 'HTML' });
            cancelJob(`${day}_${slot}`);
        } else {
            ctx.reply(`Пара на <b>${day}</b>, <b>${slot}</b> не найдена.`, { parse_mode: 'HTML' });
        }
    } else {
        if (!settings[day]) {
            settings[day] = {};
        }
        settings[day][slot] = messageText;
        ctx.reply(`Пара на <b>${day}</b>, <b>${slot}</b> успешно сохранена.`, { parse_mode: 'HTML' });
    }

    saveSettings(settings);

    delete ctx.session.selectedDay;
    delete ctx.session.selectedSlot;

    scheduleNotifications(ctx.bot);
};

export const getFullSchedule = () => {
    const settings = loadSettings();
    let fullSchedule = '<b>Полное расписание на неделю</b>:\n\n';
    let hasSchedule = false;

    weekdays.forEach(day => {
        if (settings[day] && Object.keys(settings[day]).length > 0) {
            fullSchedule += `<b>${day}</b>:\n`;
            timeslots.forEach(slot => {
                if (settings[day][slot.label]) {
                    fullSchedule += `– <b>${slot.label}</b>: ${settings[day][slot.label]}\n`;
                }
            });
            fullSchedule += '\n';
            hasSchedule = true;
        }
    });

    if (!hasSchedule) {
        fullSchedule = 'На неделю нет запланированных пар.';
    }

    return fullSchedule.trim();
};

export const getScheduleForDay = (day) => {
    const settings = loadSettings();
    let dailySchedule = '';
    if (settings[day] && Object.keys(settings[day]).length > 0) {
        timeslots.forEach(slot => {
            if (settings[day][slot.label]) {
                dailySchedule += `– <b>${slot.label}</b>: ${settings[day][slot.label]}\n`;
            }
        });
    }
    return dailySchedule.trim();
};

const getDailySchedule = (day, includeDayName = false) => {
    const settings = loadSettings();
    let dailySchedule = includeDayName ? `<b>Расписание на сегодня (${day})</b>:\n\n` : `${day}:\n`;
    if (settings[day] && Object.keys(settings[day]).length > 0) {
        timeslots.forEach(slot => {
            if (settings[day][slot.label]) {
                dailySchedule += `– <b>${slot.label}</b>: ${settings[day][slot.label]}\n`;
            }
        });
    } else if (settings[day]) {
        dailySchedule += 'На сегодня нет запланированных пар.\n';
    }
    return dailySchedule.trim();
};

export const scheduleNotifications = (bot) => {
    const users = loadUsers();
    const settings = loadSettings();

    // Запланировать ежедневное расписание на 07:00 по Киеву
    schedule.scheduleJob({ hour: 7, minute: 0, tz: timeZone }, () => {
        let todayIndex = new Date().getDay(); // Получаем индекс текущего дня недели (0 - воскресенье, 6 - суббота)
        todayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Преобразуем 0 (воскресенье) в 6, сдвигаем остальные дни
        const today = weekdays[todayIndex]; // Получаем название текущего дня недели

        if (settings[today]) {
            const dailySchedule = getDailySchedule(today, true);

            users.forEach(user => {
                if (user) {
                    bot.telegram.sendMessage(user, dailySchedule, { disable_notification: true, parse_mode: 'HTML' });
                }
            });
        }
    });

    // Запланировать напоминания за 5 минут до каждой пары
    weekdays.forEach((day, dayIndex) => {
        if (settings[day]) {
            timeslots.forEach(slot => {
                const slotValue = settings[day][slot.label];
                if (slotValue) {
                    const [startHour, startMinute] = slot.time.split(':').map(Number);

                    // Рассчитываем время напоминания (за 5 минут до начала)
                    let reminderHour = startHour;
                    let reminderMinute = startMinute - 5;

                    // Если минуты меньше 0, то уменьшаем час и корректируем минуты
                    if (reminderMinute < 0) {
                        reminderHour -= 1;
                        reminderMinute += 60;
                    }

                    schedule.scheduleJob({
                        hour: reminderHour,
                        minute: reminderMinute,
                        dayOfWeek: dayIndex === 6 ? 0 : dayIndex + 1, // Преобразуем наш индекс обратно для расписания (воскресенье - 0)
                        tz: timeZone
                    }, () => {

                        users.forEach(user => {
                            if (user) {
                                bot.telegram.sendMessage(user, `Напоминание: «<b>${slotValue}</b>» — <b>${slot.label}</b>, начинается через 5 минут.`, {parse_mode: 'HTML'});
                            }
                        });
                    });
                }
            });
        }
    });
};

export const deleteReminder = (reminderId, ctx) => {
    if (!ctx || !ctx.from || !ctx.from.id) {
        console.error('Context or user information is missing');
        return false;
    }

    const reminders = loadReminders();
    const reminderIndex = reminders.findIndex(reminder => reminder.id === parseInt(reminderId));

    if (reminderIndex === -1) {
        ctx.reply(`Ошибка: Напоминание с ID ${reminderId} не найдено.`);
        return false; // Возвращаем false, если напоминание не найдено
    }

    const reminder = reminders[reminderIndex];
    if (reminder.userId !== ctx.from.id) {
        ctx.reply('Ошибка: Вы не можете удалить это напоминание, так как вы не являетесь его автором.');
        return false; // Возвращаем false, если напоминание принадлежит другому пользователю
    }

    // Удаляем напоминание
    reminders.splice(reminderIndex, 1);
    saveReminders(reminders);
    schedule.cancelJob(reminderId.toString());

    return true; // Возвращаем true, если удаление прошло успешно
};

export const scheduleReminders = (bot) => {
    const reminders = loadReminders();
    reminders.forEach(reminder => {
        const [hour, minute] = reminder.time.split(':').map(Number);
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(hour);
        reminderDate.setMinutes(minute);
        reminderDate.setSeconds(0);

        schedule.scheduleJob(reminder.id.toString(), reminderDate, () => {
            bot.telegram.sendMessage(reminder.userId, `Напоминание: ${reminder.message}`);
            deleteReminder(reminder.id, { from: { id: reminder.userId }, reply: bot.telegram.sendMessage.bind(bot.telegram) });
        });
    });
};

export const addReminder = (date, time, message, ctx) => {
    if (!ctx || !ctx.message || !ctx.message.from) {
        ctx.reply('Ошибка: Неверный контекст. Пожалуйста, попробуйте снова.');
        return false;
    }

    const [hour, minute] = time.split(':').map(Number);
    const reminderDate = new Date(date);
    reminderDate.setHours(hour);
    reminderDate.setMinutes(minute);
    reminderDate.setSeconds(0);

    const now = new Date();
    if (reminderDate <= now) {
        ctx.reply('Ошибка: Указано время, которое уже прошло. Пожалуйста, введите время в будущем.');
        return false;
    }

    const reminders = loadReminders();
    const reminderId = reminders.length ? reminders[reminders.length - 1].id + 1 : 1;
    const reminder = { id: reminderId, date, time, message, userId: ctx.message.from.id };
    reminders.push(reminder);
    saveReminders(reminders);

    schedule.scheduleJob(reminderId.toString(), reminderDate, () => {
        ctx.telegram.sendMessage(reminder.userId, `Напоминание: ${message}`);
        deleteReminder(reminderId, ctx);
    });

    return true;
};

export const listReminders = (ctx) => {
    const reminders = loadReminders();
    return reminders.filter(reminder => reminder.userId === ctx.message.from.id).map(reminder => `ID: ${reminder.id}, Дата: ${reminder.date}, Время: ${reminder.time}, Сообщение: ${reminder.message}`);
};

export const getCalendarKeyboard = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const buttons = [];

    // Adjust firstDay to start from Monday
    const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
        buttons.push(Markup.button.callback(' ', 'ignore'));
    }

    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

    for (let day = 1; day <= daysInMonth; day++) {
        const isPastDay = isCurrentMonth && day < now.getDate();
        buttons.push(Markup.button.callback(day.toString(), isPastDay ? 'ignore' : `calendar_${year}_${month}_${day}`));
    }

    const rows = [];
    while (buttons.length) {
        rows.push(buttons.splice(0, 7));
    }

    rows.push([
        Markup.button.callback('<<', `calendar_prev_${year}_${month}`),
        Markup.button.callback('>>', `calendar_next_${year}_${month}`)
    ]);

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const header = `${monthNames[month]} ${year}`;

    return Markup.inlineKeyboard([
        [Markup.button.callback(header, `calendar_${year}_${month}`)],
        ...rows
    ]);
};

export const getMonthYearKeyboard = (year, selectedMonth = null) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthButtons = monthNames.map((month, index) => {
        if (year === currentYear && index < currentMonth) {
            return Markup.button.callback(' ', 'ignore');
        }
        return Markup.button.callback(month, `select_month_${year}_${index}`);
    });

    const monthRows = [];
    while (monthButtons.length) {
        monthRows.push(monthButtons.splice(0, 3));
    }

    const yearButtons = [];
    for (let i = currentYear; i <= currentYear + 2; i++) {
        yearButtons.push(Markup.button.callback(i.toString(), `select_year_${i}`));
    }

    return Markup.inlineKeyboard([
        ...monthRows,
        yearButtons
    ]);
};

export const handleCalendarSelection = (ctx) => {
    const [year, month, day] = ctx.match[0].split('_').slice(1).map(Number);
    const selectedDate = new Date(Date.UTC(year, month, day));

    const now = new Date();
    if (selectedDate < now.setHours(0, 0, 0, 0)) {
        ctx.answerCbQuery('Ошибка: Неверная дата. Пожалуйста, выберите другую дату.', { show_alert: true });
        return;
    }

    if (isNaN(selectedDate.getTime())) {
        ctx.answerCbQuery('Ошибка: Неверная дата. Пожалуйста, выберите другую дату.', { show_alert: true });
        return;
    }

    const dayOfWeek = weekdays[selectedDate.getUTCDay() === 0 ? 6 : selectedDate.getUTCDay() - 1];
    ctx.session.selectedDate = selectedDate.toISOString().split('T')[0];
    ctx.answerCbQuery(`Вы выбрали день: ${ctx.session.selectedDate} (${dayOfWeek})`, { show_alert: true });
    ctx.reply('Введите время в формате <b>ЧЧ:ММ</b> и сообщение для напоминания.', { parse_mode: 'HTML' });
};

export const handleReminderMessage = (ctx) => {
    if (!ctx.session || !ctx.session.selectedDate) {
        return ctx.reply('Ошибка: Пожалуйста, выберите дату сначала.');
    }

    const messageText = ctx.message.text.trim();
    const [time, ...messageParts] = messageText.split(' ');
    const message = messageParts.join(' ');

    if (!/^\d{2}:\d{2}$/.test(time)) {
        return ctx.reply('Ошибка: Неверный формат времени. Пожалуйста, введите время в формате ЧЧ:ММ.');
    }

    const [hour, minute] = time.split(':').map(Number);
    const selectedDate = new Date(ctx.session.selectedDate);
    const now = new Date();

    if (selectedDate.toDateString() === now.toDateString() && (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()))) {
        return ctx.reply('Ошибка: Неверное время. Пожалуйста, введите время, которое ещё не прошло.');
    }

    const reminders = loadReminders();
    const reminderId = reminders.length ? reminders[reminders.length - 1].id + 1 : 1;
    const reminder = { id: reminderId, date: ctx.session.selectedDate, time, message, userId: ctx.message.from.id };
    reminders.push(reminder);
    saveReminders(reminders);

    const reminderDate = new Date(`${ctx.session.selectedDate}T${time}:00`);
    schedule.scheduleJob(reminderId.toString(), reminderDate, () => {
        ctx.telegram.sendMessage(reminder.userId, `Напоминание: ${message}`);
        deleteReminder(reminderId, ctx);
    });

    ctx.reply(`Напоминание установлено на <b>${ctx.session.selectedDate}</b> в <b>${time}</b>: ${message}`, { parse_mode: 'HTML' });
    delete ctx.session.selectedDate;
};
