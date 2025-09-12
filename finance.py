import os
import logging
import requests
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import yfinance as yf
from datetime import datetime, timedelta
from functools import lru_cache

# --- CONFIGURAÇÃO INICIAL ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app)

# --- CONEXÃO COM O SUPABASE ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise Exception("As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são necessárias.")
supabase: Client = create_client(supabase_url, supabase_key)

# --- FUNÇÕES AUXILIARES E CACHE ---
def format_ticker(ticker, asset_type):
    """Adiciona o sufixo correto ao ticker com base no tipo de ativo para o yfinance."""
    ticker = ticker.upper()
    if asset_type in ['acao', 'fii']: return f"{ticker}.SA"
    if asset_type == 'cripto': return f"{ticker}-USD"
    return ticker

@lru_cache(maxsize=1)
def get_dolar_rate():
    """Busca a cotação do dólar a partir de uma API, com cache para performance."""
    try:
        response = requests.get('https://economia.awesomeapi.com.br/last/USD-BRL')
        response.raise_for_status()
        return float(response.json()['USDBRL']['bid'])
    except Exception as e:
        logging.error(f"Erro ao buscar cotação do Dólar: {e}")
        return 5.0 # Retorna um valor fallback em caso de erro

@lru_cache(maxsize=128)
def get_asset_info(formatted_ticker):
    """Busca informações completas de um ativo, com cache."""
    try:
        return yf.Ticker(formatted_ticker).info
    except Exception:
        return {}

@lru_cache(maxsize=32)
def get_historical_prices(formatted_ticker, start_date, end_date):
    """Busca e armazena em cache os preços históricos para um ativo."""
    try:
        hist = yf.Ticker(formatted_ticker).history(start=start_date, end=end_date)
        hist.index = hist.index.tz_localize(None).normalize()
        return hist['Close']
    except Exception as e:
        logging.error(f"Erro ao buscar histórico para {formatted_ticker}: {e}")
        return None

# --- ENDPOINTS DA API ---

@app.route('/api/summary')
def get_summary():
    """Calcula e retorna um resumo geral da carteira."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID é obrigatório"}), 400

    try:
        response = supabase.table('transacoes').select('*').eq('user_id', user_id).execute()
        transactions = response.data
        if not transactions:
            return jsonify({
                "saldoBruto": 0, "variacaoDia": 0, "rentabilidadeTotal": 0,
                "totalCost": 0, "totalReturn": 0
            })

        portfolio = {}
        for tx in transactions:
            ticker, qty, price, tx_type = tx['ticker'], float(tx['quantity']), float(tx['price']), tx['transaction_type']
            if ticker not in portfolio:
                portfolio[ticker] = {'quantity': 0, 'totalCost': 0, 'assetType': tx['asset_type']}
            if tx_type == 'compra':
                portfolio[ticker]['quantity'] += qty
                portfolio[ticker]['totalCost'] += qty * price
            elif tx_type == 'venda':
                portfolio[ticker]['quantity'] -= qty

        total_equity = 0
        total_cost = 0
        total_day_change = 0
        dolar_rate = get_dolar_rate()

        for ticker, position in portfolio.items():
            if position['quantity'] <= 0: continue
            total_cost += position['totalCost']
            
            formatted_ticker = format_ticker(ticker, position['assetType'])
            try:
                hist = yf.Ticker(formatted_ticker).history(period="2d")
                if hist.empty or len(hist) < 2:
                    current_price = position['totalCost'] / position['quantity'] if position['quantity'] > 0 else 0
                    prev_close = current_price
                else:
                    current_price = hist['Close'].iloc[-1]
                    prev_close = hist['Close'].iloc[0]

                if position['assetType'] in ['stock', 'reit', 'cripto']:
                    current_price *= dolar_rate
                    prev_close *= dolar_rate
                
                total_equity += position['quantity'] * current_price
                total_day_change += position['quantity'] * (current_price - prev_close)
            except Exception:
                total_equity += position['totalCost']

        rentabilidade = ((total_equity - total_cost) / total_cost) if total_cost > 0 else 0
        return jsonify({
            "saldoBruto": total_equity, "variacaoDia": total_day_change,
            "rentabilidadeTotal": rentabilidade, "totalCost": total_cost,
            "totalReturn": total_equity - total_cost
        })
    except Exception as e:
        logging.error(f"Erro CRÍTICO em /api/summary: {e}")
        return jsonify({"error": "Erro interno ao calcular o resumo da carteira"}), 500

@app.route('/api/portfolio/allocation')
def get_portfolio_allocation():
    """Retorna a alocação detalhada da carteira para os gráficos."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID é obrigatório"}), 400

    try:
        response = supabase.table('transacoes').select('*').eq('user_id', user_id).execute()
        transactions = response.data
        if not transactions:
            return jsonify({"assets": [], "summary": {}})

        portfolio = {}
        for tx in transactions:
            ticker, qty, price, tx_type, asset_type = tx['ticker'], float(tx['quantity']), float(tx['price']), tx['transaction_type'], tx['asset_type']
            if ticker not in portfolio:
                portfolio[ticker] = {'quantity': 0, 'totalCost': 0, 'assetType': asset_type}
            if tx_type == 'compra':
                portfolio[ticker]['quantity'] += qty
                portfolio[ticker]['totalCost'] += qty * price
            elif tx_type == 'venda':
                portfolio[ticker]['quantity'] -= qty

        current_assets = {t: p for t, p in portfolio.items() if p['quantity'] > 0}
        if not current_assets:
            return jsonify({"assets": [], "summary": {}})

        total_portfolio_value = 0
        assets_with_values = []
        dolar_rate = get_dolar_rate()

        for ticker, position in current_assets.items():
            formatted_ticker = format_ticker(ticker, position['assetType'])
            info = get_asset_info(formatted_ticker)
            hist = yf.Ticker(formatted_ticker).history(period="1d")
            current_price = hist['Close'].iloc[-1] if not hist.empty else 0
            
            if position['assetType'] in ['stock', 'reit', 'cripto']:
                current_price *= dolar_rate
            
            total_value = position['quantity'] * current_price
            total_portfolio_value += total_value
            
            assets_with_values.append({
                "ticker": ticker,
                "type": position['assetType'],
                "totalValue": total_value,
                "totalCost": position['totalCost'],
                "sector": info.get('sector', 'Não categorizado'),
                "longName": info.get('longName', ticker)
            })

        types_summary = {}
        sector_summary = {}
        for asset in assets_with_values:
            type_name = asset['type'].capitalize()
            sector_name = asset['sector']
            types_summary[type_name] = types_summary.get(type_name, 0) + asset['totalValue']
            sector_summary[sector_name] = sector_summary.get(sector_name, 0) + asset['totalValue']

        donut_chart_data = [{"name": n, "value": v, "percentage": (v / total_portfolio_value) * 100 if total_portfolio_value > 0 else 0} for n, v in types_summary.items()]
        sector_chart_data = [{"name": n, "value": v, "percentage": (v / total_portfolio_value) * 100 if total_portfolio_value > 0 else 0} for n, v in sector_summary.items()]
        
        sorted_assets = sorted(assets_with_values, key=lambda x: x['totalValue'], reverse=True)

        return jsonify({
            "assets": sorted_assets,
            "summary": {
                "totalValue": total_portfolio_value,
                "assetTypes": donut_chart_data,
                "sectorAllocation": sector_chart_data
            }
        })
    except Exception as e:
        logging.error(f"Erro em /api/portfolio/allocation: {e}")
        return jsonify({"error": "Erro interno ao calcular a alocação"}), 500

