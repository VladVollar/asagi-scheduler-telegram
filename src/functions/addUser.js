import fs from 'fs';

const filePath = './src/data/users.json';

export const addUser = (userId) => {
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!users.includes(userId)) {
        users.push(userId);
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    }
};