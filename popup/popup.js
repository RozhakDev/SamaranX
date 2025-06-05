document.addEventListener('DOMContentLoaded', () => {
    const masterToggle = document.getElementById('masterToggle');
    const customInput = document.getElementById('customInput');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');

    chrome.storage.local.get(['isEnabled', 'customUserAgent'], (result) => {
        if (result.isEnabled) {
            masterToggle.checked = true;
            statusEl.textContent = 'Aktif';
        }
        if (result.customUserAgent) {
            customInput.value = result.customUserAgent;
        }
    });

    saveBtn.addEventListener('click', () => {
        const userAgent = customInput.value.trim();
        if (userAgent) {
            chrome.storage.local.set({ isEnabled: true, customUserAgent: userAgent }, () => {
                masterToggle.checked = true;
                statusEl.textContent = 'Aktif';
                sendMessageToBackground(true, userAgent);
                showNotification('User-Agent disimpan dan diaktifkan!');
            });
        } else {
            showNotification('Input tidak boleh kosong.');
        }
    });

    masterToggle.addEventListener('change', () => {
        const isEnabled = masterToggle.checked;
        chrome.storage.local.get(['customUserAgent'], (result) => {
            if (isEnabled && !result.customUserAgent) {
                showNotification('Silakan simpan User-Agent terlebih dahulu.');
                masterToggle.checked = false;
                return;
            }

            chrome.storage.local.set({ isEnabled: isEnabled }, () => {
                statusEl.textContent = isEnabled ? 'Aktif' : 'Nonaktif';
                sendMessageToBackground(isEnabled, result.customUserAgent);
                showNotification(isEnabled ? 'Ekstensi diaktifkan.' : 'Ekstensi dinonaktifkan.');
            });
        });
    });
});

/**
 * Send a message to the background script to set or disable the User-Agent rule.
 *
 * @param {boolean} enabled - Whether the User-Agent modification is enabled or not.
 * @param {string} [userAgent] - The User-Agent string to set, if enabled is true.
 */
function sendMessageToBackground(enabled, userAgent) {
    if (enabled && userAgent) {
        chrome.runtime.sendMessage({ action: 'setUserAgent', userAgent: userAgent });
    } else {
        chrome.runtime.sendMessage({ action: 'disableUserAgent' });
    }
}

/**
 * Show a notification with the given message.
 *
 * The notification will appear at the top of the popup with a slide-in animation,
 * stay for 3 seconds, and then disappear with a slide-out animation.
 *
 * @param {string} message - The message to show in the notification.
 */
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.top = '20px';

    setTimeout(() => {
        notification.style.top = '-100px';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500);
    }, 3000);
}