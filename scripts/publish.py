#!/usr/bin/env python3
# publish.py - JCE Media Report Publisher
# Usage:
#   python scripts/publish.py --ensure-repo
#   python scripts/publish.py --config C:\Temp\publish_config.json

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

REPO_URL = "https://github.com/jacquesgroen88/researchandreporting"
REPO_DIR = Path(r"D:\researchandreporting")

BADGE_COLORS = {
    "Audit": "#f59e0b",
    "Strategy": "#10b981",
    "Research": "#4f6ef7",
}

DEFAULT_ACCENT_CSS = "linear-gradient(135deg, #4f6ef7, #7c3aed)"
DEFAULT_ACCENT_COLOR = "#4f6ef7"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_accent_color(accent_css: str) -> str:
    """Pull the first hex colour out of a CSS gradient string."""
    m = re.search(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', accent_css)
    return m.group(0) if m else DEFAULT_ACCENT_COLOR


def _format_date(date_str: str) -> str:
    """Convert 2026-05-15 -> May 15."""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        # strftime day without leading zero (cross-platform)
        return d.strftime("%b") + " " + str(d.day)
    except Exception:
        return date_str


def _normalize(s: str) -> str:
    """Lowercase + strip everything except letters/digits, for fuzzy matching."""
    return re.sub(r'[^a-z0-9]', '', s.lower())


# ---------------------------------------------------------------------------
# Repo helpers
# ---------------------------------------------------------------------------

def ensure_repo():
    if not REPO_DIR.exists():
        print(f"Cloning {REPO_URL} -> {REPO_DIR} ...")
        subprocess.run(["git", "clone", REPO_URL, str(REPO_DIR)], check=True)
        print("Clone complete.")
    elif not (REPO_DIR / ".git").exists():
        print(f"WARNING: {REPO_DIR} exists but has no .git -- not a real clone.")
    else:
        print("Pulling latest from origin/main ...")
        subprocess.run(["git", "-C", str(REPO_DIR), "pull", "origin", "main"], check=True)
        print("Pull complete.")


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}


def copy_images(src_dir: Path, dest_dir: Path) -> list:
    copied = []
    if not src_dir.exists():
        print(f"  WARNING: images source dir not found: {src_dir}")
        return copied
    for f in src_dir.iterdir():
        if f.is_file() and f.suffix.lower() in IMAGE_EXTS:
            shutil.copy2(f, dest_dir / f.name)
            copied.append(f.name)
    return copied


def fix_image_paths(html_path: Path):
    content = html_path.read_text(encoding="utf-8", errors="replace")
    referenced = []
    count = 0

    def replacer(m):
        nonlocal count
        original = m.group(1)
        filename = original.split("/")[-1].split("\\")[-1]
        referenced.append(filename)
        count += 1
        return f'src="./{filename}"'

    new_content = re.sub(
        r'src="([^"]+\.(png|jpg|jpeg|gif|webp|svg))"',
        replacer, content, flags=re.IGNORECASE
    )
    html_path.write_text(new_content, encoding="utf-8")
    return count, referenced


def verify_images(dest_dir: Path, referenced: list) -> list:
    return [name for name in set(referenced) if not (dest_dir / name).exists()]


# ---------------------------------------------------------------------------
# Root index.html helpers
# ---------------------------------------------------------------------------

def _find_existing_slug(root_html: Path, slug: str):
    """
    Returns the actual slug used in root index.html if this client exists,
    using exact match first then fuzzy (normalised) match.
    Returns None if not found.
    """
    content = root_html.read_text(encoding="utf-8", errors="replace")
    if f'href="./clients/{slug}/"' in content:
        return slug
    # Fuzzy: find all client slugs and compare normalised forms
    existing = re.findall(r'href="./clients/([^/"]+)/"', content)
    norm_target = _normalize(slug)
    for s in existing:
        if _normalize(s) == norm_target:
            return s
    return None


