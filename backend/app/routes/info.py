"""Project documentation, course outcome alignment, and responsible AI endpoints."""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/info", tags=["Project Information"])

COURSE_MAPPING = [
    {
        "code": "CO1",
        "title": "Linguistic Foundations & Preprocessing",
        "implementation": (
            "Complete modular preprocessing pipeline including URL/mention normalization, negation-preserving "
            "stopword removal, Porter stemming, WordNet lemmatization, and emoji translation."
        ),
        "status": "Fully Implemented",
    },
    {
        "code": "CO2",
        "title": "Distributed Representations & Word Embeddings",
        "implementation": (
            "Gensim Word2Vec CBOW vs. Skip-Gram architectures, cosine semantic similarity metrics, word analogy "
            "vector arithmetic, and 2D dimensionality reduction using PCA and t-SNE."
        ),
        "status": "Fully Implemented",
    },
    {
        "code": "CO3",
        "title": "Recurrent Sequence Modeling (LSTM & BiLSTM)",
        "implementation": (
            "PyTorch deep recurrent neural classifiers with embedding initialization from Word2Vec, dropout, "
            "masked pooling over variable length sequences, and comparative benchmarking of unidirectional vs. bidirectional LSTM."
        ),
        "status": "Fully Implemented",
    },
    {
        "code": "CO4",
        "title": "Attention Mechanisms in NLP",
        "implementation": (
            "Additive self-attention mechanism over BiLSTM hidden states. Extracts token attention distribution "
            "for explainability visualization in the web application."
        ),
        "status": "Fully Implemented",
    },
    {
        "code": "CO5",
        "title": "Transformer Encoders & BERT Fine-Tuning",
        "implementation": (
            "Pretrained DistilBERT/BERT sequence classification head fine-tuned with AdamW and linear warmup, "
            "preserving full casing, subwords (WordPiece), and punctuation context."
        ),
        "status": "Fully Implemented",
    },
    {
        "code": "CO6",
        "title": "Responsible AI, Evaluation & Limitations",
        "implementation": (
            "Comprehensive evaluation (macro/weighted F1, confusion matrices, class reports), feature attribution, "
            "occlusion sensitivity, non-retention by default, and decision-support safeguards."
        ),
        "status": "Fully Implemented",
    },
]

RESPONSIBLE_AI_SAFEGUARDS = [
    {
        "title": "Decision Support, Not Automated Sanction",
        "description": "Model predictions indicate statistical correlation with corpus annotations and must never automatically ban, censor, or punish users without human review.",
    },
    {
        "title": "Sarcasm and Cultural Nuance Limitations",
        "description": "Social media language exhibits deep cultural nuance, reclaimed colloquialisms, and irony that bag-of-words or static embeddings may misclassify as offensive.",
    },
    {
        "title": "Privacy and Non-Retention Policy",
        "description": "Text submitted through live or batch inference is evaluated transiently in-memory and is never stored, logged, or serialized to persistent databases.",
    },
    {
        "title": "Separation of Offensiveness from Cyberbullying",
        "description": "Ordinary negative language or isolated profanity is distinguished from systematic identity-targeted cyberbullying (religion, ethnicity, gender, age).",
    },
]


@router.get("")
def get_project_metadata():
    """Retrieve course outcome mapping, architecture overview, and ethical safeguards."""
    return {
        "project_name": "ShieldText",
        "subtitle": "An NLP-Based Cyberbullying Detection and Classification System",
        "course": "CSE472 — Deep Learning for Natural Language Processing",
        "academic_session": "2026–27",
        "dataset_source": "Wang et al. (2021) Cyberbullying Tweets Dataset (47,692 records, 6 balanced classes)",
        "course_mapping": COURSE_MAPPING,
        "responsible_ai_safeguards": RESPONSIBLE_AI_SAFEGUARDS,
    }


DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "docs")


@router.get("/presentation-pdf")
def get_presentation_pdf():
    """Download the 12-slide class defense presentation PDF."""
    pdf_path = os.path.join(DOCS_DIR, "ShieldText_Class_Presentation.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Presentation PDF not found.")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="ShieldText_Class_Presentation.pdf",
    )


@router.get("/report-pdf")
def get_report_pdf():
    """Download the comprehensive formal academic project report PDF."""
    pdf_path = os.path.join(DOCS_DIR, "ShieldText_Detailed_Report.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Detailed Report PDF not found.")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="ShieldText_Detailed_Report.pdf",
    )


