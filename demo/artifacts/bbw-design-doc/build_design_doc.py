from __future__ import annotations

import html
import os
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "BBW_Product_Design_Doc.docx"

SCREENSHOTS = [
    ("01-start-page.png", "Start Page", "Public entry page remains intentionally simple: brand, login/register, Gemini-like chat entry, and live biotech business news below the chat bar."),
    ("02-company-info.png", "Company Info Dashboard", "Logged-in default workspace focused on founder-operating signals: runway, lead asset, capital need, milestones, checklist, stage map, and risk signals. Biotech news lives persistently in the sidebar."),
    ("03-working-session-new-chat.png", "Working Session - New Chat", "Default Working Session view uses a focused ChatGPT-style entry: mode toggle, large business-specific prompt, single chat bar, and biotech startup prompt suggestions."),
    ("04-session-history.png", "Working Session - History", "History view presents prior business topics as reusable session context rather than a generic chat archive."),
    ("05-plan-execution.png", "Working Session - Plan Execution", "Plan Execution reuses the project progress board and groups exported work by Initialized, In Review, In Progress, and Complete."),
    ("06-my-communities.png", "Community - My Communities", "My Communities shows joined founder/operator groups as company cards with clear focus and member density."),
    ("07-explore-communities.png", "Community - Explore Communities", "Explore Communities lists hot communities matched to biomedical startup needs."),
]

SCREENSHOT_ANCHORS = {
    "Start Page": ["fig_start_page"],
    "Working Session": [
        "fig_working_session_new_chat",
        "fig_working_session_history",
        "fig_working_session_plan_execution",
    ],
    "Company Info": ["fig_company_info_dashboard"],
    "Community": ["fig_community_my_communities", "fig_community_explore_communities"],
    "News Placement": ["fig_working_session_new_chat", "fig_company_info_dashboard"],
}

SCREENSHOT_BOOKMARKS = {
    "01-start-page.png": "fig_start_page",
    "02-company-info.png": "fig_company_info_dashboard",
    "03-working-session-new-chat.png": "fig_working_session_new_chat",
    "04-session-history.png": "fig_working_session_history",
    "05-plan-execution.png": "fig_working_session_plan_execution",
    "06-my-communities.png": "fig_community_my_communities",
    "07-explore-communities.png": "fig_community_explore_communities",
}


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def text_runs(text: str) -> str:
    return f'<w:r><w:t xml:space="preserve">{esc(text)}</w:t></w:r>'


def paragraph(text: str = "", style: str | None = None, page_break: bool = False) -> str:
    props = f"<w:pPr><w:pStyle w:val=\"{style}\"/></w:pPr>" if style else ""
    break_run = "<w:r><w:br w:type=\"page\"/></w:r>" if page_break else ""
    return f"<w:p>{props}{break_run}{text_runs(text) if text else ''}</w:p>"


def hyperlink_run(anchor: str, label: str) -> str:
    return (
        f'<w:hyperlink w:anchor="{esc(anchor)}" w:history="1">'
        '<w:r><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr>'
        f'<w:t>{esc(label)}</w:t></w:r></w:hyperlink>'
    )


def screenshot_links_paragraph(section_name: str) -> str:
    anchors = SCREENSHOT_ANCHORS[section_name]
    runs = ['<w:r><w:t xml:space="preserve">Screenshot links: </w:t></w:r>']

    for index, anchor in enumerate(anchors, start=1):
        if index > 1:
            runs.append('<w:r><w:t xml:space="preserve"> | </w:t></w:r>')
        runs.append(hyperlink_run(anchor, f"View screenshot {index}"))

    return '<w:p><w:pPr><w:pStyle w:val="ScreenshotLink"/></w:pPr>' + "".join(runs) + "</w:p>"


def bookmarked_paragraph(text: str, style: str, bookmark_name: str, bookmark_id: int) -> str:
    props = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>'
    bookmark_start = f'<w:bookmarkStart w:id="{bookmark_id}" w:name="{bookmark_name}"/>'
    bookmark_end = f'<w:bookmarkEnd w:id="{bookmark_id}"/>'
    return f"<w:p>{props}{bookmark_start}{text_runs(text)}{bookmark_end}</w:p>"


def bullet(text: str) -> str:
    return (
        "<w:p><w:pPr><w:pStyle w:val=\"ListParagraph\"/>"
        "<w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr>"
        f"{text_runs(text)}</w:p>"
    )


