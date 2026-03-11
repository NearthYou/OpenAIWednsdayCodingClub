from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_MODEL = "gpt-4.1-mini"
OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"

ANALYSIS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": [
        "overview",
        "keywords",
        "market_sentiment",
        "market_move",
        "fx_move",
        "stock_move",
        "watchlist",
        "scenarios",
        "risk_flags",
        "confidence",
        "disclaimer",
    ],
    "properties": {
        "overview": {"type": "string"},
        "keywords": {
            "type": "array",
            "minItems": 3,
            "maxItems": 8,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["term", "signal"],
                "properties": {
                    "term": {"type": "string"},
                    "signal": {"type": "string"},
                },
            },
        },
        "market_sentiment": {
            "type": "object",
            "additionalProperties": False,
            "required": ["label", "score", "reason"],
            "properties": {
                "label": {"type": "string"},
                "score": {"type": "number"},
                "reason": {"type": "string"},
            },
        },
        "market_move": {
            "type": "object",
            "additionalProperties": False,
            "required": ["direction", "summary", "affected_assets"],
            "properties": {
                "direction": {"type": "string"},
                "summary": {"type": "string"},
                "affected_assets": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
        },
        "fx_move": {
            "type": "object",
            "additionalProperties": False,
            "required": ["direction", "summary", "pairs_to_watch"],
            "properties": {
                "direction": {"type": "string"},
                "summary": {"type": "string"},
                "pairs_to_watch": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
        },
        "stock_move": {
            "type": "object",
            "additionalProperties": False,
            "required": ["summary", "sectors"],
            "properties": {
                "summary": {"type": "string"},
                "sectors": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["name", "impact", "reason"],
                        "properties": {
                            "name": {"type": "string"},
                            "impact": {"type": "string"},
                            "reason": {"type": "string"},
                        },
                    },
                },
            },
        },
        "watchlist": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["ticker", "name", "stance", "reason"],
                "properties": {
                    "ticker": {"type": "string"},
                    "name": {"type": "string"},
                    "stance": {"type": "string"},
                    "reason": {"type": "string"},
                },
            },
        },
        "scenarios": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["name", "probability", "summary"],
                "properties": {
                    "name": {"type": "string"},
                    "probability": {"type": "string"},
                    "summary": {"type": "string"},
                },
            },
        },
        "risk_flags": {
            "type": "array",
            "items": {"type": "string"},
        },
        "confidence": {"type": "string"},
        "disclaimer": {"type": "string"},
    },
}

