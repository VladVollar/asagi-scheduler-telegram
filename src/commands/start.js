import { addUser } from '../functions/addUser.js';

const setupStartCommand = (bot, config) => {
    bot.start((ctx) => {
        if (!config.registrationOpen) {
            ctx.reply('Ошибка: Регистрация закрыта.');
            return;
        }
        const userId = ctx.message.from.id;
        const userName = ctx.message.from.first_name;
        addUser(userId);
        ctx.reply(`Привет, ${userName}! Для получения списка доступных команд используйте /help.`, {
            reply_markup: {
                keyboard: [
                    [{ text: 'Расписание на сегодня' }, { text: 'Расписание на завтра' }, { text: 'Расписание на неделю' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            }
        });
    });
};

export { setupStartCommand };