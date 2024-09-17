import { handleScheduleSelection } from '../scheduleSettings.js';
import { groupIgnoreMiddleware } from '../middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../middleware/registrationMiddleware.js';
import {handleWeekdayToggle} from "../weekdaySettings.js";

const setupScheduleActions = (bot) => {
    bot.action(/toggle_(.+)/, groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        handleWeekdayToggle(ctx);
    });

    bot.action(/schedule_(.+)/, groupIgnoreMiddleware, registrationMiddleware, (ctx) => {
        handleScheduleSelection(ctx);
    });
};

export { setupScheduleActions };