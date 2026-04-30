from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def load_portfolio_context() -> str:
    """
    Load all portfolio data files and combine them into a single context string.
    This will be injected into the system prompt for grounded responses.
    """
    data_dir = Path(__file__).parent.parent.parent / "data"
    
    context_parts = []
    
    # Load each data file
    files_to_load = ["resume.txt", "projects.txt", "achievements.txt", "story.txt"]
    
    for filename in files_to_load:
        file_path = data_dir / filename
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        context_parts.append(f"=== {filename.upper().replace('.TXT', '')} ===\n{content}")
            except Exception as e:
                print(f"Warning: Could not load {filename}: {e}")
    
    if not context_parts:
        return "No portfolio context available."
    
    full_context = "\n\n".join(context_parts)
    return full_context


def get_relevant_context(query: str) -> str:
    """
    For now, return the full context. In a more advanced version,
    this could do semantic search to find the most relevant sections.
    """
    return load_portfolio_context()