def _build_client_card(client: dict, reports: list, accent_css: str) -> str:
    """Build a card that exactly matches the root index.html CSS structure."""
    name = client["name"]
    slug = client["slug"]
    description = client.get("description", "")
    tags = client.get("tags", [])
    initials = "".join(w[0].upper() for w in name.split()[:2])
    accent_color = _extract_accent_color(accent_css)

    tags_html = "\n        ".join(f'<span class="meta-chip">{t}</span>' for t in tags)

    svg = ('<svg width="16" height="16" fill="none" stroke="currentColor" '
           'stroke-width="2" viewBox="0 0 24 24">'
           '<path d="M5 12h14M12 5l7 7-7 7"/></svg>')

    rows = []
    for r in reports:
        title = r.get("title", "Report")
        date_display = _format_date(r.get("date", ""))
        rows.append(
            f'        <div class="report-row">\n'
            f'          <div class="report-dot" style="background:{accent_color};"></div>\n'
            f'          <div class="report-row-name">{title}</div>\n'
            f'          <div class="report-row-date">{date_display}</div>\n'
            f'        </div>'
        )
    rows_html = "\n".join(rows)

    # Only add --card-accent when it differs from the default blue-purple
    card_style = f' style="--card-accent: {accent_color};"' if accent_color != DEFAULT_ACCENT_COLOR else ""

    return (
        f'    <!-- {name} -->\n'
        f'    <a href="./clients/{slug}/" class="client-card"{card_style}>\n'
        f'      <div class="client-card-top">\n'
        f'        <div class="client-avatar" style="background: {accent_css};">{initials}</div>\n'
        f'        <div class="client-status">Active</div>\n'
        f'      </div>\n'
        f'      <div class="client-name">{name}</div>\n'
        f'      <div class="client-desc">{description}</div>\n'
        f'      <div class="client-meta">\n'
        f'        {tags_html}\n'
        f'      </div>\n'
        f'      <div class="client-reports-preview">\n'
        f'        <div class="reports-label">Reports</div>\n'
        f'{rows_html}\n'
        f'      </div>\n'
        f'      <div class="card-cta">\n'
        f'        View client reports\n'
        f'        {svg}\n'
        f'      </div>\n'
        f'    </a>'
    )


def update_root_index(client: dict, reports: list, accent_css: str,
                      existing_slug: str | None):
    root_html = REPO_DIR / "index.html"
    content = root_html.read_text(encoding="utf-8", errors="replace")
    slug = client["slug"]
    accent_color = _extract_accent_color(accent_css)
    is_new_client = existing_slug is None

    if is_new_client:
        # Insert new card before <!-- Placeholder -->
        card_html = _build_client_card(client, reports, accent_css)
        if "<!-- Placeholder -->" in content:
            content = content.replace(
                "<!-- Placeholder -->",
                card_html + "\n    <!-- Placeholder -->"
            )
        else:
            # Fallback: insert before the add-client-card div
            content = content.replace(
                '<div class="add-client-card">',
                card_html + '\n    <div class="add-client-card">'
            )
        # Increment clients counter
        content = re.sub(
            r'(<span[^>]*class="[^"]*stat-number[^"]*"[^>]*>)(\d+)(</span>[^<]*(?:<[^/][^>]*>)*[^<]*Clients)',
            lambda m: m.group(1) + str(int(m.group(2)) + 1) + m.group(3),
            content
        )
    else:
        # Add a new report-row inside the existing client's client-reports-preview
        use_slug = existing_slug
        for r in reports:
            title = r.get("title", "Report")
            date_display = _format_date(r.get("date", ""))
            new_row = (
                f'\n        <div class="report-row">\n'
                f'          <div class="report-dot" style="background:{accent_color};"></div>\n'
                f'          <div class="report-row-name">{title}</div>\n'
                f'          <div class="report-row-date">{date_display}</div>\n'
                f'        </div>'
            )
            # Find this client's reports-preview block and append the row before it closes
            pattern = (
                rf'(href="./clients/{re.escape(use_slug)}/"[^>]*>.*?'
                rf'<div class="client-reports-preview">.*?)'
                rf'(</div>\s*<div class="card-cta">)'
            )
            content = re.sub(pattern, r'\1' + new_row + r'\n      \2',
                             content, count=1, flags=re.DOTALL)

    # Increment reports counter
    content = re.sub(
        r'(<span[^>]*class="[^"]*stat-number[^"]*"[^>]*>)(\d+)(</span>[^<]*(?:<[^/][^>]*>)*[^<]*Reports)',
        lambda m: m.group(1) + str(int(m.group(2)) + len(reports)) + m.group(3),
        content
    )

    root_html.write_text(content, encoding="utf-8")
    action = "new client card" if is_new_client else f"added {len(reports)} report row(s) to existing card"
    print(f"  Updated root index.html ({action})")


