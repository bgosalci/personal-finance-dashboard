// Dialog Manager for alerts and prompts
const DialogManager = (function() {
    const modal = document.getElementById('dialog-modal');
    const messageEl = document.getElementById('dialog-message');
    const inputGroup = document.getElementById('dialog-input-group');
    const inputEl = document.getElementById('dialog-input');
    const okBtn = document.getElementById('dialog-ok');
    const cancelBtn = document.getElementById('dialog-cancel');
    const closeBtn = document.getElementById('dialog-close');

    function open(type, message, def, actionLabel) {
        messageEl.textContent = message || '';
        if (type === 'prompt') {
            inputGroup.style.display = 'block';
            inputEl.value = def || '';
            inputEl.focus();
        } else {
            inputGroup.style.display = 'none';
        }
        cancelBtn.style.display = type === 'alert' ? 'none' : 'inline-flex';
        cancelBtn.textContent = 'No';

        if (type === 'alert') {
            okBtn.textContent = 'Close';
        } else {
            okBtn.textContent = actionLabel ? `Yes, ${actionLabel}` : 'Yes';
        }
        modal.style.display = 'flex';

        return new Promise(resolve => {
            function cleanup(result) {
                modal.style.display = 'none';
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                modal.removeEventListener('click', onBackdrop);
                resolve(result);
            }
            function onOk() {
                cleanup(type === 'prompt' ? inputEl.value : true);
            }
            function onCancel() {
                cleanup(type === 'prompt' ? null : false);
            }
            function onBackdrop(e) {
                if (e.target === modal) onCancel();
            }
            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            modal.addEventListener('click', onBackdrop);
        });
    }

    return {
        alert: msg => open('alert', msg),
        confirm: (msg, action) => open('confirm', msg, null, action),
        prompt: (msg, def, action) => open('prompt', msg, def, action)
    };
})();
