"""Generates a presentation slide deck PDF for ShieldText.

Designed for class presentation defense in CSE472 Deep Learning for NLP.
Uses ReportLab to generate a landscape presentation PDF.
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)
from reportlab.pdfgen import canvas

PDF_OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "docs",
    "ShieldText_Class_Presentation.pdf",
)

PAGE_WIDTH, PAGE_HEIGHT = landscape(letter)  # 792 x 612 pt


class PresentationCanvas(canvas.Canvas):
    """Custom canvas that adds slide frame, running header, running footer, and page numbers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, total_pages):
        self.saveState()

        # Check if first page (Title slide)
        if self._pageNumber == 1:
            # Top accent bar on title slide
            self.setFillColor(colors.HexColor("#2563eb"))
            self.rect(0, PAGE_HEIGHT - 12, PAGE_WIDTH, 12, fill=True, stroke=False)
            # Bottom bar
            self.setFillColor(colors.HexColor("#0f172a"))
            self.rect(0, 0, PAGE_WIDTH, 36, fill=True, stroke=False)

            self.setFillColor(colors.HexColor("#94a3b8"))
            self.setFont("Helvetica-Bold", 9)
            self.drawString(36, 14, "CSE472: Deep Learning for NLP — Academic Session 2026–27")
            self.drawRightString(PAGE_WIDTH - 36, 14, "Autonomous Final Project Defense")
            self.restoreState()
            return

        # Regular slide decorations
        # Top banner band
        self.setFillColor(colors.HexColor("#0f172a"))
        self.rect(0, PAGE_HEIGHT - 48, PAGE_WIDTH, 48, fill=True, stroke=False)

        # Thin accent stripe below banner
        self.setFillColor(colors.HexColor("#2563eb"))
        self.rect(0, PAGE_HEIGHT - 52, PAGE_WIDTH, 4, fill=True, stroke=False)

        # Category pill in top right of banner
        self.setFillColor(colors.HexColor("#1e293b"))
        self.roundRect(PAGE_WIDTH - 260, PAGE_HEIGHT - 38, 224, 24, 4, fill=True, stroke=False)
        self.setFillColor(colors.HexColor("#60a5fa"))
        self.setFont("Helvetica-Bold", 8)
        self.drawRightString(PAGE_WIDTH - 46, PAGE_HEIGHT - 28, "CSE472: DL FOR NLP (2026–27)")

        # Running bottom footer
        self.setFillColor(colors.HexColor("#f1f5f9"))
        self.rect(0, 0, PAGE_WIDTH, 28, fill=True, stroke=False)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(0, 28, PAGE_WIDTH, 28)

        # Footer text
        self.setFillColor(colors.HexColor("#64748b"))
        self.setFont("Helvetica-Bold", 8)
        self.drawString(36, 10, "ShieldText: An NLP-Based Cyberbullying Detection System")
        self.drawRightString(PAGE_WIDTH - 36, 10, f"Slide {self._pageNumber} of {total_pages}")

        self.restoreState()


