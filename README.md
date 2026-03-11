# Market Pulse Radar

뉴스 헤드라인을 모아서 주식 동향 키워드와 핵심 뉴스 4개를 뽑아주는 과제용 웹 서비스입니다.

## 핵심 기능

- Google News RSS 기반 뉴스 수집
- 간단한 키워드/톤 분석
- 글로벌, 빅테크, 국내 시장 탭 전환
- 핵심 뉴스 4개 카드 출력
- 실시간 수집 실패 시 데모 데이터 자동 fallback

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 됩니다.

## 프로덕션 빌드

```bash
npm run typecheck
npm run build
npm run start
```

## Vercel 배포

이 프로젝트는 기본 Next.js 설정으로 바로 배포할 수 있습니다.

```bash
npx vercel
```

또는 Vercel 대시보드에서 이 폴더를 import 하면 됩니다.

## 구조

- `app/page.tsx`: 앱 진입점
- `components/market-radar-app.tsx`: 화면 UI
- `app/api/market-brief/route.ts`: 뉴스 데이터 API
- `lib/market-brief.ts`: RSS 수집과 키워드 분석 로직

## 참고

- API 키 없이 동작하도록 RSS를 사용했습니다.
- 외부 RSS 응답이 실패하면 앱은 자동으로 데모 데이터를 보여줍니다.
