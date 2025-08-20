"""Configuration settings for the PDF Extraction Agent."""
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
INPUT_DIR = DATA_DIR / "input"
OUTPUT_DIR = DATA_DIR / "output"
LOG_DIR = BASE_DIR / "logs"

# MinerU settings
MINERU_CONFIG = {
    "output_format": "all",  # Generate all output formats
    "extract_tables": True,
    "extract_figures": True,
    "extract_equations": True,
}

# Chunking settings
CHUNK_SETTINGS = {
    "chunk_size": 1000,  # Number of characters per chunk
    "chunk_overlap": 200,  # Overlap between chunks
    "min_chunk_size": 100,  # Minimum chunk size
}

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "formatter": "standard",
            "class": "logging.StreamHandler",
        },
        "file": {
            "level": "DEBUG",
            "formatter": "standard",
            "class": "logging.FileHandler",
            "filename": LOG_DIR / "pdf_extraction.log",
            "mode": "a",
        },
    },
    "loggers": {
        "pdf_extraction": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
    },
}