POSITIVE_WORDS = {
    "beat",
    "growth",
    "expand",
    "optimism",
    "surge",
    "gain",
    "rally",
    "cooling inflation",
    "soft landing",
    "record",
    "strong",
    "upgrade",
}
NEGATIVE_WORDS = {
    "miss",
    "selloff",
    "slump",
    "tariff",
    "downturn",
    "recession",
    "layoff",
    "slowdown",
    "drop",
    "loss",
    "volatility",
    "risk-off",
    "geopolitical",
    "hot inflation",
}
TOPIC_LIBRARY: list[dict[str, Any]] = [
    {
        "name": "AI infrastructure",
        "terms": ["ai", "gpu", "semiconductor", "chip", "nvidia", "amd", "data center"],
        "keywords": ["AI spending", "semiconductors", "data center demand"],
        "market_bias": "up",
        "fx_bias": "mixed",
        "pairs": ["USD/JPY", "USD/KRW"],
        "sectors": [
            {
                "name": "Semiconductors",
                "impact": "positive",
                "reason": "AI capex headlines usually lift chipmakers and adjacent hardware suppliers.",
            },
            {
                "name": "Cloud software",
                "impact": "positive",
                "reason": "Enterprise AI adoption often improves sentiment for cloud and platform names.",
            },
        ],
        "watchlist": [
            {"ticker": "NVDA", "name": "NVIDIA", "stance": "watch"},
            {"ticker": "AMD", "name": "AMD", "stance": "watch"},
            {"ticker": "TSM", "name": "TSMC", "stance": "watch"},
        ],
    },
    {
        "name": "Rates and inflation",
        "terms": ["inflation", "cpi", "ppi", "fed", "federal reserve", "rate", "yield", "treasury"],
        "keywords": ["interest rates", "inflation", "treasury yields"],
        "market_bias": "mixed",
        "fx_bias": "usd_up",
        "pairs": ["EUR/USD", "USD/JPY", "USD/KRW"],
        "sectors": [
            {
                "name": "Banks",
                "impact": "mixed",
                "reason": "Rate expectations move net interest margin hopes but can tighten broader conditions.",
            },
            {
                "name": "Growth tech",
                "impact": "negative",
                "reason": "Higher yield pressure usually compresses long-duration equity valuations.",
            },
        ],
        "watchlist": [
            {"ticker": "JPM", "name": "JPMorgan Chase", "stance": "watch"},
            {"ticker": "BAC", "name": "Bank of America", "stance": "watch"},
            {"ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "stance": "watch"},
        ],
    },
    {
        "name": "Energy and commodities",
        "terms": ["oil", "crude", "energy", "opec", "gas", "commodity"],
        "keywords": ["oil prices", "energy supply", "commodity inflation"],
        "market_bias": "mixed",
        "fx_bias": "usd_up",
        "pairs": ["USD/CAD", "USD/NOK"],
        "sectors": [
            {
                "name": "Energy",
                "impact": "positive",
                "reason": "Commodity-sensitive producers tend to benefit when oil headlines support pricing.",
            },
            {
                "name": "Airlines and transports",
                "impact": "negative",
                "reason": "Higher energy costs can hurt margin expectations for fuel-sensitive sectors.",
            },
        ],
        "watchlist": [
            {"ticker": "XOM", "name": "Exxon Mobil", "stance": "watch"},
            {"ticker": "CVX", "name": "Chevron", "stance": "watch"},
            {"ticker": "SLB", "name": "SLB", "stance": "watch"},
        ],
    },
    {
        "name": "Consumer demand",
        "terms": ["consumer", "retail", "spending", "walmart", "costco", "ecommerce"],
        "keywords": ["consumer spending", "retail demand", "pricing power"],
        "market_bias": "up",
        "fx_bias": "mixed",
        "pairs": ["USD/JPY", "EUR/USD"],
        "sectors": [
            {
                "name": "Consumer discretionary",
                "impact": "positive",
                "reason": "Healthy spending headlines usually improve risk appetite toward retailers and platforms.",
            },
            {
                "name": "Staples",
                "impact": "mixed",
                "reason": "Defensive names may lag if cyclical consumer appetite improves.",
            },
        ],
        "watchlist": [
            {"ticker": "AMZN", "name": "Amazon", "stance": "watch"},
            {"ticker": "WMT", "name": "Walmart", "stance": "watch"},
            {"ticker": "COST", "name": "Costco", "stance": "watch"},
        ],
    },
]


def analyze_market_impact(article_payload: dict[str, Any]) -> dict[str, Any]:
    normalized_article = _normalize_article(article_payload)
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL

    if api_key:
        try:
            analysis = _analyze_with_openai(
                article=normalized_article,
                api_key=api_key,
                model=model,
            )
            analysis["engine"] = "openai"
            analysis["engine_warning"] = ""
            analysis["generated_at"] = _timestamp()
            return analysis
        except (HTTPError, URLError, ValueError, KeyError, json.JSONDecodeError) as exc:
            fallback = _heuristic_analysis(normalized_article)
            fallback["engine"] = "heuristic_fallback"
            fallback["engine_warning"] = f"OpenAI analysis failed and fallback mode was used: {exc}"
            fallback["generated_at"] = _timestamp()
            return fallback

    fallback = _heuristic_analysis(normalized_article)
    fallback["engine"] = "heuristic"
    fallback["engine_warning"] = (
        "OPENAI_API_KEY is not configured, so heuristic analysis mode is being used."
    )
    fallback["generated_at"] = _timestamp()
    return fallback


def _analyze_with_openai(*, article: dict[str, Any], api_key: str, model: str) -> dict[str, Any]:
    system_prompt = (
        "You are a market intelligence analyst. "
        "Summarize the article in structured JSON. "
        "Provide balanced, educational analysis only and avoid direct financial advice. "
        "Focus on market direction, FX, sector impact, watchlist ideas, risks, and confidence."
    )
    user_prompt = (
        "Analyze the following article or headline for market impact.\n\n"
        f"Title: {article['title']}\n"
        f"Source: {article['source']}\n"
        f"URL: {article['url']}\n"
        f"Content quality: {article['content_quality']}\n"
        f"Summary: {article['summary']}\n\n"
        f"Body:\n{article['body']}\n\n"
        "Return concise, evidence-based output. "
        "Watchlist items should be presented as ideas to monitor, not buy/sell instructions."
    )

    payload = {
        "model": model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "market_analysis",
                "strict": True,
                "schema": ANALYSIS_SCHEMA,
            },
        },
    }
    request = Request(
        OPENAI_CHAT_COMPLETIONS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urlopen(request, timeout=60) as response:
        response_payload = json.loads(response.read().decode("utf-8"))

    content = response_payload["choices"][0]["message"]["content"]
    if isinstance(content, list):
        content = "".join(
            chunk.get("text", "") for chunk in content if isinstance(chunk, dict)
        )

    return json.loads(content)


def _heuristic_analysis(article: dict[str, Any]) -> dict[str, Any]:
    text = " ".join(
        part for part in [article["title"], article["summary"], article["body"]] if part
    ).lower()
    matched_topics = _match_topics(text)
    keywords = _build_keywords(text, matched_topics)
    score = _score_sentiment(text)
    sentiment = _sentiment_label(score)
    market_direction = _market_direction(score, matched_topics)
    fx_direction, fx_summary, pairs = _fx_view(text, matched_topics)
    sectors = _sector_view(matched_topics, sentiment)
    watchlist = _watchlist_view(matched_topics)
    scenarios = _scenario_view(market_direction)
    risk_flags = _risk_flags(article, matched_topics)
    confidence = _confidence(article)

    return {
        "overview": _overview(article, sentiment, market_direction, matched_topics),
        "keywords": keywords,
        "market_sentiment": {
            "label": sentiment,
            "score": round(max(min(score / 5, 1), -1), 2),
            "reason": _sentiment_reason(sentiment, matched_topics, article["content_quality"]),
        },
        "market_move": {
            "direction": market_direction,
            "summary": _market_summary(market_direction, matched_topics),
            "affected_assets": _affected_assets(matched_topics, market_direction),
        },
        "fx_move": {
            "direction": fx_direction,
            "summary": fx_summary,
            "pairs_to_watch": pairs,
        },
        "stock_move": {
            "summary": _stock_summary(matched_topics, sentiment),
            "sectors": sectors,
        },
        "watchlist": watchlist,
        "scenarios": scenarios,
        "risk_flags": risk_flags,
        "confidence": confidence,
        "disclaimer": (
            "This analysis is for research support only and should not be treated as "
            "personalized investment advice."
        ),
    }


def _normalize_article(article_payload: dict[str, Any]) -> dict[str, str]:
    title = _normalize_text(str(article_payload.get("title", "")))
    summary = _normalize_text(str(article_payload.get("summary", "")))
    body = _normalize_text(str(article_payload.get("body", "") or article_payload.get("text", "")))
    source = _normalize_text(str(article_payload.get("source", ""))) or "Unknown source"
    url = _normalize_text(str(article_payload.get("url", "")))
    content_quality = _normalize_text(str(article_payload.get("content_quality", ""))) or "summary_only"
    warning = _normalize_text(str(article_payload.get("warning", "")))

    if not body:
        body = " ".join(part for part in [title, summary] if part).strip()

    return {
        "title": title or "Untitled article",
        "summary": summary or title or body[:240],
        "body": body or title,
        "source": source,
        "url": url,
        "content_quality": content_quality,
        "warning": warning,
    }


def _match_topics(text: str) -> list[dict[str, Any]]:
    matches = []
    for topic in TOPIC_LIBRARY:
        if any(_contains_term(text, term) for term in topic["terms"]):
            matches.append(topic)
    return matches


def _build_keywords(text: str, matched_topics: list[dict[str, Any]]) -> list[dict[str, str]]:
    terms: list[str] = []
    for topic in matched_topics:
        terms.extend(topic["keywords"])

    direct_terms = [
        "inflation",
        "interest rates",
        "federal reserve",
        "earnings",
        "tariffs",
        "dollar",
        "yen",
        "oil",
        "AI",
        "semiconductors",
        "consumer demand",
    ]
    for term in direct_terms:
        if _contains_term(text, term) and term not in terms:
            terms.append(term)

    if not terms:
        terms = ["market sentiment", "headline risk", "macro watch"]

    keywords = []
    for term in terms[:6]:
        keywords.append({"term": term, "signal": _keyword_signal(term.lower(), text)})
    return keywords


def _keyword_signal(term: str, text: str) -> str:
    if any(word in text for word in POSITIVE_WORDS):
        return "tailwind"
    if any(word in text for word in NEGATIVE_WORDS):
        return "risk"
    if term in {"inflation", "interest rates", "federal reserve"}:
        return "macro driver"
    return "watch"


def _score_sentiment(text: str) -> int:
    score = 0
    for word in POSITIVE_WORDS:
        if word in text:
            score += 1
    for word in NEGATIVE_WORDS:
        if word in text:
            score -= 1
    return score


def _sentiment_label(score: int) -> str:
    if score >= 2:
        return "bullish"
    if score <= -2:
        return "bearish"
    if score == 0:
        return "neutral"
    return "mixed"


def _sentiment_reason(
    sentiment: str,
    matched_topics: list[dict[str, Any]],
    content_quality: str,
) -> str:
    topic_names = ", ".join(topic["name"] for topic in matched_topics) or "broad macro themes"
    return (
        f"The article mainly maps to {topic_names}, and the current read is {sentiment}. "
        f"Confidence is adjusted for {content_quality} source depth."
    )


def _market_direction(score: int, matched_topics: list[dict[str, Any]]) -> str:
    if score >= 2:
        return "up"
    if score <= -2:
        return "down"
    if not matched_topics:
        return "uncertain"
    if any(topic["market_bias"] == "mixed" for topic in matched_topics):
        return "mixed"
    if any(topic["market_bias"] == "up" for topic in matched_topics):
        return "up"
    return "mixed"


def _market_summary(direction: str, matched_topics: list[dict[str, Any]]) -> str:
    topic_names = ", ".join(topic["name"] for topic in matched_topics) or "the current headline set"
    if direction == "up":
        return f"Risk appetite may improve if traders continue to price the {topic_names} narrative positively."
    if direction == "down":
        return f"Risk assets may stay pressured while investors digest the {topic_names} headline."
    if direction == "mixed":
        return f"The market read looks mixed because the {topic_names} narrative can help one group of assets while hurting another."
    return "The headline alone is not strong enough to imply a confident broad-market direction."


def _affected_assets(matched_topics: list[dict[str, Any]], direction: str) -> list[str]:
    assets = ["S&P 500", "Nasdaq 100"]
    if any(topic["name"] == "Rates and inflation" for topic in matched_topics):
        assets.extend(["US Treasuries", "US Dollar"])
    if any(topic["name"] == "Energy and commodities" for topic in matched_topics):
        assets.append("Crude Oil")
    if direction in {"mixed", "uncertain"}:
        assets.append("Defensive sectors")
    return assets[:5]


def _fx_view(text: str, matched_topics: list[dict[str, Any]]) -> tuple[str, str, list[str]]:
    pairs = ["USD/JPY", "EUR/USD"]
    if matched_topics:
        pairs = list(
            dict.fromkeys(pair for topic in matched_topics for pair in topic["pairs"])
        )[:4]

    if any(token in text for token in ["rate hike", "hot inflation", "yield", "hawkish"]):
        return (
            "usd_strength",
            "A firmer rates backdrop can support the dollar and pressure other major currencies.",
            pairs,
        )
    if any(token in text for token in ["rate cut", "slowdown", "recession", "risk-off"]):
        return (
            "usd_mixed",
            "Growth worries can create a mixed FX setup where safe-haven demand offsets softer rate expectations.",
            pairs,
        )
    if any(topic["fx_bias"] == "usd_up" for topic in matched_topics):
        return (
            "usd_strength",
            "This headline leans toward a stronger-dollar interpretation because of its macro or commodity linkage.",
            pairs,
        )
    return (
        "mixed",
        "FX impact is present but not dominant, so the clearest read is to monitor major dollar pairs for confirmation.",
        pairs,
    )


def _sector_view(
    matched_topics: list[dict[str, Any]],
    sentiment: str,
) -> list[dict[str, str]]:
    sectors: list[dict[str, str]] = []
    for topic in matched_topics:
        sectors.extend(topic["sectors"])

    if not sectors:
        sectors = [
            {
                "name": "Large-cap equities",
                "impact": "mixed",
                "reason": "The headline is relevant, but the sector read remains broad and non-specific.",
            },
            {
                "name": "Defensive sectors",
                "impact": "positive" if sentiment == "bearish" else "mixed",
                "reason": "Defensives tend to gain attention when headline clarity is limited.",
            },
        ]

    unique: list[dict[str, str]] = []
    seen_names: set[str] = set()
    for sector in sectors:
        name = sector["name"]
        if name in seen_names:
            continue
        unique.append(sector)
        seen_names.add(name)
    return unique[:4]


def _watchlist_view(matched_topics: list[dict[str, Any]]) -> list[dict[str, str]]:
    watchlist: list[dict[str, str]] = []
    for topic in matched_topics:
        for item in topic["watchlist"]:
            watchlist.append(
                {
                    **item,
                    "reason": f"Useful as a monitoring proxy for the {topic['name']} theme.",
                }
            )

    if not watchlist:
        watchlist = [
            {
                "ticker": "SPY",
                "name": "SPDR S&P 500 ETF",
                "stance": "watch",
                "reason": "Broad-market proxy to gauge whether the headline has durable index impact.",
            },
            {
                "ticker": "QQQ",
                "name": "Invesco QQQ Trust",
                "stance": "watch",
                "reason": "Growth-heavy proxy for checking whether macro or tech sentiment is intensifying.",
            },
        ]

    unique: list[dict[str, str]] = []
    seen = set()
    for item in watchlist:
        ticker = item["ticker"]
        if ticker in seen:
            continue
        unique.append(item)
        seen.add(ticker)
    return unique[:5]


def _scenario_view(direction: str) -> list[dict[str, str]]:
    if direction == "up":
        return [
            {
                "name": "Base case",
                "probability": "55%",
                "summary": "Risk appetite improves and cyclicals lead the move.",
            },
            {
                "name": "Bull case",
                "probability": "25%",
                "summary": "The headline triggers a stronger follow-through rally across growth assets.",
            },
            {
                "name": "Bear case",
                "probability": "20%",
                "summary": "The market fades the initial reaction because underlying data stay mixed.",
            },
        ]
    if direction == "down":
        return [
            {
                "name": "Base case",
                "probability": "50%",
                "summary": "Investors stay defensive and headline-sensitive assets remain under pressure.",
            },
            {
                "name": "Bear case",
                "probability": "30%",
                "summary": "Selling broadens as macro concerns spill into multiple sectors.",
            },
            {
                "name": "Recovery case",
                "probability": "20%",
                "summary": "Losses stabilize if the market decides the headline impact is temporary.",
            },
        ]
    return [
        {
            "name": "Base case",
            "probability": "50%",
            "summary": "Sector rotation dominates while indexes stay range-bound.",
        },
        {
            "name": "Upside case",
            "probability": "25%",
            "summary": "A favorable interpretation lifts the most exposed sectors.",
        },
        {
            "name": "Downside case",
            "probability": "25%",
            "summary": "Investors lean risk-off if follow-up data contradict the initial read.",
        },
    ]


def _risk_flags(article: dict[str, str], matched_topics: list[dict[str, Any]]) -> list[str]:
    flags = []
    if article["content_quality"] != "full_text":
        flags.append("Analysis confidence is lower because the source content is limited.")
    if article["warning"]:
        flags.append(article["warning"])
    if not matched_topics:
        flags.append("The article does not map cleanly to a single dominant market theme.")
    flags.append("Cross-check with price action and official macro data before acting on the narrative.")
    return flags[:4]


def _confidence(article: dict[str, str]) -> str:
    if article["content_quality"] == "full_text" and len(article["body"]) >= 1500:
        return "high"
    if article["content_quality"] in {"full_text", "summary_only"}:
        return "medium"
    return "low"


def _overview(
    article: dict[str, str],
    sentiment: str,
    market_direction: str,
    matched_topics: list[dict[str, Any]],
) -> str:
    topic_names = ", ".join(topic["name"] for topic in matched_topics) or "macro headline flow"
    return (
        f"{article['source']} coverage suggests a {sentiment} to {market_direction} market read, "
        f"with the main transmission path running through {topic_names}."
    )


def _stock_summary(matched_topics: list[dict[str, Any]], sentiment: str) -> str:
    topic_names = ", ".join(topic["name"] for topic in matched_topics) or "broader equity sentiment"
    return (
        f"Stocks most tied to {topic_names} should react first, while the broader tape follows "
        f"through only if the {sentiment} narrative is confirmed by additional data."
    )


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _contains_term(text: str, term: str) -> bool:
    pattern = rf"(?<![a-z0-9]){re.escape(term.lower())}(?![a-z0-9])"
    return re.search(pattern, text) is not None


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
