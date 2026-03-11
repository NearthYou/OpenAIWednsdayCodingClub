# 덕통사고

팬덤 일정, 굿즈 오픈, 홈 대시보드를 한 흐름으로 연결한 React + Express 기반 데모 앱입니다.  
로그인 후 취향 키워드를 고르고, 홈에서 추천 일정과 곧 마감 항목을 보고, 상세 캘린더와 굿즈 탐색 화면으로 이어지는 구조를 확인할 수 있습니다.

## 현재 구현 범위

- 로그인 / 회원가입 / 세션 복구
- 첫 로그인 온보딩과 관심 키워드 추천
- 홈 대시보드
  - 오늘의 덕질 문장 랜덤 노출
  - 구독 일정, 곧 마감, 홈 검색 결과
  - 상세 캘린더 기반 저장 일정과 웹 검색 결과 결합
- 상세 캘린더
  - 월간 캘린더 + 날짜별 일정 리스트
  - 검색어 / 카테고리 / 출처 유형 / 관심 키워드 필터
  - 저장한 일정 날짜 강조 표시
- 일정 상세 페이지
  - OpenAI 요약 또는 규칙 기반 fallback 요약
  - 내 일정 저장
  - 좋아요 / 링크 복사 / 외부 링크 이동
- 굿즈 탐색 페이지
  - 예약 / 현장 판매 / 재입고 흐름 탐색
  - 판매 방식 / 출처 / 관심 키워드 필터
- 마이 페이지
  - 프로필 카드
  - 저장한 예정 일정 목록과 페이지네이션
  - 처음 고른 취향 키워드 확인

## 프로젝트 구조

- `frontend/` : React 19 + Vite + TypeScript UI
- `backend/` : Express API 서버
- `docs/` : MVP 진행 문서

## 기술 스택

- Frontend: React 19, Vite 6, TypeScript
- Backend: Node.js, Express
- AI: OpenAI Responses API 기반 일정 요약
- State/Storage: 브라우저 `localStorage` 기반 세션 토큰 / 저장 일정

## 빠른 실행

```bash
npm install
npm run dev
```

- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:4000`

## 환경 변수

루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```bash
OPENAI_API_KEY=
OPENAI_SUMMARY_MODEL=gpt-4.1-mini
VITE_API_BASE_URL=http://localhost:4000
```

설명:

- `OPENAI_API_KEY`
  - 일정 상세 요약을 실제 OpenAI 응답으로 생성할 때 사용합니다.
  - 값이 없거나 호출에 실패하면 프론트는 규칙 기반 요약으로 자동 fallback 됩니다.
- `OPENAI_SUMMARY_MODEL`
  - 백엔드 일정 요약 생성에 사용할 모델입니다.
- `VITE_API_BASE_URL`
  - 프론트엔드가 호출할 API 서버 주소입니다.

## 데모 로그인

기본 로그인 폼에는 아래 계정이 미리 채워져 있습니다.

- 이메일: `demo@ducking.club`
- 비밀번호: `demo1234`

회원가입 후 첫 로그인에서는 최소 3개의 취향 키워드를 선택해야 온보딩이 완료됩니다.

## 개발 스크립트

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run build:vercel
npm run typecheck
```

## 주요 API

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `PATCH /api/auth/subscriptions`
- `PATCH /api/auth/onboarding`

### Events

- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/events/:id/summary`

예시:

```bash
GET /api/events?month=2026-03&search=젠레스&category=anime_game&sourceType=official&keyword=젠레스
```

### Goods

- `GET /api/goods`
- `GET /api/goods/:id`

### Home

- `GET /api/home/dashboard`
- `GET /api/home/search?q=원신`

### Keywords

- `GET /api/keywords`
- `POST /api/keywords/recommendations`

## 현재 UX 메모

- 홈 / 상세 캘린더 / 굿즈 탐색 히어로는 감성 카피와 일러스트 카드가 함께 보이도록 구성돼 있습니다.
- `곧 마감` 카드는 마감일이 가까워질수록 은은하게 붉어지고 `오늘 마감`, `D-2` 같은 배지가 표시됩니다.
- `내 캘린더 추가`는 `.ics` 다운로드가 아니라 로컬 `내 일정` 저장 흐름으로 동작합니다.
- 저장한 일정은 상세 캘린더 날짜 강조와 마이 페이지 예정 일정 목록에 함께 반영됩니다.

## 배포/확장 포인트

- 현재 인증 / 사용자 데이터 / 저장 일정은 데모 성격의 in-memory + localStorage 흐름입니다.
- 실서비스 전환 시 아래 영역을 우선 교체하는 것이 좋습니다.
  - `backend/src/repositories/*` : DB 영속화
  - `backend/src/services/auth-service.js` : 실제 사용자 인증 연동
  - `frontend/src/utils/saved-schedules.ts` : 서버 저장 일정 API 연동
  - `backend/src/services/home-web-search-service.js` : 검색 제공자 안정화

## 참고

- 상세 화면 AI 요약은 백엔드에서 OpenAI를 호출합니다.
- 프론트엔드는 빌드 전에 `npm run typecheck --workspace frontend` 기준으로 검증하는 흐름을 권장합니다.
