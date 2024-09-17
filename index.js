import {session} from 'telegraf';
import {bot} from './src/functions/botInstance.js';
import {scheduleNotifications, scheduleReminders} from './src/functions/scheduleSettings.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import './src/errorHandler.js';
import {checkAndNotify, initializeAlertStatus} from "./src/functions/airAlerts/checkAndNotify.js";
import {setupCalendarActions} from "./src/functions/actions/calendarActions.js";
import {setupScheduleHears} from "./src/functions/hears/scheduleHears.js";
import {setupScheduleActions} from "./src/functions/actions/scheduleActions.js";
import {setupMessageEvents} from "./src/functions/events/messageEvents.js";
import {setupStartCommand} from "./src/commands/start.js";
import {setupHelpCommand} from "./src/commands/help.js";
import {setupSendCommand} from "./src/commands/send.js";
import {setupSendToGroupCommand} from "./src/commands/sendToGroup.js";
import {setupSendBothCommand} from "./src/commands/sendBoth.js";
import {setupWeekdaysCommand} from "./src/commands/weekdays.js";
import {setupScheduleEditCommand} from "./src/commands/scheduleEdit.js";
import {setupScheduleDeleteCommand} from "./src/commands/scheduleDelete.js";
import {setupScheduleExportCommand} from "./src/commands/scheduleExport.js";
import {setupScheduleImportCommand} from "./src/commands/scheduleImport.js";
import {setupReminderCreateCommand} from "./src/commands/reminderCreate.js";
import {setupReminderListCommand} from "./src/commands/reminderList.js";
import {setupReminderCalendarCommand} from "./src/commands/reminderCalendar.js";
import {setupReminderDeleteCommand} from "./src/commands/reminderDelete.js";
import {setupScheduleWeekCommand} from "./src/commands/scheduleWeek.js";
import {setupScheduleTodayCommand} from "./src/commands/scheduleToday.js";
import {setupScheduleTomorrowCommand} from "./src/commands/scheduleTomorrow.js";
import {setupListUsersCommand} from "./src/commands/listUsers.js";
import {setupToggleRegistrationCommand} from "./src/commands/toggleRegistration.js";
import {saveConfig} from "./src/utils/saveConfig.js";
import {checkForScheduleChanges} from "./src/functions/checkScheduleChanges.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'src', 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

bot.use(session());
console.log('Session middleware loaded');

bot.use((ctx, next) => {
    if (!ctx.session) {
        ctx.session = {};
    }
    return next();
});
console.log('Session initialization middleware loaded');

bot.launch();
console.log('Bot launched');

scheduleNotifications(bot);
scheduleReminders(bot);

setupStartCommand(bot, config);
setupHelpCommand(bot);
setupSendCommand(bot);
setupSendToGroupCommand(bot, config);
setupSendBothCommand(bot, config);
setupWeekdaysCommand(bot);
setupScheduleEditCommand(bot);
setupScheduleDeleteCommand(bot);
setupScheduleExportCommand(bot);
setupScheduleImportCommand(bot);
setupReminderCreateCommand(bot);
setupReminderListCommand(bot);
setupReminderDeleteCommand(bot);
setupReminderCalendarCommand(bot);
setupScheduleWeekCommand(bot);
setupScheduleTodayCommand(bot);
setupScheduleTomorrowCommand(bot);
setupListUsersCommand(bot);
setupToggleRegistrationCommand(bot, config, configPath, saveConfig);

setupCalendarActions(bot);
setupScheduleHears(bot);
setupScheduleActions(bot);
setupMessageEvents(bot);

// Инициализация текущего статуса тревоги и запуск периодической проверки
initializeAlertStatus().then(() => {
    setInterval(checkAndNotify, 7500);
    console.log('Alert status initialized and periodic check started');
    console.log('All components and commands loaded');
    console.log('Bot is running...');
});

// Установка интервала для проверки изменений каждые 3 часа
setInterval(checkForScheduleChanges, 3 * 60 * 60 * 1000);