@app.route('/api/portfolio/history')
def get_portfolio_history():
    """Calcula o valor histórico real da carteira com base nas transações."""
    user_id = request.args.get('user_id')
    period = request.args.get('period', '1Y').upper()
    if not user_id:
        return jsonify({"error": "User ID é obrigatório"}), 400

    try:
        response = supabase.table('transacoes').select('*').eq('user_id', user_id).order('transaction_date', desc=False).execute()
        transactions = response.data
        if not transactions:
            return jsonify([])

        end_date = datetime.now()
        if period == '1M': start_date = end_date - timedelta(days=30)
        elif period == '3M': start_date = end_date - timedelta(days=90)
        elif period == '6M': start_date = end_date - timedelta(days=180)
        elif period == 'YTD': start_date = datetime(end_date.year, 1, 1)
        elif period == 'ALL': start_date = datetime.strptime(transactions[0]['transaction_date'], '%Y-%m-%d')
        else: start_date = end_date - timedelta(days=365)
        
        first_tx_date = datetime.strptime(transactions[0]['transaction_date'], '%Y-%m-%d')
        if start_date < first_tx_date:
            start_date = first_tx_date

        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        unique_tickers = {tx['ticker']: tx['asset_type'] for tx in transactions}
        historical_prices = {}
        dolar_rate = get_dolar_rate()

        for ticker, asset_type in unique_tickers.items():
            formatted_ticker = format_ticker(ticker, asset_type)
            prices = get_historical_prices(formatted_ticker, start_date, end_date)
            if prices is not None:
                historical_prices[ticker] = prices

        for tx in transactions:
            tx['transaction_date_dt'] = datetime.strptime(tx['transaction_date'], '%Y-%m-%d')

        portfolio_evolution = []
        for day in date_range:
            portfolio_on_day = {}
            for tx in transactions:
                if tx['transaction_date_dt'] <= day:
                    ticker, qty, tx_type = tx['ticker'], float(tx['quantity']), tx['transaction_type']
                    if ticker not in portfolio_on_day:
                        portfolio_on_day[ticker] = {'quantity': 0, 'assetType': tx['asset_type']}
                    if tx_type == 'compra': portfolio_on_day[ticker]['quantity'] += qty
                    elif tx_type == 'venda': portfolio_on_day[ticker]['quantity'] -= qty
            
            daily_total_value = 0
            for ticker, position in portfolio_on_day.items():
                if position['quantity'] > 0 and ticker in historical_prices:
                    price_on_day = historical_prices[ticker].asof(day)
                    if not pd.isna(price_on_day):
                        if position['assetType'] in ['stock', 'reit', 'cripto']:
                            price_on_day *= dolar_rate
                        daily_total_value += position['quantity'] * price_on_day
            
            if daily_total_value > 0:
                portfolio_evolution.append({"date": day.strftime('%Y-%m-%d'), "value": round(daily_total_value, 2)})

        return jsonify(portfolio_evolution)
    except Exception as e:
        logging.error(f"Erro CRÍTICO em /api/portfolio/history: {e}")
        return jsonify({"error": "Erro interno ao calcular o histórico da carteira"}), 500

