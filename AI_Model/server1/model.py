from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import requests
import json

app = Flask(__name__)
CORS(app)

# Define features
features = [
    'avg_loss_making_trades',
    'avg_profitable_trades',
    'collection_score',
    'diamond_hands',
    'fear_and_greed_index',
    'holder_metrics_score',
    'liquidity_score',
    'loss_making_trades',
    'loss_making_trades_percentage',
    'loss_making_volume',
    'market_dominance_score',
    'metadata_score',
    'profitable_trades',
    'profitable_trades_percentage',
    'profitable_volume',
    'token_distribution_score',
    'washtrade_index'
]

# Initialize and train model on startup
def initialize_model():
    df = pd.read_csv('/Users/mankirat/Desktop/farzi projects/NFTnexus/Ai_model/server1/ dataset_1 985 rows.csv')
    X = df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    clf = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )
    clf.fit(X_scaled)
    
    joblib.dump(clf, 'isolation_forest_model.joblib')
    joblib.dump(scaler, 'scaler.joblib')
    return clf, scaler

def calculate_risk_score(data: pd.DataFrame, model, scaler) -> tuple[float, str]:
    score = model.decision_function(scaler.transform(data))
    risk_score = 100 * (1 - (score - (-0.26)) / (0.16 - (-0.26)))
    
    if risk_score < 10:
        category = "Low Risk"
    elif risk_score < 60:
        category = "Medium Risk"
    else:
        category = "High Risk"
    
    return float(risk_score), category

def predict_risk(new_contract_data):
    clf = joblib.load('isolation_forest_model.joblib')
    scaler = joblib.load('scaler.joblib')
    
    new_data = pd.DataFrame([new_contract_data], columns=features)
    risk_score, risk_category = calculate_risk_score(new_data, clf, scaler)
    
    return {
        'risk_score': round(risk_score, 2),
        'risk_category': risk_category,
        'contributing_factors': identify_risk_factors(new_data)
    }

def identify_risk_factors(data):
    risk_factors = []
    
    if data['washtrade_index'].iloc[0] > 50:
        risk_factors.append('High wash trading activity')
    if data['loss_making_trades_percentage'].iloc[0] > 70:
        risk_factors.append('High percentage of loss-making trades')
    if data['liquidity_score'].iloc[0] < 30:
        risk_factors.append('Low liquidity')
    if data['holder_metrics_score'].iloc[0] < 40:
        risk_factors.append('Poor holder metrics')
    
    return risk_factors

def predict_risk_for_contract(contract_address):
    url = f"https://api.unleashnfts.com/api/v2/nft/collection/profile?blockchain=ethereum&contract_address={contract_address}&offset=0&limit=100&sort_by=washtrade_index&time_range=all&sort_order=desc"
    headers = {
        "accept": "application/json",
        "x-api-key": "19a1634dc850e33607b074bc62da2e19"
    }

    response = requests.get(url, headers=headers)
    data = json.loads(response.text)['data']
    if data is None:
        return {'error': 'Data not available'}
    return predict_risk(data[0])

# Initialize model when app starts
clf, scaler = initialize_model()

# Flask routes
@app.route('/api', methods=['GET'])
def api():
    return jsonify({'data': 'Hello, World!'})

@app.route('/api/post', methods=['POST'])
def post_data():
    data = request.json
    return jsonify({'message': f'Received: {data}'})

@app.route('/api/predict-risk', methods=['POST'])
def predict_risk_route():
    try:
        data = request.json
        contract_address = data.get('contract_address')
        if not contract_address:
            return jsonify({'error': 'Contract address is required'}), 400
            
        result = predict_risk_for_contract(contract_address)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5012)
