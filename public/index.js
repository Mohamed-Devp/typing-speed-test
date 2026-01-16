const personalBestSpans = document.querySelectorAll('[data-personal-best]');

const WPMSpan = document.querySelector('[data-wpm] [data-value]');

const accuracyEl = document.querySelector('[data-accuracy]');
const accuracySpan = document.querySelector('[data-accuracy] [data-value]');

const timeSpan = document.querySelector('[data-time] [data-value]');

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
const passageTextarea = document.querySelector('textarea[name="passage"]');

const resultWPMSpans = document.querySelectorAll('[data-result-wpm] [data-value]');

const resultAccuracyEls = document.querySelectorAll('[data-result-accuracy]');
const resultAccuracySpans = document.querySelectorAll('[data-result-accuracy] [data-value]');

const correctCharsSpans = document.querySelectorAll('[data-characters] [data-correct]');
const incorrectCharsSpans = document.querySelectorAll('[data-characters] [data-incorrect]');

const restartBtns = document.querySelectorAll('[data-restart-btn');

const VISIBLE_LINES = 12;

let timerId;
let elapsed = 0;
let isRunning = false;

let difficulty = 'easy';
let duration = 60;

let lines;
let currentLine = 0;
let currentChar = 0;

let previous = '';
let correctChars = 0;
let incorrectChars = 0;

let wordsPerMinute = 0;
let accuracy = 100;

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
    if (lines.length - currentLine < VISIBLE_LINES) return;
    
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

function updateTimeView(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
  
    timeSpan.textContent = `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function clearTimer() {
    isRunning = false;
  
    document.body.classList.remove('is-running');
  
    clearInterval(timerId);
}

function startTimer() {
    isRunning = true;
  
    document.body.classList.add('has-started', 'is-running');
  
    timerId = setInterval(() => {
        elapsed += 1;
        
        updateStats();
        updateStatsView();
        
        if (elapsed === duration) {
            clearTimer();
            showResults();
        }
    }, 1000);
}

function updateState(lineIndex, charIndex, state) {
    const charSpan = document.querySelector(`[data-line="${lineIndex}"] [data-char="${charIndex}"]`);
  
    if (charSpan) {
        charSpan.classList.toggle(state);
    }
    
    return charSpan;
}

function processChar(char) {
    updateState(currentLine, currentChar, 'is-highlighted');
  
    const targetChar = lines[currentLine][currentChar];
  
    if (char === targetChar) {
        updateState(currentLine, currentChar, 'is-correct');
        correctChars += 1;
    }
    else {
        updateState(currentLine, currentChar, 'is-incorrect');
        incorrectChars += 1;
    }
  
    currentChar += 1;
    
    if (currentChar >= lines[currentLine].length) {
        currentChar = 0;
        currentLine += 1;
        
        if (currentLine >= lines.length) {
            clearTimer();
            showResults();
        }
        else {
            updatePassageView();
        }
    }
    
    updateState(currentLine, currentChar, 'is-highlighted');
}

function handleBackspace() {
    updateState(currentLine, currentChar, 'is-highlighted');
    
    currentChar -= 1;
    
    if (currentChar < 0) {
        currentLine -= 1;
        
        if (currentLine < 0) {
            currentChar = 0;
            currentLine = 0;
        }
        else {
            currentChar = lines[currentLine].length - 1;
            updatePassageView();
        }
    }
  
    const charSpan = updateState(currentLine, currentChar, 'is-highlighted');
    
    if (charSpan.classList.contains('is-correct')) {
        charSpan.classList.remove('is-correct');
        correctChars -= 1;
    }
    else {
        charSpan.classList.remove('is-incorrect');
        incorrectChars -= 1;
    }
}

function updateStats() {
    const words = correctChars / 5;
    const elapsedMinutes = elapsed / 60;

    const totalChars = correctChars + incorrectChars;

    wordsPerMinute = Math.floor(words / elapsedMinutes);
    accuracy = totalChars > 0 ? Math.floor(correctChars / totalChars * 100) : 0;
}

function updateStatsView() {
    WPMSpan.textContent = wordsPerMinute > 0 ? String(wordsPerMinute).padStart(3, '0') : 0;

    if (accuracy === 100) {
        accuracyEl.classList.add('is-perfect');
    }
    else {
        accuracyEl.classList.remove('is-perfect');
    }
    accuracySpan.textContent = `${accuracy > 0 ? String(accuracy).padStart(3, '0') : 0}%`;

    updateTimeView(duration > 0 ? duration - elapsed : elapsed);
}

function showResults() {
    const currentBest = parseInt(localStorage.getItem('personal-best'));

    document.body.classList.remove('has-started');

    if (Number.isNaN(currentBest)) {
        localStorage.setItem('personal-best', String(wordsPerMinute));
        document.body.classList.add('is-first-test');
    }
    else if (wordsPerMinute > currentBest) {
        localStorage.setItem('personal-best', String(wordsPerMinute));
        document.body.classList.add('is-new-best');
    }
    else {
        document.body.classList.add('is-complete');
    }

    updatePersonalBestView();

    resultWPMSpans.forEach(span => {
        span.textContent = wordsPerMinute;
    });

    resultAccuracyEls.forEach(element => {
        if (accuracy === 100) {
            element.classList.add('is-perfect');
        }
        else {
            element.classList.remove('is-perfect');
        }
    });

    resultAccuracySpans.forEach(span => {
        span.textContent = `${accuracy}%`;
    });

    correctCharsSpans.forEach(span => {
        span.textContent = correctChars;
    });

    incorrectCharsSpans.forEach(span => {
        span.textContent = incorrectChars;
    });
}

function updatePersonalBestView() {
    const currentBest = parseInt(localStorage.getItem('personal-best'));

    personalBestSpans.forEach(span => {
        span.textContent = `${Number.isNaN(currentBest) ? 0 : currentBest} WPM`;
    });
}

function startNewTest() {
    elapsed = 0;

    currentLine = 0;
    currentChar = 0;

    previous = '';
    correctChars = 0;
    incorrectChars = 0;

    wordsPerMinute = 0;
    accuracy = 100;

    document.body.classList.remove('has-started', 'is-complete', 'is-new-best', 'is-first-test');

    passageTextarea.value = '';

    updateStatsView();
    updatePersonalBestView();

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

passageTextarea.addEventListener('focus', () => {
    document.body.classList.add('is-focused');
    updateState(currentLine, currentChar, 'is-highlighted');
});

passageTextarea.addEventListener('blur', () => {
    clearTimer();
    
    document.body.classList.remove('is-focused');
    updateState(currentLine, currentChar, 'is-highlighted');
});

passageTextarea.addEventListener('past', e => {
    e.preventDefault();
});

passageTextarea.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
    }
});

passageTextarea.addEventListener('input', () => {
    if (!isRunning) {
        startTimer();
    }
    
    const current = passageTextarea.value;
    
    if (current.length < previous.length) {
        handleBackspace();
    }
    else {
        const difference = current.slice(previous.length);
        
        for (const char of difference) {
            processChar(char);
        };
    }
    
    previous = current;
});

passageContentEl.addEventListener('mousedown', (e) => {
    e.preventDefault();
});

passageContentEl.addEventListener('click', () => {
    passageTextarea.focus();
});

restartBtns.forEach(button => {
    button.addEventListener('click', startNewTest);
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