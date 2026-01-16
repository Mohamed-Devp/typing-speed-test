const difficultyDesktopRadios = document.querySelectorAll('input[name="difficulty-desktop"]');
const difficultyMobileRadios = document.querySelectorAll('input[name="difficulty-mobile"]');

const modeDesktopRadios = document.querySelectorAll('input[name="mode-desktop"]');
const modeMobileRadios = document.querySelectorAll('input[name="mode-mobile"]');

const difficultyDropdown = document.querySelector('[data-difficulty-dropdown]');
const difficultyToggleBtn = document.querySelector('[data-difficulty-dropdown] [data-toggle-btn]');
const difficultyValueEl = document.querySelector('[data-difficulty-dropdown] [data-value]');

const modeDropdown = document.querySelector('[data-mode-dropdown]');
const modeToggleBtn = document.querySelector('[data-mode-dropdown] [data-toggle-btn]');
const modeValueEl = document.querySelector('[data-mode-dropdown] [data-value]');

let difficulty = 'easy';
let duration = 60;

difficultyDesktopRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === difficulty) return;

        difficulty = radio.value;

        difficultyMobileRadios.forEach(mobileRadio => {
            if (mobileRadio.value === radio.value) {
                mobileRadio.click();
            }
        });
    });
});

difficultyMobileRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        difficultyValueEl.textContent = radio.value;

        if (radio.value === difficulty) return;

        difficulty = radio.value;

        // Close the dropdown menu once an option is selected
        difficultyDropdown.classList.remove('is-open');
        difficultyToggleBtn.setAttribute('aria-expanded', 'false');

        difficultyDesktopRadios.forEach(desktopRadio => {
            if (desktopRadio.value === radio.value) {
                desktopRadio.click();
            }
        });
    });
});

modeDesktopRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (Number(radio.value) === duration) return;

        duration = Number(radio.value);

        modeMobileRadios.forEach(mobileRadio => {
            if (mobileRadio.value === radio.value) {
                mobileRadio.click();
            }
        });
    })
});

modeMobileRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        modeValueEl.textContent = Number(radio.value) > 0 ? `Timed (${radio.value}s)` : 'Passage';

        if (Number(radio.value) === duration) return;

        duration = Number(radio.value);

        // Close the dropdown menu once an option is selected
        modeDropdown.classList.remove('is-open');
        modeToggleBtn.setAttribute('aria-expanded', 'false');

        modeDesktopRadios.forEach(desktopRadio => {
            if (desktopRadio.value === radio.value) {
                desktopRadio.click();
            }
        });
    });
});

difficultyToggleBtn.addEventListener('click', () => {
    const isOpen = difficultyDropdown.classList.contains('is-open');

    difficultyDropdown.classList.toggle('is-open');
    difficultyToggleBtn.setAttribute('aria-expanded', !isOpen);
});

modeToggleBtn.addEventListener('click', () => {
    const isOpen = modeDropdown.classList.contains('is-open');

    modeDropdown.classList.toggle('is-open');
    modeToggleBtn.setAttribute('aria-expanded', !isOpen);
});

document.addEventListener('click', event => {
    if (!difficultyDropdown.contains(event.target)) {
        difficultyDropdown.classList.remove('is-open');
        difficultyToggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (!modeDropdown.contains(event.target)) {
        modeDropdown.classList.remove('is-open');
        modeToggleBtn.setAttribute('aria-expanded', 'false');
    }
});