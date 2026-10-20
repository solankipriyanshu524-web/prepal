import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

def generate_scorecard_pdf(data: dict) -> io.BytesIO:
    """
    Generates a professional, sleek FAANG-style interview scorecard PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    scorecard = data.get("scorecard", {})
    role = data.get("candidateRole", "Software Engineer")
    level = data.get("level", "Mid-Level")
    problem = data.get("problem", "Two Sum II")
    date_str = datetime.datetime.now().strftime("%B %d, %Y - %I:%M %p")
    code = data.get("code", "")

    styles = getSampleStyleSheet()
    
    # Custom Brand Colors
    BRAND_DARK = colors.HexColor("#0f172a")       # Slate 900
    BRAND_PRIMARY = colors.HexColor("#4f46e5")    # Indigo 600
    BRAND_ACCENT = colors.HexColor("#06b6d4")     # Cyan 500
    TEXT_MUTED = colors.HexColor("#64748b")       # Slate 500
    BG_LIGHT = colors.HexColor("#f8fafc")         # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0")     # Slate 200

    # Verdict Color
    verdict = scorecard.get("verdict", "Hire")
    if "strong" in verdict.lower():
        verdict_color = colors.HexColor("#059669") # Emerald 600
        verdict_bg = colors.HexColor("#d1fae5")
    elif "hire" in verdict.lower():
        verdict_color = colors.HexColor("#4338ca") # Indigo 700
        verdict_bg = colors.HexColor("#e0e7ff")
    else:
        verdict_color = colors.HexColor("#d97706") # Amber 600
        verdict_bg = colors.HexColor("#fef3c7")

    # Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=BRAND_DARK
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_MUTED
    )

    section_heading = ParagraphStyle(
        'SecHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=BRAND_PRIMARY,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # 1. Header Banner Table
    header_left = [
        Paragraph("<b>PREPPAL</b> | AI Technical Interview Assessment", title_style),
        Paragraph(f"Candidate Target: <b>{level} {role}</b> &bull; Problem: <b>{problem}</b>", subtitle_style),
        Paragraph(f"Evaluation Date: {date_str}", subtitle_style)
    ]
    
    overall_score = scorecard.get("overallScore", 8.5)
    header_right = [
        Paragraph(f"<font size='8' color='#64748b'>OVERALL RATING</font><br/><b><font size='22' color='#4f46e5'>{overall_score}</font></b> <font size='10' color='#94a3b8'>/ 10</font>", ParagraphStyle('ScoreNum', alignment=2)),
        Paragraph(f"<b><font color='{verdict_color.hexval()}'>{verdict.upper()}</font></b>", ParagraphStyle('VerdictText', alignment=2, spaceBefore=4))
    ]

    header_table = Table([[header_left, header_right]], colWidths=[380, 160])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_PRIMARY, spaceBefore=4, spaceAfter=12))

    # 2. Executive Summary / Bar Raiser Feedback
    feedback = scorecard.get("summary") or scorecard.get("feedback") or "Candidate demonstrated structured algorithmic thinking with clean two-pointer navigation and clear reasoning."
    story.append(Paragraph("<b>Bar Raiser Evaluation Summary</b>", section_heading))
    story.append(Paragraph(feedback, body_style))
    story.append(Spacer(1, 12))

    # 3. 4-Dimension Competency Scorecard Table
    story.append(Paragraph("<b>Competency Breakdown (FAANG Bar Raiser Standard)</b>", section_heading))
    metrics = scorecard.get("metrics", {})
    tech_acc = metrics.get("technicalAccuracy", 8)
    code_qual = metrics.get("codeQuality", 8.5)
    prob_solv = metrics.get("problemSolving", 9)
    comm = metrics.get("communication", 8)

    metric_data = [
        [
            Paragraph("<b>Technical Accuracy</b><br/><font size='7' color='#64748b'>Correctness, boundary safety, Big-O</font>", body_style),
            Paragraph(f"<b>{tech_acc} / 10</b>", ParagraphStyle('m1', fontName='Helvetica-Bold', alignment=1)),
            Paragraph("<b>Code Quality</b><br/><font size='7' color='#64748b'>Readability, idiomatic naming, structure</font>", body_style),
            Paragraph(f"<b>{code_qual} / 10</b>", ParagraphStyle('m2', fontName='Helvetica-Bold', alignment=1))
        ],
        [
            Paragraph("<b>Problem Solving</b><br/><font size='7' color='#64748b'>Pattern recognition, optimization</font>", body_style),
            Paragraph(f"<b>{prob_solv} / 10</b>", ParagraphStyle('m3', fontName='Helvetica-Bold', alignment=1)),
            Paragraph("<b>Communication</b><br/><font size='7' color='#64748b'>Thinking aloud, proactive edge cases</font>", body_style),
            Paragraph(f"<b>{comm} / 10</b>", ParagraphStyle('m4', fontName='Helvetica-Bold', alignment=1))
        ]
    ]

    metric_table = Table(metric_data, colWidths=[200, 70, 200, 70])
    metric_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 12))

    # 4. Big-O Algorithmic Analysis
    time_comp = scorecard.get("estimatedComplexity", {}).get("time", "O(n)")
    space_comp = scorecard.get("estimatedComplexity", {}).get("space", "O(1)")

    story.append(Paragraph("<b>Algorithmic Complexity Analysis</b>", section_heading))
    complexity_data = [
        [
            Paragraph(f"<b>Estimated Time Complexity:</b> <font color='#4f46e5'><b>{time_comp}</b></font>", body_style),
            Paragraph(f"<b>Estimated Space Complexity:</b> <font color='#06b6d4'><b>{space_comp}</b></font>", body_style)
        ]
    ]
    comp_table = Table(complexity_data, colWidths=[270, 270])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 12))

    # 5. Strengths & Improvements in 2 Columns
    strengths = scorecard.get("strengths", ["Clear explanation of two-pointer concept", "Verified array boundaries", "Clean time complexity analysis"])
    improvements = scorecard.get("improvements", ["Explicitly handle duplicate elements in input", "Structure code into reusable classes for production"])

    strength_paras = [Paragraph(f"&bull; {s}", body_style) for s in strengths]
    improvement_paras = [Paragraph(f"&bull; {imp}", body_style) for imp in improvements]

    feedback_grid = [
        [Paragraph("<b>Key Strengths</b>", ParagraphStyle('StHead', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#059669"))),
         Paragraph("<b>High-Impact Improvements</b>", ParagraphStyle('ImpH', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#d97706")))],
        [strength_paras, improvement_paras]
    ]
    grid_table = Table(feedback_grid, colWidths=[270, 270])
    grid_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(grid_table)
    story.append(Spacer(1, 14))

    # 6. Candidate Code Snapshot (if provided)
    if code and code.strip():
        story.append(Paragraph("<b>Submitted Code Snapshot</b>", section_heading))
        # Limit lines if very long
        code_lines = code.strip().split("\n")[:25]
        code_preview = "<br/>".join([line.replace(" ", "&nbsp;").replace("<", "&lt;").replace(">", "&gt;") for line in code_lines])
        
        code_table = Table([[Paragraph(code_preview, code_style)]], colWidths=[540])
        code_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(code_table)

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
