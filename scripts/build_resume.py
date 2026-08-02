from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "cv" / "Rui_Bian_AI_Data_Software_Engineer.pdf"

INK = colors.HexColor("#173238")
BODY = colors.HexColor("#33484D")
MUTED = colors.HexColor("#607176")
ACCENT = colors.HexColor("#A85C00")
RULE = colors.HexColor("#D7DEE0")
PAPER = colors.white


def page_footer(canvas, doc):
    canvas.saveState()
    width, _ = LETTER
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.45)
    canvas.line(doc.leftMargin, 0.46 * inch, width - doc.rightMargin, 0.46 * inch)
    canvas.setFont("Helvetica", 7.4)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.28 * inch, "Rui Bian | AI & Data Software Engineer")
    canvas.drawRightString(width - doc.rightMargin, 0.28 * inch, f"Page {doc.page}")
    canvas.restoreState()


class ResumeDocTemplate(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(
            filename,
            pagesize=LETTER,
            leftMargin=0.56 * inch,
            rightMargin=0.56 * inch,
            topMargin=0.46 * inch,
            bottomMargin=0.58 * inch,
            title="Rui Bian - AI & Data Software Engineer Resume",
            author="Rui Bian",
            subject="AI, data platform, backend, and production ML engineering",
        )
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="resume",
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )
        self.addPageTemplates(PageTemplate(id="resume", frames=[frame], onPage=page_footer))


styles = getSampleStyleSheet()

NAME = ParagraphStyle(
    "Name",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=24,
    textColor=INK,
    alignment=TA_CENTER,
    spaceAfter=2,
)

TITLE = ParagraphStyle(
    "Title",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=10.2,
    leading=12,
    textColor=ACCENT,
    alignment=TA_CENTER,
    spaceAfter=3,
)

CONTACT = ParagraphStyle(
    "Contact",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.8,
    leading=10,
    textColor=MUTED,
    alignment=TA_CENTER,
    spaceAfter=7,
)

SECTION = ParagraphStyle(
    "Section",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8.7,
    leading=10.3,
    textColor=INK,
    spaceBefore=6,
    spaceAfter=4,
    borderColor=ACCENT,
    borderWidth=0,
    borderPadding=0,
)

SUMMARY = ParagraphStyle(
    "Summary",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.6,
    leading=11.8,
    textColor=BODY,
    spaceAfter=4,
)

SKILL_LABEL = ParagraphStyle(
    "SkillLabel",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=7.9,
    leading=10.3,
    textColor=INK,
)

SKILL_BODY = ParagraphStyle(
    "SkillBody",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.9,
    leading=10.3,
    textColor=BODY,
)

ROLE = ParagraphStyle(
    "Role",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9.3,
    leading=11.2,
    textColor=INK,
)

ORG = ParagraphStyle(
    "Org",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8.4,
    leading=10.3,
    textColor=ACCENT,
)

DATE = ParagraphStyle(
    "Date",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=7.9,
    leading=10.3,
    textColor=MUTED,
    alignment=TA_LEFT,
)

BULLET = ParagraphStyle(
    "Bullet",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.0,
    leading=10.8,
    textColor=BODY,
    leftIndent=10,
    firstLineIndent=-7,
    spaceAfter=2,
)

PROJECT = ParagraphStyle(
    "Project",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8.7,
    leading=10.8,
    textColor=INK,
    spaceAfter=1,
)

SMALL = ParagraphStyle(
    "Small",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.9,
    leading=10.6,
    textColor=BODY,
    spaceAfter=3,
)


def section(title):
    heading = Paragraph(title.upper(), SECTION)
    rule = Table([[heading, ""]], colWidths=[2.78 * inch, 4.10 * inch], rowHeights=[0.18 * inch])
    rule.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (1, 0), (1, 0), 0.65, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return rule


def role_header(role, organization, dates):
    table = Table(
        [[Paragraph(role, ROLE), Paragraph(dates, DATE)], [Paragraph(organization, ORG), ""]],
        colWidths=[5.48 * inch, 1.4 * inch],
    )
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("SPAN", (0, 1), (1, 1)),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return table


def bullets(items):
    return [Paragraph(f"- {item}", BULLET) for item in items]