# ---------------------------------------------------------------------------
# Client hub helpers
# ---------------------------------------------------------------------------

def generate_client_hub(client: dict, reports: list, accent_css: str) -> str:
    name = client["name"]
    slug = client["slug"]
    description = client.get("description", "")
    tags = client.get("tags", [])
    facts = client.get("facts", [])
    website = client.get("website", "")
    initials = "".join(w[0].upper() for w in name.split()[:2])
    accent_color = _extract_accent_color(accent_css)

    tags_html = " ".join(f'<span class="tag">{t}</span>' for t in tags)
    facts_html = "\n        ".join(
        f'<div class="fact"><span class="fact-val">{f["val"]}</span>'
        f'<span class="fact-label">{f["label"]}</span></div>'
        for f in facts
    )
    website_html = (
        f'<p><a href="{website}" style="color:#a78bfa" target="_blank">{website}</a></p>'
        if website else ""
    )

    report_cards = []
    for r in reports:
        badge = r.get("badge", "Audit")
        color = BADGE_COLORS.get(badge, "#4f6ef7")
        date = r.get("date", "")
        title = r.get("title", "Report")
        date_slug = f"{date}-{r['slug']}"
        desc = r.get("description", "")
        chips_html = "".join(f'<span class="chip">{c}</span>' for c in r.get("chips", []))
        report_cards.append(
            f'      <div class="report-card">\n'
            f'        <div class="report-card-header"><div>\n'
            f'          <span class="report-badge" style="background:{color}20;color:{color};border:1px solid {color}40">{badge}</span>\n'
            f'          <h2 class="report-title">{title}</h2>\n'
            f'          <p class="report-date-label">{date}</p>\n'
            f'        </div></div>\n'
            f'        <p class="report-description">{desc}</p>\n'
            f'        <div class="report-chips">{chips_html}</div>\n'
            f'        <a href="./reports/{date_slug}/" class="view-report-btn">View Report</a>\n'
            f'      </div>'
        )
    report_cards_html = "\n".join(report_cards)

    css = (
        "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n"
        "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;"
        f" background: #0a0d14; color: #e2e8f0; min-height: 100vh; }}\n"
        "    .site-header { background: #111520; border-bottom: 1px solid #1e2535; padding: 1rem 2rem;"
        " display: flex; align-items: center; gap: 1rem; }\n"
        "    .back-link { color: #a78bfa; text-decoration: none; font-size: 0.875rem; }\n"
        "    .back-link:hover { color: #c4b5fd; }\n"
        "    .site-name { color: #e2e8f0; font-weight: 600; font-size: 0.9rem; }\n"
        f"    .hero {{ background: {accent_css}; padding: 3rem 2rem; text-align: center; position: relative; overflow: hidden; }}\n"
        "    .hero::before { content: ''; position: absolute; inset: 0;"
        " background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%); }\n"
        "    .hero-content { position: relative; z-index: 1; }\n"
        "    .hero-avatar { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2);"
        " display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;"
        " font-size: 2rem; font-weight: 700; color: #fff; border: 3px solid rgba(255,255,255,0.4); }\n"
        "    .hero h1 { font-size: 2.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }\n"
        "    .hero p { color: rgba(255,255,255,0.85); font-size: 1.05rem; max-width: 600px; margin: 0 auto 1.5rem; }\n"
        "    .hero-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }\n"
        "    .tag { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9);"
        " padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.25); }\n"
        "    .facts-strip { background: #111520; border-bottom: 1px solid #1e2535;"
        " display: flex; flex-wrap: wrap; justify-content: center; }\n"
        "    .fact { padding: 1.25rem 2rem; text-align: center; border-right: 1px solid #1e2535; }\n"
        "    .fact:last-child { border-right: none; }\n"
        "    .fact-val { display: block; font-size: 1.5rem; font-weight: 700; color: #e2e8f0; }\n"
        "    .fact-label { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;"
        " text-transform: uppercase; letter-spacing: 0.05em; }\n"
        "    .main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem; }\n"
        "    .section-title { font-size: 1.3rem; font-weight: 600; color: #e2e8f0; margin-bottom: 1.5rem;"
        " padding-bottom: 0.75rem; border-bottom: 1px solid #1e2535; }\n"
        "    .report-card { background: #111520; border: 1px solid #1e2535; border-radius: 12px;"
        " padding: 1.75rem; margin-bottom: 1rem; }\n"
        "    .report-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px;"
        " font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; }\n"
        "    .report-title { font-size: 1.2rem; font-weight: 600; color: #e2e8f0; margin: 0.3rem 0; }\n"
        "    .report-date-label { font-size: 0.8rem; color: #64748b; }\n"
        "    .report-description { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }\n"
        "    .report-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }\n"
        "    .chip { background: #1a2035; color: #94a3b8; padding: 0.3rem 0.75rem; border-radius: 999px;"
        " font-size: 0.78rem; border: 1px solid #1e2535; }\n"
        "    .view-report-btn { display: inline-block; background: #1a2035; color: #a78bfa;"
        " padding: 0.6rem 1.25rem; border-radius: 8px; text-decoration: none;"
        f" font-size: 0.875rem; font-weight: 500; border: 1px solid #2d3748; }}\n"
        "    .layout { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; align-items: start; }\n"
        "    .sidebar { background: #111520; border: 1px solid #1e2535; border-radius: 12px; padding: 1.5rem; }\n"
        "    .sidebar h3 { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; margin-bottom: 1rem;"
        " text-transform: uppercase; letter-spacing: 0.05em; }\n"
        "    .sidebar p { color: #94a3b8; font-size: 0.875rem; line-height: 1.6; margin-bottom: 0.75rem; }\n"
        "    @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }"
    )

    return "\n".join([
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        f"  <title>{name} -- JCE Media Reports</title>",
        "  <style>",
        "    " + css,
        "  </style>",
        "</head>",
        "<body>",
        '  <header class="site-header">',
        '    <a href="../../" class="back-link">&#8592; All Clients</a>',
        '    <span style="color:#1e2535">|</span>',
        '    <span class="site-name">JCE Media Research Hub</span>',
        "  </header>",
        '  <div class="hero">',
        '    <div class="hero-content">',
        f'      <div class="hero-avatar">{initials}</div>',
        f"      <h1>{name}</h1>",
        f"      <p>{description}</p>",
        f'      <div class="hero-tags">{tags_html}</div>',
        "    </div>",
        "  </div>",
        '  <div class="facts-strip">',
        f"    {facts_html}",
        "  </div>",
        '  <main class="main">',
        '    <div class="layout">',
        "      <div>",
        '        <h2 class="section-title">Reports</h2>',
        report_cards_html,
        "      </div>",
        "      <aside>",
        '        <div class="sidebar">',
        "          <h3>Client Overview</h3>",
        f"          <p>{description}</p>",
        website_html,
        "        </div>",
        "      </aside>",
        "    </div>",
        "  </main>",
        "</body>",
        "</html>",
    ])


