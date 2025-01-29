import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import requests
import json

# Install necessary packages
# !pip install pandas scikit-learn

# Load dataset
df = pd.read_csv('/Users/mankirat/Desktop/ml/ dataset_1 985 rows.csv')

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

# Preprocess data
X = df[features]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train Isolation Forest model
clf = IsolationForest(
    contamination=0.3,  # Assuming 10% of collections might be suspicious
    random_state=42,
    n_estimators=100
)
clf.fit(X_scaled)

# Save models
joblib.dump(clf, 'isolation_forest_model.joblib')
joblib.dump(scaler, 'scaler.joblib')

def calculate_risk_score(data: pd.DataFrame, model, scaler) -> tuple[float, str]:
    # Get anomaly scores
    score = model.decision_function(scaler.transform(data))
    
    # # Normalize scores to 0-100 range
    # risk_score = 100 * (1 - (score - score.min()) / (score.max() - score.min()))
    
    # Determine risk category
    if score < 30:
        category = "Low Risk"
    elif score[0] < 70:
        category = "Medium Risk"
    else:
        category = "High Risk"
        
    return float(score), category

def predict_risk(new_contract_data):
    # Load saved models
    clf = joblib.load('isolation_forest_model.joblib')
    scaler = joblib.load('scaler.joblib')
    
    # Ensure new_contract_data has the same features in the same order
    new_data = pd.DataFrame([new_contract_data], columns=features)
    
    # Calculate risk score and category
    risk_score, risk_category = calculate_risk_score(new_data, clf, scaler)
    
    return {
        'risk_score': round(risk_score, 2),
        'risk_category': risk_category,
        'contributing_factors': identify_risk_factors(new_data)
    }

def identify_risk_factors(data):
    risk_factors = []
    
    # Define thresholds for various metrics
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

    # Make the API request
    response = requests.get(url, headers=headers)
    data = json.loads(response.text)['data']
    if data is None:
        return {'error': 'Data not available'}
    else:
        return predict_risk(data[0])

# Example usage
predict_risk_for_contract('0x000000000000003607fce1ac9e043a86675c5c2f')
