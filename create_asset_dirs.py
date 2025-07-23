import os
import csv

ASSETS_DIR = 'assets'
CSV_FILE = 'data/reviews.csv'

def create_asset_directories():
    """Reads the reviews CSV and creates a directory for each watch ID in the assets folder."""
    if not os.path.exists(ASSETS_DIR):
        print(f"Creating base assets directory: {ASSETS_DIR}")
        os.makedirs(ASSETS_DIR)

    try:
        with open(CSV_FILE, mode='r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            ids = {row['id'] for row in reader if row.get('id')}

            if not ids:
                print("No IDs found in the CSV file. Nothing to create.")
                return

            print(f"Found {len(ids)} unique IDs. Checking/creating directories...")
            for watch_id in ids:
                dir_path = os.path.join(ASSETS_DIR, watch_id)
                if not os.path.exists(dir_path):
                    print(f"Creating directory: {dir_path}")
                    os.makedirs(dir_path)
                else:
                    print(f"Directory already exists: {dir_path}")

            print("\nAsset directory check complete.")

    except FileNotFoundError:
        print(f"Error: The file {CSV_FILE} was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == '__main__':
    create_asset_directories()
