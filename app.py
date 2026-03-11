from __future__ import annotations

import os
from typing import Any

from flask import Flask, jsonify, render_template, request

from services.analysis_service import analyze_market_impact
from services.article_service import resolve_article_content
from services.news_service import fetch_latest_news

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - fallback for minimal environments
    def load_dotenv() -> bool:
        return False


load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__, static_folder="public", static_url_path="")
    app.config["OPENAI_MODEL"] = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    app.config["NEWS_QUERY_DEFAULT"] = os.getenv(
        "NEWS_QUERY_DEFAULT",
        "economy OR stock market OR inflation OR federal reserve",
    )

    register_routes(app)
    return app


def register_routes(app: Flask) -> None:
    @app.get("/")
    def index() -> str:
        frontend_config: dict[str, Any] = {
            "openaiConfigured": bool(os.getenv("OPENAI_API_KEY")),
            "defaultNewsQuery": app.config["NEWS_QUERY_DEFAULT"],
            "defaultModel": app.config["OPENAI_MODEL"],
            "supportedMarkets": ["all", "global", "korea"],
        }
        return render_template("index.html", frontend_config=frontend_config)

    @app.get("/api/health")
    def health() -> Any:
        return jsonify(
            {
                "ok": True,
                "service": "market-intelligence-dashboard",
                "openaiConfigured": bool(os.getenv("OPENAI_API_KEY")),
                "defaultNewsQuery": app.config["NEWS_QUERY_DEFAULT"],
                "defaultModel": app.config["OPENAI_MODEL"],
                "supportedMarkets": ["all", "global", "korea"],
            }
        )

    @app.get("/api/news")
    def news() -> Any:
        query = request.args.get("query", app.config["NEWS_QUERY_DEFAULT"]).strip()
        market = request.args.get("market", "all").strip().lower() or "all"

        try:
            limit = int(request.args.get("limit", 8))
        except ValueError:
            limit = 8

        limit = max(1, min(limit, 24))
        payload = fetch_latest_news(query=query, limit=limit, market=market)

        return jsonify(
            {
                "ok": True,
                "query": query,
                "market": market,
                "items": payload["items"],
                "summary": payload["summary"],
            }
        )

    @app.post("/api/article/resolve")
    def article_resolve() -> Any:
        payload = request.get_json(silent=True) or {}

        try:
            article = resolve_article_content(
                title=str(payload.get("title", "")).strip(),
                url=str(payload.get("url", "")).strip(),
                text=str(payload.get("text", "")).strip(),
            )
        except ValueError as exc:
            return jsonify({"ok": False, "error": str(exc)}), 400
        except Exception as exc:  # pragma: no cover - integration failure
            return (
                jsonify(
                    {
                        "ok": False,
                        "error": "Failed to resolve article content.",
                        "details": str(exc),
                    }
                ),
                502,
            )

        return jsonify({"ok": True, "article": article})

    @app.post("/api/analyze")
    def analyze() -> Any:
        payload = request.get_json(silent=True) or {}
        title = str(payload.get("title", "")).strip()
        source = str(payload.get("source", "")).strip()
        url = str(payload.get("url", "")).strip()
        summary = str(payload.get("summary", "")).strip()
        body = str(payload.get("body", "")).strip()
        text = str(payload.get("text", "")).strip()

        if text or url:
            try:
                article = resolve_article_content(title=title, url=url, text=text)
            except ValueError as exc:
                return jsonify({"ok": False, "error": str(exc)}), 400
            except Exception as exc:  # pragma: no cover - integration failure
                if title or summary or body:
                    article = {
                        "title": title or "Selected article",
                        "source": source or "RSS headline",
                        "url": url,
                        "summary": summary or title,
                        "body": body or summary or title,
                        "mode": "headline_fallback",
                        "content_quality": "summary_only",
                        "warning": (
                            "Article URL extraction failed, so analysis fell back to "
                            "headline and summary only."
                        ),
                        "resolution_details": str(exc),
                    }
                else:
                    return (
                        jsonify(
                            {
                                "ok": False,
                                "error": "Failed to resolve article content.",
                                "details": str(exc),
                            }
                        ),
                        502,
                    )
        else:
            if not (title or summary or body):
                return (
                    jsonify(
                        {
                            "ok": False,
                            "error": "Provide article text, URL, or at least a headline.",
                        }
                    ),
                    400,
                )

            article = {
                "title": title or "Selected headline",
                "source": source or "RSS headline",
                "url": url,
                "summary": summary or title,
                "body": body or " ".join(part for part in [title, summary] if part).strip(),
                "mode": "headline_metadata",
                "content_quality": "headline_only" if not body else "summary_only",
                "warning": (
                    "This analysis is based on headline metadata rather than full article text."
                ),
            }

        analysis = analyze_market_impact(article)
        return jsonify({"ok": True, "article": article, "analysis": analysis})


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
