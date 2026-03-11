from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

MAX_BODY_CHARS = 8000
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}

@dataclass(slots=True)
class ArticleContent:
    title: str
    source: str
    url: str
    summary: str
    body: str
    mode: str
    content_quality: str
    warning: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def resolve_article_content(
    *,
    title: str = "",
    url: str = "",
    text: str = "",
) -> dict[str, Any]:
    normalized_text = _normalize_text(text)
    normalized_title = _normalize_text(title)
    normalized_url = url.strip()

    if normalized_text:
        article = ArticleContent(
            title=normalized_title or "Manual article input",
            source="Manual input",
            url=normalized_url,
            summary=_make_summary(normalized_text),
            body=normalized_text[:MAX_BODY_CHARS],
            mode="manual_text",
            content_quality="full_text",
            warning="",
        )
        return article.to_dict()

    if not normalized_url:
        raise ValueError("Article text or article URL is required.")

    request = Request(normalized_url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=15) as response:
        html_payload = response.read().decode("utf-8", "ignore")

    soup = BeautifulSoup(html_payload, "html.parser")
    extracted_title = _extract_title(soup) or normalized_title or "Untitled article"
    extracted_summary = _extract_summary(soup)
    extracted_body = _extract_body(soup)
    source = _extract_source_name(normalized_url)

    content_quality = "full_text" if len(extracted_body) >= 400 else "summary_only"
    warning = ""
    if content_quality == "summary_only":
        warning = "Full article extraction was limited, so analysis may rely more on headline and summary."

    article = ArticleContent(
        title=extracted_title,
        source=source,
        url=normalized_url,
        summary=extracted_summary or _make_summary(extracted_body or extracted_title),
        body=(extracted_body or extracted_summary or extracted_title)[:MAX_BODY_CHARS],
        mode="article_url",
        content_quality=content_quality,
        warning=warning,
    )
    return article.to_dict()


def _extract_title(soup: BeautifulSoup) -> str:
    selectors = [
        ('meta[property="og:title"]', "content"),
        ('meta[name="twitter:title"]', "content"),
        ("title", None),
        ("h1", None),
    ]

    for selector, attribute in selectors:
        node = soup.select_one(selector)
        if node is None:
            continue

        value = node.get(attribute, "") if attribute else node.get_text(" ", strip=True)
        value = _normalize_text(value)
        if value:
            return value

    return ""


def _extract_summary(soup: BeautifulSoup) -> str:
    selectors = [
        ('meta[property="og:description"]', "content"),
        ('meta[name="description"]', "content"),
        ('meta[name="twitter:description"]', "content"),
    ]

    for selector, attribute in selectors:
        node = soup.select_one(selector)
        if node is None:
            continue

        value = _normalize_text(node.get(attribute, ""))
        if value:
            return value[:500]

    return ""


def _extract_body(soup: BeautifulSoup) -> str:
    article_node = soup.find("article")
    containers = [article_node] if article_node else []
    containers.extend(soup.select("main"))
    containers.append(soup)

    for container in containers:
        if container is None:
            continue

        paragraphs = [
            _normalize_text(node.get_text(" ", strip=True))
            for node in container.find_all("p")
        ]
        paragraphs = [paragraph for paragraph in paragraphs if len(paragraph) >= 60]

        if paragraphs:
            joined = "\n\n".join(paragraphs[:18])
            return joined[:MAX_BODY_CHARS]

    return ""


def _extract_source_name(url: str) -> str:
    hostname = urlparse(url).netloc.lower()
    hostname = hostname.removeprefix("www.")
    if not hostname:
        return "Unknown source"

    first_label = hostname.split(".")[0]
    return first_label.replace("-", " ").title()


def _make_summary(text: str) -> str:
    normalized = _normalize_text(text)
    if not normalized:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    return " ".join(sentences[:2])[:320]


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()
