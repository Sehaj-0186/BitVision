from flask import Flask, request, jsonify
from abc import predict_risk_for_contract

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    contract_address = data.get('contract_address')
    if not contract_address:
        return jsonify({'error': 'Contract address is required'}), 400
    
    result = predict_risk_for_contract(contract_address)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
