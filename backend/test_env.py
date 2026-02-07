import os

def test_env_access():
    """Test accessing environment variables from Python"""
    
    print("Testing environment variable access in Python...")
    print("="*50)
    
    # Try to access DATABASE_URL directly
    database_url = os.environ.get('DATABASE_URL')
    print(f"DATABASE_URL directly: {database_url}")
    
    # Check all environment variables for debugging
    print("\nAll environment variables containing 'DATABASE':")
    for key, value in os.environ.items():
        if 'DATABASE' in key.upper():
            print(f"  {key}: {value}")
    
    # Check if python-dotenv is installed and try loading .env manually
    try:
        from dotenv import load_dotenv
        print(f"\npython-dotenv module is available.")
        
        # Load .env file from current directory
        load_dotenv()
        
        # Try to access DATABASE_URL after loading .env
        database_url_after_load = os.environ.get('DATABASE_URL')
        print(f"DATABASE_URL after load_dotenv(): {database_url_after_load}")
        
    except ImportError:
        print("\npython-dotenv module is NOT available. You may need to install it.")
        print("To install: pip install python-dotenv")
        
    print("="*50)

if __name__ == "__main__":
    test_env_access()
