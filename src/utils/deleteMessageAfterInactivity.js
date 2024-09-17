const deleteMessageAfterInactivity = (bot, ctx, messageId, delay = 300000) => {
    let timeoutId;

    const resetTimeout = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            ctx.deleteMessage(messageId);
        }, delay);
    };

    bot.on('callback_query', (callbackCtx) => {
        if (callbackCtx.callbackQuery.message.message_id === messageId) {
            resetTimeout();
        }
    });

    resetTimeout();
};

export { deleteMessageAfterInactivity };
