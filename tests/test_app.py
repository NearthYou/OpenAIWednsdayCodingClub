import os
import unittest
from unittest.mock import patch

from app import app


class AppSmokeTests(unittest.TestCase):
    def setUp(self) -> None:
        app.testing = True
        self.client = app.test_client()

    def test_health_endpoint(self) -> None:
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        self.assertIn("defaultModel", response.json)

    def test_news_endpoint_with_stubbed_feed(self) -> None:
        fake_payload = {
            "items": [
                {
                    "title": "Rates cool and stocks climb",
                    "link": "https://example.com/article",
                    "source": "Example News",
                    "published_at": "Wed, 11 Mar 2026 13:00:00 GMT",
                    "summary": "Investors reacted positively to softer inflation data.",
                    "region": "global",
                    "language": "en",
                    "feed_label": "Google News Global",
                    "sentiment_score": 1,
                },
                {
                    "title": "환율 안정 기대에 코스피 반등",
                    "link": "https://example.kr/article",
                    "source": "연합뉴스",
                    "published_at": "Wed, 11 Mar 2026 14:00:00 +0900",
                    "summary": "원화 변동성이 완화되며 투자심리가 회복됐다.",
                    "region": "korea",
                    "language": "ko",
                    "feed_label": "Yonhap Economy",
                    "sentiment_score": 1,
                },
            ],
            "summary": {
                "total": 2,
                "region_counts": {"global": 1, "korea": 1},
                "language_counts": {"en": 1, "ko": 1},
                "sentiment_breakdown": {"positive": 2, "neutral": 0, "negative": 0},
                "top_feeds": [{"label": "Yonhap Economy", "count": 1}],
            },
        }

        with patch("app.fetch_latest_news", return_value=fake_payload):
            response = self.client.get("/api/news?limit=1")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        self.assertEqual(len(response.json["items"]), 2)
        self.assertEqual(response.json["items"][0]["source"], "Example News")
        self.assertEqual(response.json["summary"]["region_counts"]["korea"], 1)
        self.assertEqual(response.json["items"][1]["language"], "ko")

    def test_article_resolve_from_manual_text(self) -> None:
        response = self.client.post(
            "/api/article/resolve",
            json={
                "title": "Cooling inflation supports growth stocks",
                "text": (
                    "Investors welcomed signs of cooling inflation. Treasury yields moved "
                    "lower and growth shares outperformed after policymakers signaled a "
                    "possible path toward lower rates later this year."
                ),
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        self.assertEqual(response.json["article"]["mode"], "manual_text")
        self.assertEqual(response.json["article"]["content_quality"], "full_text")

    def test_analyze_endpoint_returns_structured_result(self) -> None:
        with patch.dict(os.environ, {"OPENAI_API_KEY": ""}, clear=False):
            response = self.client.post(
                "/api/analyze",
                json={
                    "title": "AI demand lifts semiconductor outlook",
                    "text": (
                        "Chip demand improved as enterprises expanded AI infrastructure "
                        "spending. Investors grew more optimistic about data center "
                        "demand and semiconductor orders."
                    ),
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["ok"])
        self.assertEqual(response.json["analysis"]["engine"], "heuristic")
        self.assertIn("watchlist", response.json["analysis"])
        self.assertGreater(len(response.json["analysis"]["watchlist"]), 0)

    def test_energy_article_does_not_false_match_ai_theme(self) -> None:
        with patch.dict(os.environ, {"OPENAI_API_KEY": ""}, clear=False):
            response = self.client.post(
                "/api/analyze",
                json={
                    "title": "Oil prices rise as supply concerns persist",
                    "text": (
                        "Crude prices climbed as supply concerns and geopolitical risk "
                        "pushed energy markets higher. Energy stocks outperformed while "
                        "airlines lagged on cost worries."
                    ),
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["analysis"]["watchlist"][0]["ticker"], "XOM")
        self.assertEqual(
            response.json["analysis"]["stock_move"]["sectors"][0]["name"],
            "Energy",
        )


if __name__ == "__main__":
    unittest.main()
