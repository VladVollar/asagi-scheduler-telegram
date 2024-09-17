import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupToggleRegistrationCommand = (bot, config, configPath, saveConfig) => {
    bot.command('toggle_registration', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, (ctx) => {
        config.registrationOpen = !config.registrationOpen;
        saveConfig(configPath, config);
        ctx.reply(`Регистрация ${config.registrationOpen ? 'открыта' : 'закрыта'}.`);
    });
};

export { setupToggleRegistrationCommand };