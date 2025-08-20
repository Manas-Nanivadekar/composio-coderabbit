# PDF Extraction Agent

This agent is responsible for extracting text, tables, and metadata from PDF files using MinerU and preparing the content for RAG (Retrieval-Augmented Generation) applications.

## Features

- Extracts text, tables, and figures from PDFs
- Processes PDF metadata
- Chunks content for efficient retrieval
- Saves structured output in JSON format
- Handles batch processing of multiple PDFs

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pdf_extraction
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Process a single PDF file:
```bash
python run_extractor.py --single-file data/input/your_file.pdf
```

### Process all PDFs in a directory:
```bash
python run_extractor.py --input-dir data/input --output-dir data/output
```

### Enable debug logging:
```bash
python run_extractor.py --debug
```

## Configuration

Edit `config/settings.py` to modify:
- Input/output directories
- Chunking settings
- Logging configuration
- MinerU extraction settings

## Output Format

The agent produces JSON files with the following structure:

```json
{
  "metadata": {
    "title": "Document Title",
    "author": "Author Name",
    "page_count": 10,
    "creation_date": "2023-01-01"
  },
  "chunks": [
    {
      "text": "Extracted text content...",
      "type": "text",
      "page": 1,
      "metadata": {
        "section": "Introduction",
        "source": "document.pdf"
      }
    }
  ]
}
```

## Development

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
black .
isort .
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
