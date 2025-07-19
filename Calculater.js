const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
let currentInput = '';
let operator = '';
let firstOperand = null;
let waitingForSecondOperand = false;

function updateDisplay(value) {
    display.textContent = value;
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');
        if (button.id === 'clear') {
            currentInput = '';
            operator = '';
            firstOperand = null;
            waitingForSecondOperand = false;
            updateDisplay('0');
        } else if (button.id === 'equals') {
            if (operator && firstOperand !== null && currentInput !== '') {
                const secondOperand = parseFloat(currentInput);
                let result = 0;
                if (operator === '+') result = firstOperand + secondOperand;
                else if (operator === '-') result = firstOperand - secondOperand;
                else if (operator === '*') result = firstOperand * secondOperand;
                else if (operator === '/') result = secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
                updateDisplay(result);
                currentInput = result.toString();
                operator = '';
                firstOperand = null;
                waitingForSecondOperand = false;
            }
        } else if (button.classList.contains('operator')) {
            if (currentInput !== '') {
                if (firstOperand === null) {
                    firstOperand = parseFloat(currentInput);
                } else if (operator) {
                    // Chain calculations
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
            } else if (firstOperand !== null) {
                operator = value;
            }
        } else {
            if (waitingForSecondOperand) {
                currentInput = value === '.' ? '0.' : value;
                waitingForSecondOperand = false;
            } else {
                if (value === '.' && currentInput.includes('.')) return;
                currentInput = currentInput === '0' && value !== '.' ? value : currentInput + value;
            }
            updateDisplay(currentInput);
        }
    });
}); 