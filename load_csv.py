import pandas as pd
import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to Python path to import modules
sys.path.append(str(Path(__file__).parent))

# Now import after adding path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models import College
from app.database import Base

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost/innominds")

def extract_city_from_name(college_name):
    """Extract city from college name"""
    # Define Maharashtra cities commonly found in college names
    maharashtra_cities = [
        'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Amravati',
        'Yavatmal', 'Shegaon', 'Akola', 'Pusad', 'Chikhal', 'Buldhana',
        'Darapur', 'Badnera', 'Sangli', 'Satara', 'Kolhapur', 'Solapur',
        'Thane', 'Navi Mumbai', 'Jalgaon', 'Latur', 'Ahmednagar', 'Dhule',
        'Chandrapur', 'Parbhani', 'Jalna', 'Bhusawal', 'Osmanabad', 'Wardha',
        'Hingoli', 'Beed', 'Gondia', 'Washim', 'Nanded', 'Ratnagiri'
    ]
    
    # Also check for abbreviations and variations
    city_mapping = {
        'mumbai': 'Mumbai',
        'pune': 'Pune', 
        'nagpur': 'Nagpur',
        'nasik': 'Nashik',
        'aurangabad': 'Aurangabad',
        'amravati': 'Amravati',
        'yavatmal': 'Yavatmal',
        'akola': 'Akola',
        'sangli': 'Sangli',
        'kolhapur': 'Kolhapur',
        'solapur': 'Solapur',
        'thane': 'Thane',
        'latur': 'Latur',
        'jalna': 'Jalna',
        'osmanabad': 'Osmanabad',
        'nanded': 'Nanded'
    }
    
    college_lower = college_name.lower()
    
    # First check for exact city names
    for city in maharashtra_cities:
        if city.lower() in college_lower:
            return city
    
    # Check mapping
    for key, value in city_mapping.items():
        if key in college_lower:
            return value
    
    # Try to extract from parentheses or specific patterns
    import re
    patterns = [
        r'in\s+([A-Z][a-z]+)',  # "in Mumbai"
        r'at\s+([A-Z][a-z]+)',  # "at Pune"
        r',\s*([A-Z][a-z]+)',   # "College, Mumbai"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, college_name)
        if match:
            potential_city = match.group(1)
            if potential_city in maharashtra_cities:
                return potential_city
    
    return 'Other'

async def import_colleges():
    """Import colleges from CSV to database"""
    print("Starting college data import...")
    
    # Create engine
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    # Read CSV file
    csv_path = Path(__file__).parent / "collge_data.csv"
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        print("Please ensure 'collge_data.csv' exists in the project root.")
        return
    
    df = pd.read_csv(csv_path)
    print(f"Found {len(df)} records in CSV")
    
    # Track statistics
    total_imported = 0
    skipped = 0
    
    async with AsyncSessionLocal() as session:
        for index, row in df.iterrows():
            try:
                # Clean and prepare data
                college_name = str(row['College Name']).strip()
                branch_name = str(row['Branch Name']).strip()
                
                # Handle percentile (might be empty)
                percentile = row['Percentile']
                if pd.isna(percentile):
                    cutoff_percentile = None
                else:
                    try:
                        cutoff_percentile = float(percentile)
                    except:
                        cutoff_percentile = None
                
                # Handle fees
                fees = int(float(row['Fees'])) if not pd.isna(row['Fees']) else 0
                
                # Extract city
                city = extract_city_from_name(college_name)
                
                # Create college object
                college = College(
                    college_name=college_name,
                    branch_name=branch_name,
                    cutoff_percentile=cutoff_percentile,
                    fees=fees,
                    city=city
                )
                
                session.add(college)
                total_imported += 1
                
                # Commit in batches to avoid memory issues
                if total_imported % 50 == 0:
                    await session.commit()
                    print(f"Imported {total_imported} records...")
                    
            except Exception as e:
                skipped += 1
                print(f"Error importing row {index}: {e}")
                continue
        
        # Final commit
        await session.commit()
    
    print(f"\nImport completed!")
    print(f"Total imported: {total_imported}")
    print(f"Skipped: {skipped}")
    
    # Close engine
    await engine.dispose()

if __name__ == "__main__":
    print("College Data Import Script")
    print("=" * 50)
    asyncio.run(import_colleges())