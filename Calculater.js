const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const operationDisplay = document.getElementById('operation-display');
let currentInput = '';
let operator = '';
let firstOperand = null;
let waitingForSecondOperand = false;
const backspaceBtn = document.getElementById('backspace');

// Utility: Format number with thousand separators and max 12 digits
function formatDisplay(value) {
    if (value === 'Error') return value;
    let str = value.toString();
    // Handle decimals and large numbers
    if (!isNaN(str) && str !== '') {
        let [int, dec] = str.split('.');
        int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        str = dec ? `${int}.${dec}` : int;
    }
    // Limit display length
    if (str.length > 12) {
        str = str.slice(0, 12) + '…';
    }
    return str;
}

function updateDisplay(value) {
    display.textContent = formatDisplay(value);
    display.setAttribute('aria-label', value);
}

function updateOperationDisplay(text) {
    operationDisplay.textContent = text || '';
}

function resetCalculator() {
    currentInput = '';
    operator = '';
    firstOperand = null;
    waitingForSecondOperand = false;
    lastSecondOperand = null;
    lastOperator = null;
    updateDisplay('0');
    clearOperatorHighlight();
    updateOperationDisplay('');
}

function clearOperatorHighlight() {
    document.querySelectorAll('.operator').forEach(btn => btn.classList.remove('op-active'));
}

function handleInput(value) {
    if (display.textContent.replace(/,/g, '') === 'Error') {
        resetCalculator();
    }
    if (waitingForSecondOperand) {
        currentInput = value === '.' ? '0.' : value;
        waitingForSecondOperand = false;
    } else {
        if (value === '.' && currentInput.includes('.')) return;
        currentInput = currentInput === '0' && value !== '.' ? value : currentInput + value;
    }
    updateDisplay(currentInput);
    clearOperatorHighlight();
    // Show full command/expression
    let expr = '';
    if (firstOperand !== null && operator) {
        expr = `${formatDisplay(firstOperand)} ${operator} ${currentInput}`;
    } else if (currentInput) {
        expr = currentInput;
    }
    updateOperationDisplay(expr);
}

function handleOperator(value) {
    if (currentInput !== '') {
        if (firstOperand === null) {
            firstOperand = parseFloat(currentInput);
        } else if (operator) {
            const secondOperand = parseFloat(currentInput);
            if (operator === '+') firstOperand += secondOperand;
            else if (operator === '-') firstOperand -= secondOperand;
            else if (operator === '*') firstOperand *= secondOperand;
            else if (operator === '/') firstOperand = secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
        }
        operator = value;
        waitingForSecondOperand = true;
        currentInput = '';
        updateDisplay(firstOperand);
        clearOperatorHighlight();
        highlightOperator(value);
        // Show full command/expression
        let expr = '';
        if (firstOperand !== null && operator) {
            expr = `${formatDisplay(firstOperand)} ${operator}`;
        }
        updateOperationDisplay(expr);
    } else if (firstOperand !== null) {
        operator = value;
        clearOperatorHighlight();
        highlightOperator(value);
        // Show full command/expression
        let expr = '';
        if (firstOperand !== null && operator) {
            expr = `${formatDisplay(firstOperand)} ${operator}`;
        }
        updateOperationDisplay(expr);
    }
}

function highlightOperator(op) {
    document.querySelectorAll('.operator').forEach(btn => {
        if (btn.getAttribute('data-value') === op) {
            btn.classList.add('op-active');
        }
    });
}

let lastSecondOperand = null;
let lastOperator = null;

function handleEquals() {
    if (operator && firstOperand !== null && currentInput !== '') {
        const secondOperand = parseFloat(currentInput);
        let result = 0;
        if (operator === '+') result = firstOperand + secondOperand;
        else if (operator === '-') result = firstOperand - secondOperand;
        else if (operator === '*') result = firstOperand * secondOperand;
        else if (operator === '/') result = secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
        updateDisplay(result);
        currentInput = result.toString();
        lastSecondOperand = secondOperand;
        lastOperator = operator;
        operator = '';
        firstOperand = null;
        waitingForSecondOperand = false;
        clearOperatorHighlight();
        // Show full command/expression
        updateOperationDisplay('');
    } else if (!operator && lastOperator && currentInput !== '' && lastSecondOperand !== null) {
        // Repeat last operation
        let result = 0;
        const first = parseFloat(currentInput);
        if (lastOperator === '+') result = first + lastSecondOperand;
        else if (lastOperator === '-') result = first - lastSecondOperand;
        else if (lastOperator === '*') result = first * lastSecondOperand;
        else if (lastOperator === '/') result = lastSecondOperand !== 0 ? first / lastSecondOperand : 'Error';
        updateDisplay(result);
        currentInput = result.toString();
        firstOperand = null;
        waitingForSecondOperand = false;
        clearOperatorHighlight();
        // Show full command/expression
        updateOperationDisplay('');
    }
}

function handleBackspace() {
    if (display.textContent.replace(/,/g, '') === 'Error') {
        resetCalculator();
        return;
    }
    if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        updateDisplay(currentInput || '0');
    }
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 100);
        const value = button.getAttribute('data-value');
        if (button.id === 'clear') {
            resetCalculator();
        } else if (button.id === 'equals') {
            handleEquals();
        } else if (button.id === 'backspace') {
            handleBackspace();
        } else if (button.classList.contains('operator')) {
            handleOperator(value);
        } else {
            handleInput(value);
        }
        button.blur(); // Remove focus after click
    });
    // Keyboard accessibility
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            button.click();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        handleInput(e.key);
    } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
    } else if (e.key === 'Backspace') {
        handleBackspace();
    } else if (e.key.toLowerCase() === 'c') {
        resetCalculator();
    }
}); 