def table(rows: list[list[str]], widths: list[int]) -> str:
    grid = "".join(f'<w:gridCol w:w="{width}"/>' for width in widths)
    row_xml = []
    for row_index, row in enumerate(rows):
        cells = []
        for cell, width in zip(row, widths):
            fill = '<w:shd w:fill="F2F4F7"/>' if row_index == 0 else ""
            cells.append(
                "<w:tc>"
                f'<w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{fill}</w:tcPr>'
                f"{paragraph(cell, 'TableHeader' if row_index == 0 else 'TableBody')}"
                "</w:tc>"
            )
        row_xml.append(f"<w:tr>{''.join(cells)}</w:tr>")
    return (
        "<w:tbl><w:tblPr><w:tblW w:w=\"9360\" w:type=\"dxa\"/>"
        "<w:tblBorders><w:top w:val=\"single\" w:sz=\"4\" w:color=\"DADCE0\"/>"
        "<w:left w:val=\"single\" w:sz=\"4\" w:color=\"DADCE0\"/>"
        "<w:bottom w:val=\"single\" w:sz=\"4\" w:color=\"DADCE0\"/>"
        "<w:right w:val=\"single\" w:sz=\"4\" w:color=\"DADCE0\"/>"
        "<w:insideH w:val=\"single\" w:sz=\"4\" w:color=\"DADCE0\"/>"
        "<w:insideV w:val=\"single\" w:sz=\"4\" w:color=\"DADCE0\"/>"
        "</w:tblBorders><w:tblCellMar><w:top w:w=\"80\" w:type=\"dxa\"/>"
        "<w:start w:w=\"120\" w:type=\"dxa\"/><w:bottom w:w=\"80\" w:type=\"dxa\"/>"
        "<w:end w:w=\"120\" w:type=\"dxa\"/></w:tblCellMar></w:tblPr>"
        f"<w:tblGrid>{grid}</w:tblGrid>{''.join(row_xml)}</w:tbl>"
    )


def image_paragraph(rel_id: str, cx: int, cy: int, name: str) -> str:
    return f"""
<w:p>
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:docPr id="{rel_id[3:]}" name="{esc(name)}"/>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr><pic:cNvPr id="0" name="{esc(name)}"/><pic:cNvPicPr/></pic:nvPicPr>
              <pic:blipFill><a:blip r:embed="{rel_id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
              <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
"""


def image_size_emu(file_name: str) -> tuple[int, int]:
    sizes = {
        "01-start-page.png": (1440, 1039),
        "02-company-info.png": (1440, 1807),
        "03-working-session-new-chat.png": (1440, 1213),
        "04-session-history.png": (1440, 1164),
        "05-plan-execution.png": (1440, 1009),
        "06-my-communities.png": (1440, 1000),
        "07-explore-communities.png": (1440, 1000),
    }
    width_px, height_px = sizes[file_name]
    width_emu = 5943600
    height_emu = int(width_emu * height_px / width_px)
    return width_emu, height_emu


