const escapeMarkdownV2 = (text) => {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
};

export default escapeMarkdownV2;