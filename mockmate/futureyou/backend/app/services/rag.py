from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import get_settings


def _read_text_file(path: Path) -> str:
    # Text files should be UTF-8 for best results.
    return path.read_text(encoding="utf-8", errors="ignore").strip()


class RagEngine:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._embeddings = OpenAIEmbeddings(model=self._settings.openai_embedding_model)
        self._vectorstore: Optional[FAISS] = None
        self._init_lock = asyncio.Lock()

    @property
    def _index_ready(self) -> bool:
        vec_dir = Path(self._settings.vectorstore_dir)
        # FAISS uses index.faiss + index.pkl by default with save_local/load_local.
        return (vec_dir / "index.faiss").exists() and (vec_dir / "index.pkl").exists()

    async def init(self) -> None:
        if self._vectorstore is not None and self._index_ready:
            return

        async with self._init_lock:
            if self._vectorstore is not None and self._index_ready:
                return
            await self._load_or_build()

    async def _load_or_build(self) -> None:
        vec_dir = Path(self._settings.vectorstore_dir)
        vec_dir.mkdir(parents=True, exist_ok=True)

        if self._index_ready:
            # Loading is sync; move to a thread.
            self._vectorstore = await asyncio.to_thread(
                FAISS.load_local,
                str(vec_dir),
                self._embeddings,
                allow_dangerous_deserialization=True,
            )
            return

        docs = await asyncio.to_thread(self._load_and_chunk_documents)
        # Building is sync; move to a thread to keep FastAPI responsive.
        self._vectorstore = await asyncio.to_thread(
            FAISS.from_documents,
            docs,
            self._embeddings,
        )
        await asyncio.to_thread(self._vectorstore.save_local, str(vec_dir))

    def _load_and_chunk_documents(self) -> List[Document]:
        data_dir = Path(self._settings.data_dir)
        if not data_dir.exists():
            raise FileNotFoundError(f"RAG data dir does not exist: {data_dir}")

        text_paths = sorted([p for p in data_dir.glob("*.txt") if p.is_file()])
        if not text_paths:
            raise FileNotFoundError(f"No .txt files found in RAG data dir: {data_dir}")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self._settings.chunk_size,
            chunk_overlap=self._settings.chunk_overlap,
        )

        docs: List[Document] = []
        for path in text_paths:
            text = _read_text_file(path)
            if not text:
                continue

            # Start with one big document per source file.
            base_doc = Document(page_content=text, metadata={"source": path.stem})
            docs.extend(splitter.split_documents([base_doc]))
        return docs

    async def retrieve(self, query: str, *, k: Optional[int] = None) -> List[Tuple[str, Dict]]:
        await self.init()
        k = k or self._settings.top_k

        # similarity_search is sync; run in thread.
        results = await asyncio.to_thread(
            self._vectorstore.similarity_search,
            query,
            k,
        )

        # Return (chunk_text, metadata)
        return [(doc.page_content, doc.metadata or {}) for doc in results]


_RAG_ENGINE: Optional[RagEngine] = None


def get_rag_engine() -> RagEngine:
    global _RAG_ENGINE
    if _RAG_ENGINE is None:
        _RAG_ENGINE = RagEngine()
    return _RAG_ENGINE

