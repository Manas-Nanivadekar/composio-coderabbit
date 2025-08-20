#!/usr/bin/env python3
"""
FastAPI PDF Chat Server Startup Script
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    pdf_api_path = script_dir / "pdf_extraction" / "src" / "chat_with_pdf.py"
    
    # Check if the PDF API file exists
    if not pdf_api_path.exists():
        print(f"Error: PDF API file not found at {pdf_api_path}")
        print("Please ensure the pdf_extraction directory structure is correct.")
        sys.exit(1)
    
    # Check if GOOGLE_API_KEY is set
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY environment variable is not set.")
        print("Please set your Google API key:")
        print("  Windows: set GOOGLE_API_KEY=your_api_key_here")
        print("  Linux/Mac: export GOOGLE_API_KEY=your_api_key_here")
        sys.exit(1)
    
    # Check if required packages are installed
    required_packages = [
        "fastapi",
        "uvicorn",
        "PyPDF2",
        "python-pptx",
        "langchain",
        "langchain-google-genai",
        "python-dotenv",
        "faiss-cpu"
    ]
    
    print("Checking required packages...")
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Error: Missing required packages: {', '.join(missing_packages)}")
        print("Please install them using:")
        print(f"  pip install {' '.join(missing_packages)}")
        sys.exit(1)
    
    print("All required packages are installed.")
    print("Starting FastAPI server...")
    print("The server will be available at: http://localhost:8000")
    print("API documentation will be available at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start the FastAPI server using uvicorn
        cmd = [
            sys.executable, "-m", "uvicorn",
            "pdf_extraction.src.chat_with_pdf:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ]
        
        # Change to the script directory to ensure proper module loading
        os.chdir(script_dir)
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