def update_client_hub(client: dict, reports: list, accent_css: str):
    slug = client["slug"]
    client_dir = REPO_DIR / "clients" / slug
    client_dir.mkdir(parents=True, exist_ok=True)
    hub_path = client_dir / "index.html"

    if hub_path.exists():
        content = hub_path.read_text(encoding="utf-8", errors="replace")
        accent_color = _extract_accent_color(accent_css)
        for r in reports:
            badge = r.get("badge", "Audit")
            color = BADGE_COLORS.get(badge, "#4f6ef7")
            date = r.get("date", "")
            title = r.get("title", "Report")
            date_slug = f"{date}-{r['slug']}"
            desc = r.get("description", "")
            chips_html = "".join(f'<span class="chip">{c}</span>' for c in r.get("chips", []))
            new_card = (
                f'\n      <div class="report-card">\n'
                f'        <div class="report-card-header"><div>\n'
                f'          <span class="report-badge" style="background:{color}20;color:{color};border:1px solid {color}40">{badge}</span>\n'
                f'          <h2 class="report-title">{title}</h2>\n'
                f'          <p class="report-date-label">{date}</p>\n'
                f'        </div></div>\n'
                f'        <p class="report-description">{desc}</p>\n'
                f'        <div class="report-chips">{chips_html}</div>\n'
                f'        <a href="./reports/{date_slug}/" class="view-report-btn">View Report</a>\n'
                f'      </div>'
            )
            content = re.sub(r'(\s*</div>\s*<aside)', "\n" + new_card + r"\1", content, count=1)
        hub_path.write_text(content, encoding="utf-8")
        print(f"  Updated existing client hub: {hub_path}")
    else:
        hub_path.write_text(generate_client_hub(client, reports, accent_css), encoding="utf-8")
        print(f"  Created client hub: {hub_path}")

    readme_path = client_dir / "README.md"
    if not readme_path.exists():
        readme_path.write_text(
            f"# {client['name']}\n\n{client.get('description', '')}\n\n"
            "Reports published via JCE Media Research Hub.\n",
            encoding="utf-8"
        )


