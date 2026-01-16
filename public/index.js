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

const passageContentEl = document.querySelector('[data-passage-content]');
const passageMeasurer = document.querySelector('[data-passage-measurer]');

const VISIBLE_LINES = 12;

let difficulty = 'easy';
let duration = 60;

let lines;
let currentLine = 0;
let currentChar = 0;

/* ===== Split the given text into lines based on how it's rendered in a container ===== */
function measureLines(text, measurer) {
    measurer.innerHTML = '';
    
    const words = text.split(' ');
    
    const spans = words.map((word, index) => {
        const span = document.createElement('span');
        
        if (index === words.length - 1) {
            span.textContent = word;
        }
        else {
            span.textContent = word + ' ';
        }
        
        measurer.appendChild(span);
        return span;
    });
  
    const lines = [];
    let currentLine = '';
    let currentTop = spans[0].offsetTop;
    
    for (const span of spans) {
        if (span.offsetTop !== currentTop) {
            lines.push(currentLine);
            currentLine = '';
            currentTop = span.offsetTop;
        }
        
        currentLine += span.textContent;
    }
    
    if (currentLine.length) {
        lines.push(currentLine);
    }
    
    return lines;
}

function createPassageView() {    
    let passageContentHTML = '';
    
    for (let i = 0; i < lines.length; i++) {
        let lineContentHTML = '';
        
        for (let j = 0; j < lines[i].length; j++) {
            lineContentHTML += `<span data-char="${j}">${lines[i][j]}</span>`;
        }
        
        passageContentHTML += `<span data-line="${i}">${lineContentHTML}</span>`;
    }
    
    passageContentEl.innerHTML = passageContentHTML;
}

/* ===== Show the current visible lines of the selected passage content ===== */
function updatePassageView() {
    if (lines.length - currentLine <= VISIBLE_LINES) return;
    
    const endLine = currentLine + VISIBLE_LINES;
    
    for (let i = 0; i < lines.length; i++) {
        const lineSpan = document.querySelector(`[data-line="${i}"]`);
        
        if (i >= currentLine && i < endLine) {
            lineSpan.classList.remove('visually-hidden'); 
        }
        else {
            lineSpan.classList.add('visually-hidden');
        }
    }
}

async function updatePassage() {
    document.body.classList.add('is-loading');

    const response = await fetch('./public/data.json');
    if (!response.ok) {
        throw new Error(`Cannot fetch the data ${response.status}`);
    }

    const data = await response.json();

    document.body.classList.remove('is-loading');

    const passages = data[difficulty];
    const index = Math.floor(Math.random() * passages.length);

    lines = measureLines(passages[index].text, passageMeasurer);
    createPassageView();
    updatePassageView();
}

function startNewTest() {
    currentLine = 0;
    currentChar = 0;

    updatePassage().catch(error => {
        console.error(error.message);
    });
}

difficultyDesktopRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === difficulty) return;

        difficulty = radio.value;

        difficultyMobileRadios.forEach(mobileRadio => {
            if (mobileRadio.value === radio.value) {
                mobileRadio.click();
            }
        });

        startNewTest(); 
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

        startNewTest();
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

        startNewTest();
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

        startNewTest();
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

startNewTest();