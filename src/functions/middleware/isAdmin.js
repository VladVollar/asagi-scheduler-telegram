import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const isAdmin = (ctx) => {
    const userId = ctx.message.from.id;
    return config.adminIds.includes(userId);
};

export { isAdmin };