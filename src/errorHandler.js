process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise);
    console.log('Reason:', reason);
});