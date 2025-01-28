import pandas as pd

def extract_nft_data():
    try:
        # Read Excel file with correct path
        excel_path = "../NFTss.xlsx"
        df = pd.read_excel(excel_path)
        
        # Select only required columns
        nft_data = df[['collection_name', 'contract_address', 'blockchain']]
        
        # Remove duplicates if any
        nft_data = nft_data.drop_duplicates()
        
        # Save to new file in same directory
        output_path = "/Users/mankirat/Desktop/farzi projects/NFTnexus/AIModel/nft_collections.csv"
        nft_data.to_csv(output_path, index=False)
        
        return nft_data
        
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return None

# Usage
if __name__ == "__main__":
    data = extract_nft_data()
    if data is not None:
        print(data.head())