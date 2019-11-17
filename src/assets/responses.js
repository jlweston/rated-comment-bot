'use strict';

const Promise = require('bluebird');

// Selection of responses in Markdown format
const responses = [
    'Your rating has been assessed and deemed inaccurate.\n\nThe comment above yours was in fact not an underrated comment.',
    'Thank you for flagging an underrated comment.\n\nUnfortunately, on this occasion your concern was unnecessary and the comment was rated accurately.',
    'The comment above yours does not appear to be underrated.\n\nWe would like to thank you for your vigilance and encourage you to continue rating comments.',
    'We have carried out an in-depth analysis of the reported comment but have found it is suitably rated.\n\nThank you for your diligent service.',
    'We appreciate you taking the time to flag this as an underrated comment.\n\nHowever, this appears to be in error and the comment is already rated according to its quality.'
];

const getRandomResponse = Promise.method(() => {
    const index = Math.floor(Math.random() * responses.length); /* ?+ */
    return responses[index];
});

module.exports = {
    responses, getRandomResponse
};
