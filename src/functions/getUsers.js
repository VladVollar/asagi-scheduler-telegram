import fs from 'fs';

const filePath = './src/data/users.json';

export const getUsers = () => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};