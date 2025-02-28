import { isAdmin } from "../functions/middleware/isAdmin.js"
import {fileURLToPath} from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const massMentionConfigPath = path.join(__dirname, "..", "data", "massMentionConfig.json");

const loadMassMentionConfig = () => {
    try {
        const data = fs.readFileSync(massMentionConfigPath, "utf-8");
        const parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
            throw new Error("Некорректный формат massMentionConfig.json");
        }
        return parsedData;
    } catch (error) {
        console.error("Ошибка загрузки massMentionConfig:", error);
        return [];
    }
};

const setupMassMentionCommand = (bot, config) => {
    bot.command(["all"], async (ctx) => {
        if (ctx.chat.id !== config.studyGroupId) {
            return;
        }

        if (!isAdmin(ctx)) {
            try {
                await ctx.deleteMessage(ctx.message.message_id);
            } catch (error) {
                console.error(error);
            }
            return;
        }

        const mentionIds = loadMassMentionConfig();
        if (mentionIds.length === 0) {
            return;
        }

        const mentionText = mentionIds.map((id) => `[@${id}](tg://user?id=${id})`).join(" ");
        ctx.reply(mentionText, { parse_mode: "Markdown" });
    });
};

export { setupMassMentionCommand };
