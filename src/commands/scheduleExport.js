import { exportSchedule } from '../functions/scheduleSettings.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupScheduleExportCommand = (bot) => {
    bot.command('schedule_export', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, (ctx) => {
        const scheduleJson = exportSchedule();
        const dataDir = path.join(__dirname, '../../data');
        const filePath = path.join(dataDir, 'schedule.json');

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        fs.writeFileSync(filePath, scheduleJson);
        ctx.replyWithDocument({ source: filePath }).then(() => {
            fs.unlinkSync(filePath);
        });
    });
};

export { setupScheduleExportCommand };