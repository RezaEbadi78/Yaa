from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import io
import base64

app = Flask(__name__)

def calculate_ma(data, period):
    """Calculate Moving Average"""
    return data.rolling(window=period).mean()

def calculate_rsi(data, period):
    """Calculate RSI (Relative Strength Index)"""
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(data, fast_period, slow_period, signal_period):
    """Calculate MACD (Moving Average Convergence Divergence)"""
    ema_fast = data.ewm(span=fast_period).mean()
    ema_slow = data.ewm(span=slow_period).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

def backtest_strategy(df, ma_period, rsi_period, rsi_overbought, rsi_oversold, 
                     macd_fast, macd_slow, macd_signal):
    """Run backtesting strategy"""
    
    # Calculate indicators
    df['MA'] = calculate_ma(df['Close'], ma_period)
    df['RSI'] = calculate_rsi(df['Close'], rsi_period)
    df['MACD'], df['MACD_Signal'], df['MACD_Histogram'] = calculate_macd(
        df['Close'], macd_fast, macd_slow, macd_signal
    )
    
    # Initialize variables
    initial_capital = 10000
    capital = initial_capital
    position = 0  # 0: no position, 1: long position
    trades = []
    current_trade = None
    
    # Iterate through data
    for i in range(1, len(df)):
        current_price = df['Close'].iloc[i]
        prev_price = df['Close'].iloc[i-1]
        
        # Buy signal: Close > MA AND RSI crosses above oversold level
        buy_signal = (
            current_price > df['MA'].iloc[i] and
            df['RSI'].iloc[i-1] <= rsi_oversold and
            df['RSI'].iloc[i] > rsi_oversold and
            position == 0
        )
        
        # Sell signal: RSI crosses below overbought level OR MACD line crosses below signal line
        sell_signal = (
            position == 1 and (
                (df['RSI'].iloc[i-1] >= rsi_overbought and df['RSI'].iloc[i] < rsi_overbought) or
                (df['MACD'].iloc[i-1] >= df['MACD_Signal'].iloc[i-1] and 
                 df['MACD'].iloc[i] < df['MACD_Signal'].iloc[i])
            )
        )
        
        # Execute buy signal
        if buy_signal:
            shares = capital / current_price
            position = 1
            current_trade = {
                'entry_price': current_price,
                'entry_date': df.index[i],
                'shares': shares
            }
        
        # Execute sell signal
        elif sell_signal and current_trade:
            exit_price = current_price
            shares = current_trade['shares']
            profit = (exit_price - current_trade['entry_price']) * shares
            capital += profit
            
            trades.append({
                'entry_date': current_trade['entry_date'],
                'exit_date': df.index[i],
                'entry_price': current_trade['entry_price'],
                'exit_price': exit_price,
                'profit': profit,
                'shares': shares
            })
            
            position = 0
            current_trade = None
    
    # Close any remaining position at the end
    if current_trade:
        exit_price = df['Close'].iloc[-1]
        shares = current_trade['shares']
        profit = (exit_price - current_trade['entry_price']) * shares
        capital += profit
        
        trades.append({
            'entry_date': current_trade['entry_date'],
            'exit_date': df.index[-1],
            'entry_price': current_trade['entry_price'],
            'exit_price': exit_price,
            'profit': profit,
            'shares': shares
        })
    
    # Calculate performance metrics
    total_trades = len(trades)
    winning_trades = len([t for t in trades if t['profit'] > 0])
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    gross_profit = sum([t['profit'] for t in trades if t['profit'] > 0])
    gross_loss = abs(sum([t['profit'] for t in trades if t['profit'] < 0]))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    return {
        'total_trades': total_trades,
        'win_rate': round(win_rate, 2),
        'profit_factor': round(profit_factor, 2),
        'final_portfolio_value': round(capital, 2),
        'initial_capital': initial_capital,
        'total_return': round(((capital - initial_capital) / initial_capital) * 100, 2)
    }

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/backtest', methods=['POST'])
def backtest():
    """Handle backtesting requests"""
    try:
        # Get uploaded file
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read CSV data
        csv_content = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_content))
        
        # Validate required columns
        required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']
        if not all(col in df.columns for col in required_columns):
            return jsonify({'error': 'CSV must contain Date, Open, High, Low, Close, Volume columns'}), 400
        
        # Convert Date column to datetime and set as index
        df['Date'] = pd.to_datetime(df['Date'])
        df.set_index('Date', inplace=True)
        
        # Get strategy parameters
        ma_period = int(request.form.get('ma_period', 50))
        rsi_period = int(request.form.get('rsi_period', 14))
        rsi_overbought = float(request.form.get('rsi_overbought', 70))
        rsi_oversold = float(request.form.get('rsi_oversold', 30))
        macd_fast = int(request.form.get('macd_fast', 12))
        macd_slow = int(request.form.get('macd_slow', 26))
        macd_signal = int(request.form.get('macd_signal', 9))
        
        # Run backtest
        results = backtest_strategy(
            df, ma_period, rsi_period, rsi_overbought, rsi_oversold,
            macd_fast, macd_slow, macd_signal
        )
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': f'Error processing request: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)