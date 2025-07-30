document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const csvFileInput = document.getElementById('csvFile');
    const fileUploadLabel = document.querySelector('.file-upload-label');
    const runBacktestBtn = document.getElementById('runBacktest');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    // Result elements
    const totalTradesEl = document.getElementById('totalTrades');
    const winRateEl = document.getElementById('winRate');
    const profitFactorEl = document.getElementById('profitFactor');
    const finalValueEl = document.getElementById('finalValue');
    const totalReturnEl = document.getElementById('totalReturn');

    // File upload handling
    csvFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileUploadLabel.textContent = `📄 Selected: ${file.name}`;
            fileUploadLabel.style.background = '#d4edda';
            fileUploadLabel.style.borderColor = '#28a745';
        }
    });

    // Drag and drop functionality
    const fileUpload = document.querySelector('.file-upload');
    
    fileUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUploadLabel.style.background = '#e9ecef';
        fileUploadLabel.style.borderColor = '#3498db';
    });

    fileUpload.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUploadLabel.style.background = '#f8f9fa';
        fileUploadLabel.style.borderColor = '#dee2e6';
    });

    fileUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            csvFileInput.files = files;
            fileUploadLabel.textContent = `📄 Selected: ${files[0].name}`;
            fileUploadLabel.style.background = '#d4edda';
            fileUploadLabel.style.borderColor = '#28a745';
        }
    });

    // Form validation
    function validateForm() {
        const file = csvFileInput.files[0];
        if (!file) {
            showError('Please select a CSV file');
            return false;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            showError('Please select a valid CSV file');
            return false;
        }

        // Validate all number inputs
        const numberInputs = document.querySelectorAll('input[type="number"]');
        for (let input of numberInputs) {
            if (!input.value || input.value <= 0) {
                showError(`Please enter a valid value for ${input.previousElementSibling.textContent}`);
                return false;
            }
        }

        // Validate RSI levels
        const rsiOverbought = parseFloat(document.getElementById('rsiOverbought').value);
        const rsiOversold = parseFloat(document.getElementById('rsiOversold').value);
        
        if (rsiOverbought <= rsiOversold) {
            showError('RSI Overbought level must be greater than RSI Oversold level');
            return false;
        }

        // Validate MACD periods
        const macdFast = parseInt(document.getElementById('macdFast').value);
        const macdSlow = parseInt(document.getElementById('macdSlow').value);
        
        if (macdFast >= macdSlow) {
            showError('MACD Fast period must be less than MACD Slow period');
            return false;
        }

        return true;
    }

    // Error handling
    function showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        const btnContainer = document.querySelector('.btn-container');
        btnContainer.parentNode.insertBefore(errorDiv, btnContainer.nextSibling);

        // Auto-remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    function showSuccess(message) {
        // Remove existing success messages
        const existingSuccess = document.querySelector('.success');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        const btnContainer = document.querySelector('.btn-container');
        btnContainer.parentNode.insertBefore(successDiv, btnContainer.nextSibling);

        // Auto-remove success after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

    // Backtest button click handler
    runBacktestBtn.addEventListener('click', async function() {
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading state
        runBacktestBtn.disabled = true;
        runBacktestBtn.textContent = '⏳ Processing...';
        loadingDiv.style.display = 'block';
        resultsDiv.classList.remove('show');

        // Remove any existing error/success messages
        const existingMessages = document.querySelectorAll('.error, .success');
        existingMessages.forEach(msg => msg.remove());

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', csvFileInput.files[0]);
            
            // Add strategy parameters
            formData.append('ma_period', document.getElementById('maPeriod').value);
            formData.append('rsi_period', document.getElementById('rsiPeriod').value);
            formData.append('rsi_overbought', document.getElementById('rsiOverbought').value);
            formData.append('rsi_oversold', document.getElementById('rsiOversold').value);
            formData.append('macd_fast', document.getElementById('macdFast').value);
            formData.append('macd_slow', document.getElementById('macdSlow').value);
            formData.append('macd_signal', document.getElementById('macdSignal').value);

            // Send request to backend
            const response = await fetch('/backtest', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred during backtesting');
            }

            // Display results
            displayResults(data);
            showSuccess('Backtest completed successfully!');

        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while running the backtest');
        } finally {
            // Reset button state
            runBacktestBtn.disabled = false;
            runBacktestBtn.textContent = '🚀 Run Backtest';
            loadingDiv.style.display = 'none';
        }
    });

    // Display results function
    function displayResults(data) {
        totalTradesEl.textContent = data.total_trades;
        winRateEl.textContent = `${data.win_rate}%`;
        profitFactorEl.textContent = data.profit_factor === Infinity ? '∞' : data.profit_factor;
        finalValueEl.textContent = `$${data.final_portfolio_value.toLocaleString()}`;
        totalReturnEl.textContent = `${data.total_return}%`;

        // Color code the results
        const resultValues = [
            { element: totalReturnEl, value: data.total_return },
            { element: winRateEl, value: data.win_rate },
            { element: profitFactorEl, value: data.profit_factor }
        ];

        resultValues.forEach(item => {
            if (item.value > 0) {
                item.element.style.color = '#27ae60'; // Green for positive
            } else if (item.value < 0) {
                item.element.style.color = '#e74c3c'; // Red for negative
            } else {
                item.element.style.color = '#2c3e50'; // Default color
            }
        });

        // Show results
        resultsDiv.classList.add('show');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Add some interactive feedback
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '#3498db';
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to run backtest
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runBacktestBtn.click();
        }
    });
});