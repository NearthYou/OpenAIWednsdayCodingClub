from __future__ import annotations

import html
import re
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup


DEFAULT_NEWS_QUERY = "economy OR stock market OR inflation OR federal reserve"
DEFAULT_KOREA_QUERY = "경제 OR 증시 OR 환율 OR 반도체"
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )
}
GLOBAL_GOOGLE_RSS = (
    "https://news.google.com/rss/search?q={query}+when:1d&hl=en-US&gl=US&ceid=US:en"
)
KOREA_GOOGLE_RSS = (
    "https://news.google.com/rss/search?q={query}+when:1d&hl=ko&gl=KR&ceid=KR:ko"
)
STATIC_FEEDS = (
    {
        "url": "https://www.yna.co.kr/rss/economy.xml",
        "region": "korea",
        "language": "ko",
        "feed_label": "Yonhap Economy",
    },
    {
        "url": "https://rss.etnews.com/Section902.xml",
        "region": "korea",
        "language": "ko",
        "feed_label": "ETNews",
    },
)
POSITIVE_WORDS = (
    "랠리",
    "상승",
    "호조",
    "회복",
    "반등",
    "강세",
    "optimism",
    "gain",
    "rally",
    "growth",
    "beat",
    "surge",
)
NEGATIVE_WORDS = (
    "급락",
    "하락",
    "우려",
    "충격",
    "약세",
    "둔화",
    "리스크",
    "selloff",
    "drop",
    "slump",
    "recession",
    "risk",
    "tariff",
)


@dataclass(slots=True)
class NewsItem:
    title: str
    link: str
    source: str
    published_at: str
    summary: str
    region: str
    language: str
    feed_label: str
    sentiment_score: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def fetch_latest_news(
    query: str = DEFAULT_NEWS_QUERY,
    limit: int = 16,
    market: str = "all",
) -> dict[str, Any]:
    normalized_market = market.strip().lower() or "all"
    seen_titles: set[str] = set()
    global_items: list[dict[str, Any]] = []
    korea_items: list[dict[str, Any]] = []

    if normalized_market in {"all", "global"}:
        global_items.extend(
            _fetch_google_feed(
                GLOBAL_GOOGLE_RSS.format(query=quote_plus(query)),
                region="global",
                language="en",
                feed_label="Google News Global",
                seen_titles=seen_titles,
            )
        )

    if normalized_market in {"all", "korea"}:
        korea_query = query if normalized_market == "korea" else DEFAULT_KOREA_QUERY
        korea_items.extend(
            _fetch_google_feed(
                KOREA_GOOGLE_RSS.format(query=quote_plus(korea_query)),
                region="korea",
                language="ko",
                feed_label="Google News Korea",
                seen_titles=seen_titles,
            )
        )
        for feed in STATIC_FEEDS:
            korea_items.extend(
                _fetch_rss_feed(
                    feed["url"],
                    region=feed["region"],
                    language=feed["language"],
                    feed_label=feed["feed_label"],
                    seen_titles=seen_titles,
                )
            )

    global_items = sorted(global_items, key=_sort_key, reverse=True)
    korea_items = sorted(korea_items, key=_sort_key, reverse=True)

    if normalized_market == "all":
        sorted_items = _interleave_regions(global_items, korea_items, limit)
    elif normalized_market == "global":
        sorted_items = global_items[:limit]
    else:
        sorted_items = korea_items[:limit]

    return {
        "items": sorted_items,
        "summary": _build_summary(sorted_items),
    }


def _fetch_google_feed(
    url: str,
    *,
    region: str,
    language: str,
    feed_label: str,
    seen_titles: set[str],
) -> list[dict[str, Any]]:
    request = Request(url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=15) as response:
        xml_payload = response.read()

    root = ET.fromstring(xml_payload)
    items: list[dict[str, Any]] = []

    for item in root.findall(".//item"):
        raw_title = html.unescape((item.findtext("title") or "").strip())
        source_node = item.find("source")
        source = html.unescape((source_node.text or "").strip()) if source_node is not None else ""
        title = _strip_source_suffix(raw_title, source)
        normalized_title = title.casefold()

        if not title or normalized_title in seen_titles:
            continue

        description = _extract_description_text(item.findtext("description") or "")
        summary = description or "Live market-moving headline sourced from RSS."
        source_name = source or _infer_source_from_title(raw_title)
        sentiment_score = _score_sentiment(f"{title} {summary}")

        items.append(
            NewsItem(
                title=title,
                link=(item.findtext("link") or "").strip(),
                source=source_name,
                published_at=(item.findtext("pubDate") or "").strip(),
                summary=summary,
                region=region,
                language=language,
                feed_label=feed_label,
                sentiment_score=sentiment_score,
            ).to_dict()
        )
        seen_titles.add(normalized_title)

    return items