def build_document_xml() -> str:
    body: list[str] = []
    body.append(paragraph("BBW Product Design Document", "Title"))
    body.append(paragraph("Biomedical startup business AI agent platform - stakeholder discussion draft", "Subtitle"))
    body.append(paragraph("Prepared for product review | August 25, 2026", "Meta"))
    body.append(paragraph("Executive Summary", "Heading1"))
    body.append(paragraph("The current visual direction is retained: dark, high-technology, biomedical-adjacent, and clean. The public start page remains simple and chat-led. The logged-in workspace is simplified from many sidebar items into three primary product areas: Working Session, Company Info, and Community."))
    body.append(paragraph("Primary Product Decisions", "Heading1"))
    for item in [
        "Keep the public start page as a simple BBW chat entry with live biotech business news below it.",
        "Reduce logged-in sidebar complexity to three grouped tabs: Working Session, Company Info, and Community.",
        "Make Working Session the main AI operating surface, with New chat, History, and Plan execution as subviews.",
        "Make Company Info the founder dashboard for milestones, next steps, company stage, readiness, and business risk.",
        "Move logged-in news into the lower sidebar so market context is persistent without competing with the main workspace task.",
    ]:
        body.append(bullet(item))
    body.append(paragraph("Information Architecture", "Heading1"))
    body.append(table([
        ["Area", "Subitems", "Purpose"],
        ["Working Session", "New chat, History, Plan execution", "Run BBW conversations, restore prior topics, and execute exported plans."],
        ["Company Info", "Dashboard", "Summarize company health, milestones, stage, risks, and near-term operating work."],
        ["Community", "My communities, Explore communities, Request community", "Connect founders to relevant peer and expert communities."],
    ], [2200, 3000, 4160]))
    body.append(paragraph("Section Design", "Heading1"))
    sections = [
        ("Start Page", "The start page should remain the lowest-friction entry point. The first action is asking BBW a business question. Live biotech business news sits below the chat bar so it is visible but does not compete with the primary task."),
        ("Working Session", "New chat is the default and should feel closer to ChatGPT than a dashboard: the center of the page is a single BBW business prompt, one chat bar, and biotech startup prompt suggestions. Every chat starts as a session with a session id; follow-up questions keep that id until the user starts a new session. History lists reusable business topics. Plan execution converts agent work into a board of operating projects."),
        ("Company Info", "Company Info is the logged-in default. It gives founders a fast read on runway, lead asset, capital need, readiness, milestones, next-step checklist, stage progression, and risk signals."),
        ("Community", "Community is split into joined communities, discovery, and request flow. My Communities shows company cards for groups already joined. Explore Communities lists high-signal communities in the biomedical startup area. Request Community lets founders propose specialized groups."),
        ("News Placement", "Logged-in news is placed in the lower sidebar. This uses otherwise empty navigation space, keeps the main page focused on the active task, and keeps biotech funding and market signals visible across workspace pages."),
    ]
    for heading, text in sections:
        body.append(paragraph(heading, "Heading2"))
        body.append(paragraph(text))
        body.append(screenshot_links_paragraph(heading))
    body.append(paragraph("Screenshots", "Heading1", page_break=True))
    for index, (file_name, title, caption) in enumerate(SCREENSHOTS, start=1):
        body.append(
            bookmarked_paragraph(
                f"Figure {index}. {title}",
                "Heading2",
                SCREENSHOT_BOOKMARKS[file_name],
                index,
            )
        )
        body.append(paragraph(caption, "Caption"))
        rel_id = f"rId{index + 10}"
        cx, cy = image_size_emu(file_name)
        body.append(image_paragraph(rel_id, cx, cy, file_name))
        if index < len(SCREENSHOTS):
            body.append(paragraph(page_break=True))
    body.append(paragraph("Discussion Questions", "Heading1", page_break=True))
    for item in [
        "Should Plan execution live only under Working Session, or should it become a top-level tab after the product matures?",
        "What company-stage fields are required for investor-ready BBW guidance?",
        "Should logged-in news be personalized by indication, modality, financing stage, and geography?",
        "What permissions are needed for scientists, founders, advisors, and investors in shared sessions?",
        "Which BBW outputs should be exportable first: projects, investor memos, checklists, or board updates?",
    ]:
        body.append(bullet(item))
    body.append('<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
        'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        f"<w:body>{''.join(body)}</w:body></w:document>"
    )


def styles_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="222222"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:spacing w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="48"/><w:b/><w:color w:val="0B2545"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:pPr><w:spacing w:after="160"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="26"/><w:color w:val="1F4D78"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Meta"/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="160"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="2E74B5"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="2E74B5"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="Caption"/><w:pPr><w:spacing w:after="100"/></w:pPr><w:rPr><w:i/><w:sz w:val="20"/><w:color w:val="555555"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ScreenshotLink"><w:name w:val="Screenshot Link"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="20" w:after="120"/></w:pPr><w:rPr><w:sz w:val="20"/><w:color w:val="555555"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="80"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="TableHeader"><w:name w:val="Table Header"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="0B2545"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="TableBody"><w:name w:val="Table Body"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="40"/></w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:style>
</w:styles>"""


def numbering_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>"""


def rels_xml() -> str:
    rels = [
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>',
    ]
    for index, (file_name, _, _) in enumerate(SCREENSHOTS, start=11):
        rels.append(f'<Relationship Id="rId{index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{file_name}"/>')
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "".join(rels) + "</Relationships>"


def content_types_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""


def root_rels_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""


def core_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>BBW Product Design Document</dc:title>
  <dc:subject>Biomedical startup business AI agent product design</dc:subject>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-08-25T13:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-25T13:00:00Z</dcterms:modified>
</cp:coreProperties>"""


def app_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
</Properties>"""


def main() -> None:
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types_xml())
        docx.writestr("_rels/.rels", root_rels_xml())
        docx.writestr("docProps/core.xml", core_xml())
        docx.writestr("docProps/app.xml", app_xml())
        docx.writestr("word/document.xml", build_document_xml())
        docx.writestr("word/styles.xml", styles_xml())
        docx.writestr("word/numbering.xml", numbering_xml())
        docx.writestr("word/_rels/document.xml.rels", rels_xml())
        for file_name, _, _ in SCREENSHOTS:
            docx.write(ROOT / file_name, f"word/media/{file_name}")
    print(OUT)


if __name__ == "__main__":
    main()