@app.route('/api/quote/<string:asset_type>/<string:ticker>')
def get_quote(ticker, asset_type):
    """Busca a cotação atual e a variação diária de um ativo."""
    try:
        formatted_ticker = format_ticker(ticker, asset_type)
        hist = yf.Ticker(formatted_ticker).history(period="2d")
        if hist.empty or len(hist) < 2:
            return jsonify({"error": "Histórico de cotação insuficiente"}), 404
        
        previous_close = hist['Close'].iloc[0]
        current_price = hist['Close'].iloc[-1]
        
        if asset_type in ['stock', 'reit', 'cripto']:
            dolar_rate = get_dolar_rate()
            current_price *= dolar_rate
            previous_close *= dolar_rate

        change = current_price - previous_close
        percent_change = (change / previous_close) * 100 if previous_close != 0 else 0
        return jsonify({"price": current_price, "change": change, "percentChange": percent_change})
    except Exception as e:
        return jsonify({"error": "Erro ao buscar cotação"}), 500

@app.route('/api/dividends/<string:asset_type>/<string:ticker>')
def get_dividends(ticker, asset_type):
    """Busca o histórico de dividendos de um ativo."""
    try:
        formatted_ticker = format_ticker(ticker, asset_type)
        dividendos = yf.Ticker(formatted_ticker).dividends
        if dividendos.empty: return jsonify([])
        dividendos_json = [{"date": data.strftime('%Y-%m-%d'), "value": round(valor, 4)} for data, valor in dividendos.items()]
        return jsonify(sorted(dividendos_json, key=lambda x: x['date'], reverse=True))
    except Exception as e:
        return jsonify({"error": "Erro ao buscar dividendos"}), 500
@app.route('/api/portfolio/progress')
def get_portfolio_progress():
    """Retorna os valores atuais da carteira para o cálculo de progresso das metas."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID é obrigatório"}), 400

    try:
        response = supabase.table('transacoes').select('*').eq('user_id', user_id).execute()
        transactions = response.data
        if not transactions:
            return jsonify({"patrimonio": 0, "proventos_mensal": 0, "ativos": {}})

        portfolio = {}
        for tx in transactions:
            ticker, qty, tx_type = tx['ticker'], float(tx['quantity']), tx['transaction_type']
            if ticker not in portfolio:
                portfolio[ticker] = {'quantity': 0, 'assetType': tx['asset_type']}
            if tx_type == 'compra':
                portfolio[ticker]['quantity'] += qty
            elif tx_type == 'venda':
                portfolio[ticker]['quantity'] -= qty
        
        total_equity = 0
        dolar_rate = get_dolar_rate()
        for ticker, position in portfolio.items():
            if position['quantity'] <= 0: continue
            
            formatted_ticker = format_ticker(ticker, position['assetType'])
            hist = yf.Ticker(formatted_ticker).history(period="1d")
            current_price = hist['Close'].iloc[-1] if not hist.empty else 0
            
            if position['assetType'] in ['stock', 'reit', 'cripto']:
                current_price *= dolar_rate
            
            total_equity += position['quantity'] * current_price

        ativos_quantidades = {
            ticker: pos['quantity'] 
            for ticker, pos in portfolio.items() 
            if pos['quantity'] > 0
        }

        # Simulação de proventos mensais (0.5% do patrimônio)
        proventos_mensal_estimado = total_equity * 0.005

        return jsonify({
            "patrimonio": total_equity,
            "proventos_mensal": proventos_mensal_estimado,
            "ativos": ativos_quantidades
        })

    except Exception as e:
        logging.error(f"Erro CRÍTICO em /api/portfolio/progress: {e}")
        return jsonify({"error": "Erro interno ao buscar dados de progresso"}), 500

# --- EXECUÇÃO DA APLICAÇÃO ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)

