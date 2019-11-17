module.exports = function() {
    return {
        files: [
            'src/**/*.js'
        ],
        tests: [
            'test/**/*.js'
        ],
        env: {
            type: 'node'
        },
        workers: {
            initial: 1,
            regular: 1
        }
    };
};
