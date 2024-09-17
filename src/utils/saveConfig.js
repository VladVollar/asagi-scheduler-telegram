import fs from 'fs';

const saveConfig = (configPath, config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

export { saveConfig };
