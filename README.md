# Market Sense Lab

글로벌 경제 뉴스와 한국어 뉴스, 사용자가 넣은 기사 본문을 바탕으로 주식 관련 키워드, 예상 시장 변동, 환율 영향, 주가 시나리오, 관심 종목 후보를 시각화 중심 대시보드로 보여주는 웹앱입니다.

## What It Does
- 최신 경제/주식 뉴스를 RSS로 자동 수집합니다.
- 글로벌 뉴스와 한국어 뉴스, 한국 언론사 RSS를 함께 수집합니다.
- 기사 URL 또는 기사 본문을 직접 넣어서 분석할 수 있습니다.
- 키워드 추출, 시장 심리, 환율 영향, 주가/섹터 영향, 관심 종목 후보를 구조화해서 보여줍니다.
- 다크 테마 기반 대시보드와 차트형 요약 카드로 핵심 흐름을 빠르게 파악할 수 있습니다.
- `OPENAI_API_KEY`가 있으면 OpenAI 기반 분석을 사용하고, 없으면 휴리스틱 fallback 분석을 사용합니다.
- 모든 진행 상황은 [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)에 기록됩니다.

## Tech Stack
- Backend: `Flask`
- Frontend: `React` via browser-loaded ES modules
- Parsing: `BeautifulSoup`
- AI integration: OpenAI Chat Completions API with structured JSON output
- News sources: Google News RSS, Yonhap Economy RSS, ETNews RSS

## Local Setup
1. 의존성을 설치합니다.

```bash
py -m pip install -r requirements.txt
```

2. `.env.example`을 참고해 `.env`를 만듭니다.

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEWS_QUERY_DEFAULT=economy OR stock market OR inflation OR federal reserve
FLASK_APP=app.py
FLASK_ENV=development
```

3. 서버를 실행합니다.

```bash
py app.py
```

4. 브라우저에서 `http://127.0.0.1:5000`을 엽니다.

## Test
스모크 테스트는 아래 명령으로 실행합니다.

```bash
py -m unittest discover -s tests -v
```

## Key Endpoints
- `GET /api/health`
- `GET /api/news?query=...&limit=8`
- `POST /api/article/resolve`
- `POST /api/analyze`

## Notes
- 자동 뉴스는 Google News RSS 기반이라 전체 본문 대신 헤드라인 중심으로 들어올 수 있습니다.
- 한국 뉴스는 Google News Korea와 한국 언론사 RSS를 함께 사용합니다.
- URL 기반 본문 추출은 언론사 차단 정책이나 페이지 구조에 따라 제한될 수 있습니다.
- 결과는 투자 참고용 분석이며 개인화된 투자 조언이 아닙니다.
