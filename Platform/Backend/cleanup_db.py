import os
import sys

# Add current directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from clinical_db import db_path, engine, Base

def main():
    print(f"Database Path: {db_path}")
    
    # Check if DB file exists
    if os.path.exists(db_path):
        print("Existing database found. Deleting database file to ensure full clean reset...")
        try:
            os.remove(db_path)
            print("Successfully deleted old database file.")
        except Exception as e:
            print(f"Error deleting database file: {e}")
            print("Falling back to dropping all tables...")
            Base.metadata.drop_all(bind=engine)
            print("Successfully dropped all tables.")
    else:
        print("No existing database file found. Recreating fresh database.")

    # Recreate all tables cleanly
    Base.metadata.create_all(bind=engine)
    print("Database tables recreated successfully!")
    print("Zero mockup or duplicate data remains. Ready for production usage.")

if __name__ == "__main__":
    main()