def job(role, organization, dates, items):
    return KeepTogether([
        role_header(role, organization, dates),
        Spacer(1, 2),
        *bullets(items),
        Spacer(1, 3),
    ])


def project(name, stack, description):
    return KeepTogether([
        Paragraph(f"{name} | <font color='#A85C00'>{stack}</font>", PROJECT),
        Paragraph(description, SMALL),
        Spacer(1, 2),
    ])


def build_story():
    story = [
        Paragraph("Rui Bian, Ph.D.", NAME),
        Paragraph("FOUNDING AI & DATA ENGINEER | AI, DATA PLATFORMS, BACKEND SOFTWARE", TITLE),
        Paragraph(
            "Los Angeles, CA | (302) 415-5277 | "
            "<link href='mailto:bianrui0315@gmail.com' color='#607176'>bianrui0315@gmail.com</link> | "
            "<link href='https://bianrui.net' color='#607176'>bianrui.net</link> | "
            "<link href='https://www.linkedin.com/in/bianrui0315/' color='#607176'>LinkedIn</link> | "
            "<link href='https://github.com/bianrui0315' color='#607176'>GitHub</link>",
            CONTACT,
        ),
        section("Professional Summary"),
        Paragraph(
            "Founding AI and Data Engineer with 14+ years across production software, data platforms, applied AI/ML, and doctoral systems research. Builds reliable AI-powered products end to end: backend APIs, data ingestion, workflow orchestration, model operationalization, observability, and operator experiences. Previously owned 32 production systems serving 30+ school districts, with an emphasis on fault isolation, idempotent recovery, explainable automation, and privacy by architecture.",
            SUMMARY,
        ),
        section("Technical Skills"),
    ]

    skill_rows = [
        ("AI & ML Systems", "LangGraph, local LLMs, OpenAI API, Gemini API, scikit-learn, XGBoost, SHAP, MLflow"),
        ("Backend & Software", "Python, Go, TypeScript, FastAPI, Flask, REST APIs, Pydantic, Docker, pytest, CI/CD"),
        ("Data Platforms", "SQL Server, PostgreSQL, MongoDB, SQLAlchemy, pandas, NumPy, Apache Spark, Microsoft Fabric, ETL"),
        ("Automation & Analytics", "Playwright, Selenium, asyncio, Power BI, DAX, Streamlit, Plotly, Cloudflare Workers, AWS, Azure"),
    ]
    skills = Table(
        [[Paragraph(label, SKILL_LABEL), Paragraph(value, SKILL_BODY)] for label, value in skill_rows],
        colWidths=[1.25 * inch, 5.63 * inch],
    )
    skills.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.extend([skills, section("Experience")])

    story.append(job(
        "Founding AI and Data Engineer",
        "Big Shot Pictures",
        "Aug 2026 - Present",
        [
            "Lead 0-to-1 design and implementation of core AI and data infrastructure for data-driven creative and business operations.",
            "Build scalable pipelines, storage, analytics workflows, AI-driven features, and agentic frameworks for production workflows and internal capabilities.",
            "Partner with cross-functional leadership to translate business vision into robust, enterprise-grade engineering strategy and delivery.",
        ],
    ))

    story.append(job(
        "Lead Data Scientist",
        "Expatiate Communications",
        "Dec 2022 - Jun 2026",
        [
            "Architected, shipped, and owned 32 production AI, data, and automation systems serving 30+ California school districts; reduced new-district onboarding from weeks of engineering to hours of configuration.",
            "Built a LangGraph orchestration platform with conditional routing, parallel fan-out, local LLM diagnostics, and node-level fault isolation; reduced recurring pipeline runtime by 75-90 percent.",
            "Operationalized six-domain predictive decision support with per-district model selection, explainability, idempotent batch scoring, and graceful LLM provider fallback across 20+ districts.",
            "Automated compliance workflows across 21 districts using SQL, MFA-aware Playwright, PDF parsing, auditable deadline rules, and Power BI; supported zero missed IEP deadlines after deployment.",
            "Delivered 150+ dashboards and operator-first automation, including weekly reporting across 18 school sites, so non-technical teams could run recurring workflows without engineering support.",
        ],
    ))

    story.append(job(
        "Ph.D. Researcher - Computer Engineering",
        "University of Delaware",
        "2015 - 2022",
        [
            "Built Python and AWS measurement systems processing millions of internet probes for proxy ecosystems, traffic integrity, and global routing analysis.",
            "Analyzed 436,000+ open proxies and developed detection and classification methods for transparent proxies and anycast routing anomalies.",
            "Published at IEEE INFOCOM, Computer Networks, and ACM SIGCOMM CCR; served as a reviewer and teaching assistant in networking and cybersecurity.",
        ],
    ))

    story.extend([
        section("Selected Platform Evidence"),
        project(
            "AI Data Workflow Orchestration Platform",
            "LangGraph, Ollama, Python",
            "Gate-node routing, four-stage parallel execution, local failure diagnosis, audit logs, and rerun-safe boundaries across 30+ district workflows and 100K+ records per run.",
        ),
        project(
            "Concurrent SIS Data Ingestion Service",
            "Go, MongoDB, REST",
            "Goroutine fan-out across 12 dataset types with per-school timeout/authentication isolation, startup validation, health checks, dynamic school discovery, and idempotent reloads.",
        ),
        PageBreak(),
        section("Selected API & Product Work"),
        project(
            "Adaptive Creative Analysis API",
            "FastAPI, Pydantic, SQLAlchemy, Docker",
            "Schema-validated creative analysis with explainable model-tier routing, bounded retries, deterministic fallback, persisted lifecycle state, provider metadata, health checks, and automated tests.",
        ),
        project(
            "California School Explorer",
            "React, TypeScript, Python, PostgreSQL, Cloudflare",
            "Open-source public-data product with 9,946 school profiles, 3.9M+ canonical facts, subgroup and context-aware comparison, source notes, suppression handling, and reproducible processing.",
        ),
        project(
            "Free Image Tools",
            "JavaScript, Canvas API, Cloudflare",
            "Free, open-source, privacy-first browser utilities for compression, conversion, resizing, PDF workflows, metadata removal, batch processing, and optional AI alt text.",
        ),
        section("Education"),
        role_header("Ph.D. in Computer Engineering", "University of Delaware | GPA 3.96/4.0", "2015 - 2022"),
        Spacer(1, 4),
        role_header("M.S. in Engineering", "University of Science and Technology of China", "2012 - 2015"),
        Spacer(1, 4),
        role_header("B.S. in Engineering", "University of Science and Technology of China", "2008 - 2012"),
        Spacer(1, 2),
        section("Certifications & Continuous Learning"),
        Paragraph(
            "DataCamp (2026, valid through 2028): AI Engineer for Developers Associate; AI Engineer for Data Scientists Associate; Data Scientist Associate; Data Engineer Associate.",
            SMALL,
        ),
        Paragraph("Google Cybersecurity Professional Certificate, Coursera, 2023.", SMALL),
        section("Selected Publications & Patent"),
        *bullets([
            '"Silent Observers Make a Difference: A Large-scale Analysis of Transparent Proxies on the Internet." IEEE INFOCOM, 2024.',
            '"Shining a Light on Dark Places: A Comprehensive Analysis of Open Proxy Ecosystem." Computer Networks, 2022.',
            '"Towards Passive Analysis of Anycast in Global Routing: Unintended Impact of Remote Peering." ACM SIGCOMM CCR, 2019.',
            'Patent CN104614936B: "Manufacturing Method of Micro Lens."',
        ]),
        section("Additional Experience & Recognition"),
        *bullets([
            "Master research in engineering at USTC and a research internship at the Changchun Institute of Optics, Fine Mechanics and Physics, Chinese Academy of Sciences.",
            "SANS CyberStart Scholarship - ranked 44th of 3,935 participants (top 1 percent).",
            "Reviewer and TPC service for IEEE INFOCOM, IEEE/IFIP DSN, IEEE TNSE, Computer Networks, and related systems venues.",
        ]),
    ])
    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = ResumeDocTemplate(str(OUTPUT))
    document.build(build_story())
    print(OUTPUT)


if __name__ == "__main__":
    main()