def _fetch_rss_feed(
    url: str,
    *,
    region: str,
    language: str,
    feed_label: str,
    seen_titles: set[str],
) -> list[dict[str, Any]]:
    request = Request(url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=15) as response:
        xml_payload = response.read()

    root = ET.fromstring(xml_payload)
    items: list[dict[str, Any]] = []

    for item in root.findall(".//item"):
        title = html.unescape((item.findtext("title") or "").strip())
        normalized_title = title.casefold()
        if not title or normalized_title in seen_titles:
            continue

        description = _extract_description_text(item.findtext("description") or "")
        summary = description or title
        source = feed_label

        items.append(
            NewsItem(
                title=title,
                link=(item.findtext("link") or "").strip(),
                source=source,
                published_at=(item.findtext("pubDate") or "").strip(),
                summary=summary,
                region=region,
                language=language,
                feed_label=feed_label,
                sentiment_score=_score_sentiment(f"{title} {summary}"),
            ).to_dict()
        )
        seen_titles.add(normalized_title)

    return items


def _extract_description_text(description_html: str) -> str:
    soup = BeautifulSoup(description_html, "html.parser")
    text = " ".join(soup.stripped_strings)
    return re.sub(r"\s+", " ", text).strip()


def _strip_source_suffix(title: str, source: str) -> str:
    if source:
        suffix = f" - {source}"
        if title.endswith(suffix):
            return title[: -len(suffix)].strip()
    return title


def _infer_source_from_title(title: str) -> str:
    if " - " not in title:
        return "Unknown source"
    return title.rsplit(" - ", 1)[-1].strip()


def _sort_key(item: dict[str, Any]) -> datetime:
    published_at = item.get("published_at", "")
    try:
        return parsedate_to_datetime(published_at)
    except (TypeError, ValueError, IndexError, OverflowError):
        return datetime.min


def _score_sentiment(text: str) -> int:
    lowered = text.lower()
    score = 0
    for word in POSITIVE_WORDS:
        if word.lower() in lowered:
            score += 1
    for word in NEGATIVE_WORDS:
        if word.lower() in lowered:
            score -= 1
    return max(min(score, 3), -3)


def _build_summary(items: list[dict[str, Any]]) -> dict[str, Any]:
    region_counts = {"global": 0, "korea": 0}
    language_counts: dict[str, int] = {}
    feed_counts: dict[str, int] = {}
    sentiment = {"positive": 0, "neutral": 0, "negative": 0}

    for item in items:
        region_counts[item["region"]] = region_counts.get(item["region"], 0) + 1
        language_counts[item["language"]] = language_counts.get(item["language"], 0) + 1
        feed_counts[item["feed_label"]] = feed_counts.get(item["feed_label"], 0) + 1

        if item["sentiment_score"] > 0:
            sentiment["positive"] += 1
        elif item["sentiment_score"] < 0:
            sentiment["negative"] += 1
        else:
            sentiment["neutral"] += 1

    top_feeds = [
        {"label": label, "count": count}
        for label, count in sorted(feed_counts.items(), key=lambda pair: pair[1], reverse=True)
    ][:5]

    return {
        "total": len(items),
        "region_counts": region_counts,
        "language_counts": language_counts,
        "sentiment_breakdown": sentiment,
        "top_feeds": top_feeds,
    }


def _interleave_regions(
    global_items: list[dict[str, Any]],
    korea_items: list[dict[str, Any]],
    limit: int,
) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    global_index = 0
    korea_index = 0

    while len(result) < limit and (global_index < len(global_items) or korea_index < len(korea_items)):
        if global_index < len(global_items):
            result.append(global_items[global_index])
            global_index += 1
            if len(result) >= limit:
                break

        if korea_index < len(korea_items):
            result.append(korea_items[korea_index])
            korea_index += 1

    return result[:limit]
