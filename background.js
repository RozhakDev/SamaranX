/**
 * Update the User-Agent modification rule.
 *
 * This function will update the User-Agent modification rule with the given
 * User-Agent string. The User-Agent string will be set for all HTTP requests
 * made by the browser.
 *
 * @param {string} userAgent - The User-Agent string to set.
 * @return {Promise<void>}
 */
async function updateUserAgentRule(userAgent) {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
        addRules: [{
            id: 1,
            priority: 1,
            action: {
                type: 'modifyHeaders',
                requestHeaders: [{
                    header: 'User-Agent',
                    operation: 'set',
                    value: userAgent
                }]
            },
            condition: {
                urlFilter: '*',
                resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest']
            }
        }]
    });
}

/**
 * Disable the User-Agent modification rule.
 *
 * This function will remove the User-Agent modification rule, effectively
 * disabling the User-Agent modification feature.
 *
 * @return {Promise<void>}
 */
async function disableUserAgentRule() {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1]
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setUserAgent') {
        if (message.userAgent) {
            updateUserAgentRule(message.userAgent);
        }
    } else if (message.action === 'disableUserAgent') {
        disableUserAgentRule();
    }
    return true;
});