"""Very small, dependency-free .txt/.md -> HTML converter.

Scope note: this is intentionally not a full CommonMark implementation.
It recognizes the handful of constructs the assignment brief asks for
(headings, bullet lists) plus paragraphs, which is enough to turn an
imported file into something usable in the Tiptap editor. Anything more
exotic (tables, nested lists, code fences) is a documented non-goal.
"""
import html


def text_or_markdown_to_html(raw_text: str) -> str:
    lines = raw_text.replace("\r\n", "\n").split("\n")
    html_parts = []
    list_buffer = []

    def flush_list():
        if list_buffer:
            items = "".join(f"<li>{item}</li>" for item in list_buffer)
            html_parts.append(f"<ul>{items}</ul>")
            list_buffer.clear()

    for raw_line in lines:
        line = raw_line.strip()

        if not line:
            flush_list()
            continue

        if line.startswith("# "):
            flush_list()
            html_parts.append(f"<h1>{html.escape(line[2:].strip())}</h1>")
        elif line.startswith("## "):
            flush_list()
            html_parts.append(f"<h2>{html.escape(line[3:].strip())}</h2>")
        elif line.startswith("- ") or line.startswith("* "):
            list_buffer.append(html.escape(line[2:].strip()))
        else:
            flush_list()
            html_parts.append(f"<p>{html.escape(line)}</p>")

    flush_list()
    return "".join(html_parts) if html_parts else "<p></p>"
