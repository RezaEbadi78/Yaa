# 📈 Trading Strategy Backtester

A full-stack web application for backtesting trading strategies using Moving Average (MA), Relative Strength Index (RSI), and MACD indicators.

## 🚀 Features

- **File Upload**: Upload CSV files with historical price data
- **Strategy Parameters**: Customizable MA, RSI, and MACD parameters
- **Real-time Backtesting**: Test strategies on historical data
- **Performance Metrics**: View total trades, win rate, profit factor, and portfolio value
- **Modern UI**: Beautiful, responsive design with drag-and-drop functionality
- **Error Handling**: Comprehensive validation and error messages

## 📋 Requirements

- Python 3.7+
- Flask
- pandas
- numpy

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 📊 CSV File Format

Your CSV file must contain the following columns:
- `Date`: Date in YYYY-MM-DD format
- `Open`: Opening price
- `High`: Highest price of the day
- `Low`: Lowest price of the day
- `Close`: Closing price
- `Volume`: Trading volume

Example:
```csv
Date,Open,High,Low,Close,Volume
2023-01-01,100.00,102.50,99.50,101.20,1000000
2023-01-02,101.20,103.80,100.80,102.90,1200000
```

## ⚙️ Strategy Parameters

### Moving Average (MA)
- **MA Period**: Number of periods for calculating the moving average (default: 50)

### Relative Strength Index (RSI)
- **RSI Period**: Number of periods for RSI calculation (default: 14)
- **RSI Overbought Level**: Level above which the asset is considered overbought (default: 70)
- **RSI Oversold Level**: Level below which the asset is considered oversold (default: 30)

### MACD (Moving Average Convergence Divergence)
- **MACD Fast Period**: Fast EMA period (default: 12)
- **MACD Slow Period**: Slow EMA period (default: 26)
- **MACD Signal Period**: Signal line period (default: 9)

## 📈 Trading Strategy

### Buy Signal
- Close price > Moving Average AND
- RSI crosses above the oversold level

### Sell Signal
- RSI crosses below the overbought level OR
- MACD line crosses below the signal line

## 📊 Performance Metrics

The application calculates and displays:

1. **Total Trades**: Number of completed trades
2. **Win Rate**: Percentage of profitable trades
3. **Profit Factor**: Ratio of gross profit to gross loss
4. **Final Portfolio Value**: Ending portfolio value
5. **Total Return**: Percentage return on initial capital

## 🎯 Usage

1. **Upload Data**: Click "Choose CSV file" or drag and drop your CSV file
2. **Set Parameters**: Adjust the strategy parameters as needed
3. **Run Backtest**: Click "Run Backtest" to start the analysis
4. **View Results**: Review the performance metrics displayed

## 🏗️ Project Structure

```
trading-backtester/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── sample_data.csv       # Sample data for testing
├── templates/
│   └── index.html        # Main HTML page
└── static/
    └── script.js         # Frontend JavaScript
```

## 🔧 Technical Details

### Backend (Flask)
- **Framework**: Flask web framework
- **Data Processing**: pandas for CSV handling and calculations
- **Indicators**: Custom implementations of MA, RSI, and MACD
- **API Endpoint**: `/backtest` for processing backtesting requests

### Frontend (HTML/JavaScript)
- **UI**: Modern, responsive design with CSS Grid and Flexbox
- **Interactivity**: Vanilla JavaScript with async/await
- **File Handling**: Drag-and-drop file upload
- **Validation**: Client-side form validation
- **Feedback**: Loading states and error handling

## 🧪 Testing

Use the included `sample_data.csv` file to test the application:

1. Start the application
2. Upload `sample_data.csv`
3. Use default parameters or adjust as needed
4. Click "Run Backtest"
5. Review the results

## 🚨 Error Handling

The application includes comprehensive error handling for:
- Invalid CSV file format
- Missing required columns
- Invalid parameter values
- Network errors
- Server errors

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Modern Styling**: Gradient backgrounds and smooth animations
- **Interactive Elements**: Hover effects and visual feedback
- **Loading States**: Spinner animation during processing
- **Color-coded Results**: Green for positive, red for negative results

## 🔒 Security

- File type validation for CSV uploads
- Input sanitization and validation
- Error message sanitization
- No sensitive data storage

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## 📞 Support

If you encounter any issues or have questions, please check the error messages displayed in the application or review the console logs for debugging information.