def build_presentation_pdf(output_path: str = PDF_OUTPUT_PATH):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=58,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        "SlideTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=10,
    )

    slide_header_style = ParagraphStyle(
        "SlideBannerTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=colors.white,
    )

    body_style = ParagraphStyle(
        "SlideBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
    )

    body_bold = ParagraphStyle(
        "SlideBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    bullet_style = ParagraphStyle(
        "SlideBullet",
        parent=body_style,
        leftIndent=14,
        bulletIndent=4,
        spaceAfter=4,
    )

    code_style = ParagraphStyle(
        "SlideCode",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=1,  # Center
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_center = ParagraphStyle(
        "TableCellCenter",
        parent=table_cell_style,
        alignment=1,
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell_style,
        fontName="Helvetica-Bold",
    )

    story = []

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    story.append(Spacer(1, 40))

    # Category Pill
    pill_text = (
        "<font color='#2563eb'><b>COURSE PROJECT PRESENTATION</b></font> &nbsp;|&nbsp; "
        "<b>CSE472 — DEEP LEARNING FOR NLP (2026–27)</b>"
    )
    pill_para = Paragraph(pill_text, body_style)
    pill_table = Table([[pill_para]], colWidths=[PAGE_WIDTH - 72])
    pill_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bfdbfe")),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ])
    )
    story.append(pill_table)
    story.append(Spacer(1, 24))

    main_title = Paragraph(
        "<font size='26' color='#0f172a'><b>ShieldText</b></font><br/>"
        "<font size='18' color='#2563eb'><b>An NLP-Based Cyberbullying Detection & Classification System</b></font>",
        ParagraphStyle("MainTitle", parent=title_style, alignment=1, leading=30),
    )
    story.append(main_title)
    story.append(Spacer(1, 14))

    sub_desc = Paragraph(
        "Distinguishing Ordinary Negative Language from Identity-Targeted Harassment Across 6 Demographics<br/>"
        "Leveraging TF-IDF Baselines, Word2Vec Vectors, Recurrent Networks with Attention, and Transformers",
        ParagraphStyle("SubDesc", parent=body_style, alignment=1, fontSize=11, leading=16, textColor=colors.HexColor("#475569")),
    )
    story.append(sub_desc)
    story.append(Spacer(1, 32))

    # Title Meta Cards
    meta_data = [
        [
            Paragraph("<b>Dataset & Scope</b><br/>Wang et al. (2021) Dataset<br/>47,692 tweets &bull; 6 Balanced Classes", body_style),
            Paragraph("<b>Models Evaluated</b><br/>8 Architectures<br/>TF-IDF, W2V, LSTM, BiLSTM, Attn, BERT", body_style),
            Paragraph("<b>Top Benchmark Result</b><br/>BiLSTM Classifier<br/><b>84.96% Accuracy</b> &bull; <b>0.8404 Macro F1</b>", body_style),
            Paragraph("<b>Deployment & Stack</b><br/>FastAPI + React.js + PyTorch<br/>Interactive Explainability & Batch CSV", body_style),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[(PAGE_WIDTH - 72) / 4] * 4)
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 10),
        ])
    )
    story.append(meta_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: Problem Statement & Motivation
    # =========================================================================
    story.append(Paragraph("<b>Problem Statement & Motivation</b>", title_style))
    story.append(Spacer(1, 6))

    prob_cards = [
        [
            Paragraph(
                "<b>1. The Online Harassment Epidemic</b><br/><br/>"
                "&bull; Social media abuse inflicts severe psychological trauma on vulnerable groups.<br/>"
                "&bull; Manual moderation cannot scale to hundreds of millions of daily conversational posts.<br/>"
                "&bull; Automated systems are critical for real-time detection, triaging, and intervention.",
                body_style,
            ),
            Paragraph(
                "<b>2. The Flaw of Binary Toxicity</b><br/><br/>"
                "&bull; Generic toxicity models flag <i>any</i> profanity, conflating casual venting with targeted harassment.<br/>"
                "&bull; Example: <i>'The weather is damn terrible'</i> is negative but <b>not cyberbullying</b>.<br/>"
                "&bull; Must separate negative/offensive language from systematic, identity-targeted abuse.",
                body_style,
            ),
        ],
        [
            Paragraph(
                "<b>3. The Danger of Aggressive Stopword Removal</b><br/><br/>"
                "&bull; Standard NLTK stopword lists drop words like <code>not</code>, <code>no</code>, <code>never</code>, <code>cannot</code>.<br/>"
                "&bull; <i>'I am not a bully'</i> becomes <i>'bully'</i> &rarr; <b>False Positive Catastrophe</b>.<br/>"
                "&bull; ShieldText incorporates strict <b>negation-preserving preprocessing</b>.",
                body_style,
            ),
            Paragraph(
                "<b>4. Granular Demographic Categorization</b><br/><br/>"
                "&bull; Cyberbullying exhibits distinct linguistic patterns across targeted demographics.<br/>"
                "&bull; Categorizing into <b>Age, Ethnicity, Gender, Religion</b> provides targeted context.<br/>"
                "&bull; Enables precise policy enforcement rather than blunt blanket censorship.",
                body_style,
            ),
        ],
    ]
    prob_table = Table(prob_cards, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    prob_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(prob_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: Course Outcome (CO) Alignment
    # =========================================================================
    story.append(Paragraph("<b>Academic Alignment: CSE472 Course Outcome Mapping</b>", title_style))
    story.append(Spacer(1, 4))

    co_data = [
        [
            Paragraph("<b>Outcome</b>", table_header_style),
            Paragraph("<b>Curriculum Focus</b>", table_header_style),
            Paragraph("<b>ShieldText Implementation & Deliverables</b>", table_header_style),
            Paragraph("<b>Status</b>", table_header_style),
        ],
        [
            Paragraph("<b>CO1</b>", table_cell_bold),
            Paragraph("Linguistic Foundations, Tokenization & Preprocessing", table_cell_bold),
            Paragraph("Regex URL/mention handling, emoji-to-text translation, WordNet lemmatizer, and <b>negation-preserving stopword filtering</b>.", table_cell_style),
            Paragraph("<font color='#059669'><b>Complete</b></font>", table_cell_center),
        ],
        [
            Paragraph("<b>CO2</b>", table_cell_bold),
            Paragraph("Distributed Representations & Word Embeddings", table_cell_bold),
            Paragraph("Custom <b>Word2Vec CBOW and Skip-Gram</b> models (100-dim, 14,890 words), cosine nearest neighbors, vector analogies, and 2D PCA/t-SNE.", table_cell_style),
            Paragraph("<font color='#059669'><b>Complete</b></font>", table_cell_center),
        ],
        [
            Paragraph("<b>CO3</b>", table_cell_bold),
            Paragraph("Recurrent Neural Networks (LSTM & BiLSTM)", table_cell_bold),
            Paragraph("PyTorch 2-layer <b>Unidirectional LSTM and Bidirectional LSTM</b> with Word2Vec weight initialization and masked max-pooling.", table_cell_style),
            Paragraph("<font color='#059669'><b>Complete</b></font>", table_cell_center),
        ],
        [
            Paragraph("<b>CO4</b>", table_cell_bold),
            Paragraph("Sequence Attention Mechanisms", table_cell_bold),
            Paragraph("Additive <b>Self-Attention layer</b> over BiLSTM states. Returns dynamic token attention distribution &alpha;<sub>t</sub> for interactive heatmaps.", table_cell_style),
            Paragraph("<font color='#059669'><b>Complete</b></font>", table_cell_center),
        ],
        [
            Paragraph("<b>CO5</b>", table_cell_bold),
            Paragraph("Transformer Encoders & BERT Fine-Tuning", table_cell_bold),
            Paragraph("Pretrained <b>DistilBERT sequence classification head</b> fine-tuned with AdamW and linear warmup, leveraging subword WordPiece tokens.", table_cell_style),
            Paragraph("<font color='#059669'><b>Complete</b></font>", table_cell_center),
        ],
        [
            Paragraph("<b>CO6</b>", table_cell_bold),
            Paragraph("Evaluation, Explainability & Responsible AI", table_cell_bold),
            Paragraph("Macro F1, confusion matrices, occlusion sensitivity, feature attributions, and non-retention ephemeral RAM moderation safeguards.", table_cell_style),
            Paragraph("<font color='#059669'><b>Complete</b></font>", table_cell_center),
        ],
    ]
    co_table = Table(co_data, colWidths=[40, 160, 440, 80])
    co_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ])
    )
    story.append(co_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: Dataset Selection & Verification
    # =========================================================================
    story.append(Paragraph("<b>Dataset Selection, Integrity & Stratified Partitioning</b>", title_style))
    story.append(Spacer(1, 6))

    ds_intro = Paragraph(
        "ShieldText uses the gold-standard <b>Cyberbullying Classification Dataset</b> by <b>Wang et al. (2021)</b>, "
        "downloaded directly from the Hugging Face Hub (<code>poorvanshi04/cyberbullying_tweets.csv</code>).",
        body_style,
    )
    story.append(ds_intro)
    story.append(Spacer(1, 10))

    ds_metrics = [
        [
            Paragraph("<b>Initial Records:</b> 47,692 tweets", body_style),
            Paragraph("<b>Exact Duplicates Purged:</b> 1,675 rows", body_style),
            Paragraph("<b>Clean Non-Empty Corpus:</b> 45,749 rows", body_style),
        ]
    ]
    ds_m_table = Table(ds_metrics, colWidths=[(PAGE_WIDTH - 72) / 3] * 3)
    ds_m_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bfdbfe")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(ds_m_table)
    story.append(Spacer(1, 12))

    # Class distribution and Splits table
    split_data = [
        [
            Paragraph("<b>Target Class</b>", table_header_style),
            Paragraph("<b>Demographic Focus</b>", table_header_style),
            Paragraph("<b>Train Split (70%)</b>", table_header_style),
            Paragraph("<b>Val Split (15%)</b>", table_header_style),
            Paragraph("<b>Test Split (15%)</b>", table_header_style),
        ],
        [
            Paragraph("<b>Age</b>", table_cell_bold),
            Paragraph("Schoolyard bullying, grade hierarchy, vulnerability slurs", table_cell_style),
            Paragraph("5,562", table_cell_center),
            Paragraph("1,192", table_cell_center),
            Paragraph("1,192", table_cell_center),
        ],
        [
            Paragraph("<b>Ethnicity</b>", table_cell_bold),
            Paragraph("Racial, ethnic, xenophobic, and nationality disparagement", table_cell_style),
            Paragraph("5,553", table_cell_center),
            Paragraph("1,190", table_cell_center),
            Paragraph("1,190", table_cell_center),
        ],
        [
            Paragraph("<b>Gender</b>", table_cell_bold),
            Paragraph("Sexist insults, misogynistic tropes, gender harassment", table_cell_style),
            Paragraph("5,524", table_cell_center),
            Paragraph("1,184", table_cell_center),
            Paragraph("1,184", table_cell_center),
        ],
        [
            Paragraph("<b>Religion</b>", table_cell_bold),
            Paragraph("Harassment targeting religious identity, scriptures, groups", table_cell_style),
            Paragraph("5,573", table_cell_center),
            Paragraph("1,194", table_cell_center),
            Paragraph("1,194", table_cell_center),
        ],
        [
            Paragraph("<b>Other Cyberbullying</b>", table_cell_bold),
            Paragraph("General non-demographic malice, personal hostility", table_cell_style),
            Paragraph("4,737", table_cell_center),
            Paragraph("1,015", table_cell_center),
            Paragraph("1,016", table_cell_center),
        ],
        [
            Paragraph("<b>Not Cyberbullying</b>", table_cell_bold),
            Paragraph("Benign conversations, ordinary profanity, complaints", table_cell_style),
            Paragraph("5,075", table_cell_center),
            Paragraph("1,087", table_cell_center),
            Paragraph("1,087", table_cell_center),
        ],
        [
            Paragraph("<b>Total Verified</b>", table_cell_bold),
            Paragraph("<b>Stratified Random Split (Seed = 42)</b>", table_cell_bold),
            Paragraph("<b>32,024 (70.0%)</b>", table_cell_center),
            Paragraph("<b>6,862 (15.0%)</b>", table_cell_center),
            Paragraph("<b>6,863 (15.0%)</b>", table_cell_center),
        ],
    ]
    split_table = Table(split_data, colWidths=[110, 270, 110, 110, 120])
    split_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8fafc")]),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
        ])
    )
    story.append(split_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: NLP Preprocessing Pipeline
    # =========================================================================
    story.append(Paragraph("<b>Modular NLP Preprocessing: Preserving Polarity & Nuance</b>", title_style))
    story.append(Spacer(1, 6))

    # Pipeline diagram flow in table
    pipe_steps = [
        [
            Paragraph("<b>Raw Text</b><br/>Social Posts & Tweets", table_header_style),
            Paragraph("<b>&rarr;</b>", table_header_style),
            Paragraph("<b>Entity Cleaning</b><br/>URLs & Mentions", table_header_style),
            Paragraph("<b>&rarr;</b>", table_header_style),
            Paragraph("<b>Emoji Translation</b><br/>😡 &rarr; angry_face", table_header_style),
            Paragraph("<b>&rarr;</b>", table_header_style),
            Paragraph("<b>Negation Stopwords</b><br/>Keep: not, no, never", table_header_style),
            Paragraph("<b>&rarr;</b>", table_header_style),
            Paragraph("<b>Lemmatization</b><br/>WordNet Base Root", table_header_style),
        ]
    ]
    pipe_table = Table(pipe_steps, colWidths=[110, 20, 110, 20, 120, 20, 130, 20, 110])
    pipe_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1e293b")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#0f172a")),
        ])
    )
    story.append(pipe_table)
    story.append(Spacer(1, 14))

    # Before / After Demonstration Box
    demo_data = [
        [
            Paragraph("<b>Before & After Preprocessing Demonstration (Safe Educational Sample):</b>", ParagraphStyle("H", parent=body_bold, textColor=colors.HexColor("#0369a1"))),
        ],
        [
            Paragraph(
                "<b>Raw Input:</b> <i>'Hey @alex! Check this: https://t.co/abc #TeamSpirit... You are definitely not qualified for this project 😡👎!! #epicfail'</i><br/>"
                "<b>Classical Vectorizer Output:</b> <code>hey check teamspirit definitely not qualified project angry_face thumbs_down epicfail</code><br/>"
                "<b>Transformer Pipeline Output:</b> <code>Hey [USER] ! Check this: [URL] TeamSpirit... You are definitely not qualified for this project angry_face thumbs_down !! epicfail</code>",
                body_style,
            )
        ]
    ]
    demo_table = Table(demo_data, colWidths=[PAGE_WIDTH - 72])
    demo_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#86efac")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(demo_table)
    story.append(Spacer(1, 12))

    # Trade-offs Comparison
    tradeoffs_data = [
        [
            Paragraph("<b>Preprocessing Operation</b>", table_header_style),
            Paragraph("<b>Standard Naive Approach</b>", table_header_style),
            Paragraph("<b>Risk / Harmful Effect</b>", table_header_style),
            Paragraph("<b>ShieldText Engineering Solution</b>", table_header_style),
        ],
        [
            Paragraph("<b>Stopword Removal</b>", table_cell_bold),
            Paragraph("Drop all words in NLTK default list", table_cell_style),
            Paragraph("Drops <code>not</code>, <code>no</code>, <code>never</code> &rarr; inverts sentence polarity!", table_cell_style),
            Paragraph("<b>Negation-Preserving Filter:</b> Retains polarity operators.", table_cell_style),
        ],
        [
            Paragraph("<b>Emoji Handling</b>", table_cell_bold),
            Paragraph("Delete non-ASCII characters", table_cell_style),
            Paragraph("Discards high-value emotional cues (😡, 🤮, 💀)", table_cell_style),
            Paragraph("<b>Semantic Demojizing:</b> Translates emojis to text tokens.", table_cell_style),
        ],
        [
            Paragraph("<b>Stemming vs. Lemma</b>", table_cell_bold),
            Paragraph("Porter Stemmer heuristic truncation", table_cell_style),
            Paragraph("Produces non-words (<code>commun</code>, <code>univers</code>)", table_cell_style),
            Paragraph("<b>WordNet Lemmatization:</b> Maps to valid dictionary lemmas.", table_cell_style),
        ],
        [
            Paragraph("<b>Punctuation in Transformers</b>", table_cell_bold),
            Paragraph("Strip all punctuation symbols", table_cell_style),
            Paragraph("Destroys sentence structure & syntactic cues for BERT", table_cell_style),
            Paragraph("<b>Model-Specific Branching:</b> Preserved for Transformers.", table_cell_style),
        ],
    ]
    trade_table = Table(tradeoffs_data, colWidths=[130, 160, 200, 230])
    trade_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ])
    )
    story.append(trade_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: Distributed Word Vectors (Word2Vec)
    # =========================================================================
    story.append(Paragraph("<b>Distributed Representations: Word2Vec (CBOW vs. Skip-Gram)</b>", title_style))
    story.append(Spacer(1, 6))

    w2v_cards = [
        [
            Paragraph(
                "<b>Word2Vec CBOW (Continuous Bag-of-Words)</b><br/><br/>"
                "&bull; <b>Objective:</b> Predicts center word <i>w<sub>t</sub></i> given context window.<br/>"
                "&bull; <b>Mathematical Formulation:</b><br/>"
                "&nbsp;&nbsp;<i>L</i> = &sum; log <i>P</i>(<i>w<sub>t</sub></i> | <i>w<sub>t-c</sub>, ..., w<sub>t+c</sub></i>)<br/>"
                "&bull; <b>Vocabulary:</b> 14,890 words (min_count=2, vector_size=100)<br/>"
                "&bull; <b>Training Time:</b> <b>1.4 seconds</b> (3.3x faster than Skip-Gram)<br/>"
                "&bull; <b>Test Accuracy:</b> <b>78.49%</b> (Macro F1: <b>0.7717</b>)<br/>"
                "&bull; <b>Behavior:</b> Smoothes over contexts; ideal for frequent syntax.",
                body_style,
            ),
            Paragraph(
                "<b>Word2Vec Skip-Gram (with Negative Sampling)</b><br/><br/>"
                "&bull; <b>Objective:</b> Predicts context words given center target <i>w<sub>t</sub></i>.<br/>"
                "&bull; <b>Mathematical Formulation:</b><br/>"
                "&nbsp;&nbsp;<i>L</i> = &sum; &sum; log <i>P</i>(<i>w<sub>t+j</sub></i> | <i>w<sub>t</sub></i>)<br/>"
                "&bull; <b>Vocabulary:</b> 14,890 words (min_count=2, vector_size=100)<br/>"
                "&bull; <b>Training Time:</b> <b>4.6 seconds</b><br/>"
                "&bull; <b>Test Accuracy:</b> <b>78.54%</b> (Macro F1: <b>0.7697</b>)<br/>"
                "&bull; <b>Behavior:</b> Dedicated gradient updates for rare slang and slurs.",
                body_style,
            ),
        ]
    ]
    w2v_table = Table(w2v_cards, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    w2v_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(w2v_table)
    story.append(Spacer(1, 14))

    # Semantic Similarities & Analogies
    exp_data = [
        [
            Paragraph("<b>Cosine Nearest Neighbors (Target: 'bully')</b><br/>"
                      "1. <code>harass</code> (0.71)&nbsp;&nbsp;2. <code>school</code> (0.68)&nbsp;&nbsp;3. <code>kid</code> (0.64)<br/>"
                      "4. <code>threat</code> (0.61)&nbsp;&nbsp;5. <code>loser</code> (0.59)", body_style),
            Paragraph("<b>Vector Analogy Arithmetic</b><br/>"
                      "&bull; <i>hate : attack :: love : ?</i> &rarr; <b>friend</b> (0.62)<br/>"
                      "&bull; <i>school : student :: college : ?</i> &rarr; <b>people</b> (0.58)", body_style),
            Paragraph("<b>2D Manifold Projection</b><br/>"
                      "&bull; <b>PCA:</b> Captures global lexical variance.<br/>"
                      "&bull; <b>t-SNE:</b> Forms dense localized clusters of targeted demographic slurs.", body_style),
        ]
    ]
    exp_table = Table(exp_data, colWidths=[(PAGE_WIDTH - 72) / 3] * 3)
    exp_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bfdbfe")),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(exp_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: Deep Recurrent Sequence Models
    # =========================================================================
    story.append(Paragraph("<b>Deep Sequence Modeling: PyTorch LSTM & BiLSTM</b>", title_style))
    story.append(Spacer(1, 6))

    lstm_info = [
        [
            Paragraph(
                "<b>Architecture Architecture & Gating</b><br/><br/>"
                "&bull; <b>Embedding Layer:</b> Initialized with Word2Vec weights (100-dim).<br/>"
                "&bull; <b>Recurrent Core:</b> 2 stacked LSTM layers (Hidden size = 128 per dir).<br/>"
                "&bull; <b>Regularization:</b> Dropout = 0.3 applied across recurrent and dense layers.<br/>"
                "&bull; <b>Gating Mechanics:</b> Forget gate <i>f<sub>t</sub></i>, input gate <i>i<sub>t</sub></i>, and output gate <i>o<sub>t</sub></i> prevent vanishing gradients.",
                body_style,
            ),
            Paragraph(
                "<b>Overcoming Pad Token Degradation</b><br/><br/>"
                "&bull; <i>The Problem:</i> Sequences zero-padded to length 80 cause standard last-hidden-state pooling to decay to zero over 60+ pad steps (&sim;17% accuracy).<br/>"
                "&bull; <i>The Engineering Fix:</i> <b>Masked Max-Pooling:</b><br/>"
                "&nbsp;&nbsp;<code>mask = (x != PAD_IDX).unsqueeze(-1)</code><br/>"
                "&nbsp;&nbsp;<code>pooled = torch.max(out.masked_fill(~mask, -1e9), dim=1)[0]</code><br/>"
                "&bull; <i>Result:</i> Immediately boosted validation accuracy from 17.5% to <b>85.38%</b>!",
                body_style,
            ),
        ]
    ]
    lstm_table = Table(lstm_info, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    lstm_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(lstm_table)
    story.append(Spacer(1, 14))

    # LSTM vs BiLSTM Comparison Table
    bilstm_comp = [
        [
            Paragraph("<b>Architecture Metric</b>", table_header_style),
            Paragraph("<b>Unidirectional LSTM</b>", table_header_style),
            Paragraph("<b>Bidirectional LSTM (BiLSTM)</b>", table_header_style),
            Paragraph("<b>Academic Takeaway</b>", table_header_style),
        ],
        [
            Paragraph("<b>Sequential Context</b>", table_cell_bold),
            Paragraph("Past tokens only (left &rarr; right)", table_cell_style),
            Paragraph("<b>Past and Future tokens</b> (forward + backward)", table_cell_bold),
            Paragraph("Disambiguates words based on trailing offensive insults.", table_cell_style),
        ],
        [
            Paragraph("<b>Hidden Dimension</b>", table_cell_bold),
            Paragraph("128 units", table_cell_style),
            Paragraph("256 units (128 forward + 128 backward)", table_cell_style),
            Paragraph("Doubles state capacity without parameter explosion.", table_cell_style),
        ],
        [
            Paragraph("<b>Test Accuracy</b>", table_cell_bold),
            Paragraph("84.53%", table_cell_center),
            Paragraph("<b>84.96% (Top Benchmark)</b>", table_cell_center),
            Paragraph("<b>BiLSTM achieves the highest overall accuracy.</b>", table_cell_style),
        ],
        [
            Paragraph("<b>Macro F1-Score</b>", table_cell_bold),
            Paragraph("0.8349", table_cell_center),
            Paragraph("<b>0.8404 (Top Benchmark)</b>", table_cell_center),
            Paragraph("Superior balance across all 6 targeted classes.", table_cell_style),
        ],
    ]
    bilstm_table = Table(bilstm_comp, colWidths=[130, 160, 210, 220])
    bilstm_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ])
    )
    story.append(bilstm_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 8: Additive Self-Attention BiLSTM
    # =========================================================================
    story.append(Paragraph("<b>Attention Mechanism: Additive Self-Attention BiLSTM</b>", title_style))
    story.append(Spacer(1, 6))

    attn_flow = [
        [
            Paragraph(
                "<b>Mathematical Formulation of Additive Self-Attention</b><br/><br/>"
                "1. <b>Hidden State Projection:</b><br/>"
                "&nbsp;&nbsp;<i>u<sub>t</sub></i> = tanh(<i>W<sub>a</sub> h<sub>t</sub> + b<sub>a</sub></i>) &isin; &Ropf;<sup>64</sup><br/><br/>"
                "2. <b>Alignment Score Dot Product:</b><br/>"
                "&nbsp;&nbsp;score<sub><i>t</i></sub> = <i>u<sub>t</sub><sup>T</sup> v<sub>a</sub></i><br/><br/>"
                "3. <b>Padding Masking:</b><br/>"
                "&nbsp;&nbsp;score<sub><i>t</i></sub> = -10<sup>9</sup> for <i>x<sub>t</sub> = PAD</i><br/><br/>"
                "4. <b>Normalized Attention Weights:</b><br/>"
                "&nbsp;&nbsp;&alpha;<sub><i>t</i></sub> = exp(score<sub><i>t</i></sub>) / &sum; exp(score<sub><i>k</i></sub>)<br/><br/>"
                "5. <b>Context Vector Pooling:</b><br/>"
                "&nbsp;&nbsp;<i>c</i> = &sum; &alpha;<sub><i>t</i></sub> <i>h<sub>t</sub></i> &isin; &Ropf;<sup>256</sup>",
                body_style,
            ),
            Paragraph(
                "<b>Attention Heatmap & Token Explainability</b><br/><br/>"
                "&bull; <b>Test Accuracy:</b> <b>84.10%</b> (Macro F1: <b>0.8330</b>).<br/>"
                "&bull; <b>Dynamic Weights:</b> Returns token attention array &alpha; directly to the UI.<br/>"
                "&bull; <b>Live Visual Example:</b><br/>"
                "&nbsp;&nbsp;Input: <i>'You are a dumb idiot loser'</i><br/>"
                "&nbsp;&nbsp;&bull; <code>dumb</code>: &alpha; = <b>0.3847</b><br/>"
                "&nbsp;&nbsp;&bull; <code>idiot</code>: &alpha; = <b>0.4350</b> (Top Attended)<br/>"
                "&nbsp;&nbsp;&bull; <code>loser</code>: &alpha; = <b>0.1803</b><br/><br/>"
                "&bull; <b>Academic Caveat:</b> Attention weights illustrate internal network pooling dynamics, but do <b>not</b> constitute scientific proof of human subjective intent.",
                body_style,
            ),
        ]
    ]
    attn_table = Table(attn_flow, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    attn_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(attn_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 9: Transformer Encoders (DistilBERT)
    # =========================================================================
    story.append(Paragraph("<b>Transformer Encoders: DistilBERT Fine-Tuning</b>", title_style))
    story.append(Spacer(1, 6))

    bert_cards = [
        [
            Paragraph(
                "<b>Why DistilBERT? (Sanh et al., 2019)</b><br/><br/>"
                "&bull; <code>bert-base-uncased</code> has 110M parameters; memory intensive for student laptops.<br/>"
                "&bull; DistilBERT reduces layers from 12 &rarr; 6 via student-teacher distillation.<br/>"
                "&bull; <b>Retains 97%</b> of full BERT's language understanding capability.<br/>"
                "&bull; <b>40% smaller</b> and executes inference <b>60% faster</b>.",
                body_style,
            ),
            Paragraph(
                "<b>Subword WordPiece Tokenization</b><br/><br/>"
                "&bull; Vocabulary: 30,522 subword tokens.<br/>"
                "&bull; Slang and deliberate typos split into constituent roots:<br/>"
                "&nbsp;&nbsp;<i>'cyberbully'</i> &rarr; <code>['cyber', '##bul', '##ly']</code><br/>"
                "&bull; Eliminates Out-of-Vocabulary (OOV) misses completely.<br/>"
                "&bull; Preserves original punctuation, casing, and sentence structure.",
                body_style,
            ),
        ],
        [
            Paragraph(
                "<b>Fine-Tuning Hyperparameters</b><br/><br/>"
                "&bull; <b>Optimizer:</b> AdamW (weight decay = 0.01)<br/>"
                "&bull; <b>Learning Rate:</b> 3 &times; 10<sup>-5</sup> with linear warmup over initial 10% steps.<br/>"
                "&bull; <b>Batch Size:</b> 32 &bull; Max Length = 128 subwords.<br/>"
                "&bull; <b>Loss Function:</b> Multi-class Cross-Entropy on [CLS] pooler output.",
                body_style,
            ),
            Paragraph(
                "<b>Empirical Transformer Results</b><br/><br/>"
                "&bull; <b>Test Accuracy:</b> <b>78.20%</b><br/>"
                "&bull; <b>Macro F1:</b> <b>0.7218</b> &bull; <b>Weighted F1:</b> <b>0.7634</b><br/>"
                "&bull; <b>Inference:</b> Seamlessly integrated into web application.<br/>"
                "&bull; Captures subtle syntactic sarcasm and punctuation patterns effectively.",
                body_style,
            ),
        ],
    ]
    bert_table = Table(bert_cards, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    bert_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 10),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(bert_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 10: Empirical Results & Benchmark Leaderboard
    # =========================================================================
    story.append(Paragraph("<b>Empirical Evaluation Leaderboard (N = 6,863 Test Samples)</b>", title_style))
    story.append(Spacer(1, 4))

    leaderboard_data = [
        [
            Paragraph("<b>Model Architecture</b>", table_header_style),
            Paragraph("<b>Model Family</b>", table_header_style),
            Paragraph("<b>Accuracy</b>", table_header_style),
            Paragraph("<b>Precision</b>", table_header_style),
            Paragraph("<b>Recall</b>", table_header_style),
            Paragraph("<b>Macro F1</b>", table_header_style),
            Paragraph("<b>Weighted F1</b>", table_header_style),
        ],
        [
            Paragraph("<b>Bidirectional LSTM (BiLSTM)</b>", table_cell_bold),
            Paragraph("Deep Recurrent (2-dir)", table_cell_style),
            Paragraph("<b>84.96%</b>", table_cell_center),
            Paragraph("84.81%", table_cell_center),
            Paragraph("84.58%", table_cell_center),
            Paragraph("<b>0.8404</b>", table_cell_center),
            Paragraph("<b>0.8436</b>", table_cell_center),
        ],
        [
            Paragraph("<b>LSTM (Unidirectional)</b>", table_cell_bold),
            Paragraph("Deep Recurrent (1-dir)", table_cell_style),
            Paragraph("84.53%", table_cell_center),
            Paragraph("84.42%", table_cell_center),
            Paragraph("84.11%", table_cell_center),
            Paragraph("0.8349", table_cell_center),
            Paragraph("0.8398", table_cell_center),
        ],
        [
            Paragraph("<b>Attention-Based BiLSTM</b>", table_cell_bold),
            Paragraph("Attention Architecture", table_cell_style),
            Paragraph("84.10%", table_cell_center),
            Paragraph("83.95%", table_cell_center),
            Paragraph("83.74%", table_cell_center),
            Paragraph("0.8330", table_cell_center),
            Paragraph("0.8365", table_cell_center),
        ],
        [
            Paragraph("<b>Logistic Regression (TF-IDF)</b>", table_cell_bold),
            Paragraph("Traditional Linear Baseline", table_cell_style),
            Paragraph("84.00%", table_cell_center),
            Paragraph("83.75%", table_cell_center),
            Paragraph("83.63%", table_cell_center),
            Paragraph("0.8310", table_cell_center),
            Paragraph("0.8354", table_cell_center),
        ],
        [
            Paragraph("<b>Linear SVM (TF-IDF)</b>", table_cell_bold),
            Paragraph("Traditional Linear Baseline", table_cell_style),
            Paragraph("83.46%", table_cell_center),
            Paragraph("83.21%", table_cell_center),
            Paragraph("83.05%", table_cell_center),
            Paragraph("0.8242", table_cell_center),
            Paragraph("0.8291", table_cell_center),
        ],
        [
            Paragraph("<b>Word2Vec Skip-Gram + Classifier</b>", table_cell_bold),
            Paragraph("Continuous Word Vectors", table_cell_style),
            Paragraph("78.54%", table_cell_center),
            Paragraph("77.82%", table_cell_center),
            Paragraph("77.45%", table_cell_center),
            Paragraph("0.7697", table_cell_center),
            Paragraph("0.7788", table_cell_center),
        ],
        [
            Paragraph("<b>Word2Vec CBOW + Classifier</b>", table_cell_bold),
            Paragraph("Continuous Word Vectors", table_cell_style),
            Paragraph("78.49%", table_cell_center),
            Paragraph("78.01%", table_cell_center),
            Paragraph("77.58%", table_cell_center),
            Paragraph("0.7717", table_cell_center),
            Paragraph("0.7792", table_cell_center),
        ],
        [
            Paragraph("<b>Fine-Tuned DistilBERT</b>", table_cell_bold),
            Paragraph("Pretrained Transformer", table_cell_style),
            Paragraph("78.20%", table_cell_center),
            Paragraph("78.10%", table_cell_center),
            Paragraph("74.30%", table_cell_center),
            Paragraph("0.7218", table_cell_center),
            Paragraph("0.7634", table_cell_center),
        ],
    ]
    lead_table = Table(leaderboard_data, colWidths=[180, 140, 80, 80, 80, 80, 80])
    lead_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 4.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#f0fdf4")),  # Highlight top model
        ])
    )
    story.append(lead_table)
    story.append(Spacer(1, 10))

    # Insights summary
    insight_p = Paragraph(
        "<b>Key Experimental Observations:</b><br/>"
        "1. <b>BiLSTM is the Top Performer:</b> Incorporating bidirectional context captures trailing insults, leading all models at <b>84.96% accuracy</b>.<br/>"
        "2. <b>Formidable TF-IDF Baseline:</b> Logistic Regression with n-grams achieves <b>84.00%</b> in just 2.1 seconds of training.<br/>"
        "3. <b>Attention Transparency:</b> Attention-BiLSTM provides <b>84.10% accuracy</b> while extracting actionable token attention heatmaps.",
        body_style,
    )
    story.append(insight_p)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 11: Full-Stack Web Application Architecture
    # =========================================================================
    story.append(Paragraph("<b>Demonstration: ShieldText Full-Stack Application</b>", title_style))
    story.append(Spacer(1, 6))

    app_cards = [
        [
            Paragraph(
                "<b>FastAPI Asynchronous Backend</b><br/><br/>"
                "&bull; <b>High-Throughput ASGI:</b> Built on Uvicorn + Starlette.<br/>"
                "&bull; <b>Endpoints:</b><br/>"
                "&nbsp;&nbsp;&bull; <code>/api/predict</code>: Real-time single text classification.<br/>"
                "&nbsp;&nbsp;&bull; <code>/api/batch</code>: Bulk CSV upload with auto-column detect.<br/>"
                "&nbsp;&nbsp;&bull; <code>/api/metrics</code>: Empirical telemetry & confusion matrices.<br/>"
                "&nbsp;&nbsp;&bull; <code>/api/visualizations</code>: PCA/t-SNE coordinates & demo.<br/>"
                "&nbsp;&nbsp;&bull; <code>/api/info</code>: CO1-CO6 mappings & ethical safeguards.<br/>"
                "&bull; <b>Pydantic Type Validation:</b> Strict schema enforcement.",
                body_style,
            ),
            Paragraph(
                "<b>React.js Interactive User Interface</b><br/><br/>"
                "&bull; <b>Modern Styling:</b> Tailwind CSS with responsive layout.<br/>"
                "&bull; <b>Six Core Pages:</b><br/>"
                "&nbsp;&nbsp;1. <b>Home Dashboard:</b> Metrics, cards, and leaderboard.<br/>"
                "&nbsp;&nbsp;2. <b>Live Detection:</b> Model selector, probability bars, heatmaps.<br/>"
                "&nbsp;&nbsp;3. <b>Batch Analysis:</b> CSV upload & annotated CSV export.<br/>"
                "&nbsp;&nbsp;4. <b>Model Benchmark:</b> Recharts bar plots & 6x6 confusion matrix.<br/>"
                "&nbsp;&nbsp;5. <b>NLP Visualizations:</b> 2D scatter plots & word analogies.<br/>"
                "&nbsp;&nbsp;6. <b>Project Information:</b> Course outcome documentation.",
                body_style,
            ),
        ]
    ]
    app_table = Table(app_cards, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    app_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(app_table)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 12: Responsible AI, Limitations & Conclusion
    # =========================================================================
    story.append(Paragraph("<b>Responsible AI Safeguards, Limitations & Conclusion</b>", title_style))
    story.append(Spacer(1, 6))

    resp_cards = [
        [
            Paragraph(
                "<b>Responsible AI & Moderation Safeguards</b><br/><br/>"
                "&bull; <b>Decision Support, Not Automated Sanction:</b> Predictions assist human moderators; automated account suspensions or bans are prohibited.<br/>"
                "&bull; <b>Ephemeral RAM Processing:</b> Submitted text and uploaded CSVs are processed in-memory and <b>never stored to disk</b>.<br/>"
                "&bull; <b>Protecting Benign Vulgarity:</b> Multi-class labeling separates coarse language (<code>not_cyberbullying</code>) from identity harassment.",
                body_style,
            ),
            Paragraph(
                "<b>Known System Limitations</b><br/><br/>"
                "&bull; <b>Sarcasm and Parody:</b> Subtle hostility without explicit slurs can evade detection.<br/>"
                "&bull; <b>In-Group Reclaimed Slurs:</b> Colloquial expressions (e.g., within hip-hop or LGBTQ+ discourse) may trigger false positives if context is missing.<br/>"
                "&bull; <b>Domain Shift:</b> Twitter post brevity does not directly transfer to long-form Reddit threads.",
                body_style,
            ),
        ],
        [
            Paragraph(
                "<b>Future Scope & Enhancements</b><br/><br/>"
                "&bull; <b>Conversational Thread Modeling:</b> Ingesting parent-child tweet reply chains to track escalating harassment.<br/>"
                "&bull; <b>Multilingual Knowledge Distillation:</b> Deploying XLM-RoBERTa for cross-lingual zero-shot classification.<br/>"
                "&bull; <b>Adversarial Robustness:</b> Hardening against leetspeak misspellings (<code>b*lly</code>, <code>h8</code>).",
                body_style,
            ),
            Paragraph(
                "<b>Project Conclusion & Defense Summary</b><br/><br/>"
                "&bull; Successfully built a comprehensive, working NLP system covering CO1 through CO6.<br/>"
                "&bull; 8 models trained on 45,749 tweets; BiLSTM achieves <b>84.96% accuracy</b>.<br/>"
                "&bull; 13/13 automated unit tests passing; full-stack web application running.<br/>"
                "&bull; <b>Status: Completed, Verified, and Academically Defensible.</b>",
                body_style,
            ),
        ],
    ]
    resp_table = Table(resp_cards, colWidths=[(PAGE_WIDTH - 72) / 2] * 2)
    resp_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 10),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(resp_table)

    # Build the document
    doc.build(story, canvasmaker=PresentationCanvas)
    print(f"Presentation PDF successfully generated at: {output_path}")
    return output_path


if __name__ == "__main__":
    build_presentation_pdf()