# ---------------------------------------------------------------------------
# Main publish workflow
# ---------------------------------------------------------------------------

def publish(config: dict):
    client = config["client"]
    reports = config["reports"]
    accent_css = client.get("accent_css", DEFAULT_ACCENT_CSS)
    slug = client["slug"]

    # Validate source files first
    for r in reports:
        src = Path(r["source_html"])
        if not src.exists():
            print(f"ERROR: Source HTML not found: {src}")
            sys.exit(1)

    root_html = REPO_DIR / "index.html"
    existing_slug = _find_existing_slug(root_html, slug)
    if existing_slug and existing_slug != slug:
        print(f"  NOTE: Matched existing client '{existing_slug}' (fuzzy match for '{slug}')")
        # Use the existing slug for all operations
        slug = existing_slug
        client["slug"] = slug

    for r in reports:
        date = r.get("date", "")
        date_slug = f"{date}-{r['slug']}"
        dest_dir = REPO_DIR / "clients" / slug / "reports" / date_slug
        dest_dir.mkdir(parents=True, exist_ok=True)

        src_html = Path(r["source_html"])
        dest_html = dest_dir / "index.html"
        shutil.copy2(src_html, dest_html)
        print(f"  Copied {src_html.name} -> {dest_html}")

        images_dir = r.get("source_images_dir", str(src_html.parent))
        copied = copy_images(Path(images_dir), dest_dir)
        print(f"  Copied {len(copied)} image(s)")

        count, referenced = fix_image_paths(dest_html)
        print(f"  Rewrote {count} image src(s) to relative paths")

        missing = verify_images(dest_dir, referenced)
        if missing:
            print(f"  WARNING: {len(missing)} image(s) missing from destination:")
            for m in missing:
                print(f"    - {m}")

    update_client_hub(client, reports, accent_css)
    update_root_index(client, reports, accent_css, existing_slug)

    print("\n" + "=" * 60)
    print("Published to jcereports.netlify.app")
    print()
    print("Homepage:   https://jcereports.netlify.app/")
    print(f"Client hub: https://jcereports.netlify.app/clients/{slug}/")
    print("Report(s):")
    for r in reports:
        date_slug = f"{r['date']}-{r['slug']}"
        print(f"  https://jcereports.netlify.app/clients/{slug}/reports/{date_slug}/")
    print("=" * 60)
    print("\nCommit and push:")
    print(f"  cd {REPO_DIR}")
    print("  git add .")
    titles = ", ".join(r["title"] for r in reports)
    print(f"  git commit -m \"Add {client['name']} -- {titles} ({reports[0]['date']})\"")
    print("  git push origin main")


def main():
    parser = argparse.ArgumentParser(description="JCE Media Report Publisher")
    parser.add_argument("--ensure-repo", action="store_true",
                        help="Clone or pull the researchandreporting repo")
    parser.add_argument("--config", type=str,
                        help="Path to publish config JSON")
    args = parser.parse_args()

    if args.ensure_repo:
        ensure_repo()
    elif args.config:
        with open(args.config, encoding="utf-8") as f:
            config = json.load(f)
        publish(config)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
