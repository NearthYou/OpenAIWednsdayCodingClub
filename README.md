# 덕후 일정 통합 플랫폼 MVP

해커톤용 일정 캘린더 페이지 MVP입니다. 프론트엔드는 React, 백엔드는 Node.js + Express로 분리되어 있으며 mock 데이터만으로 바로 실행됩니다.

## 구조

- `frontend`: React + Vite 일정 캘린더 페이지
- `backend`: Express API 서버
- `docs/mvp-progress.md`: 요구사항, 우선순위, 진행 상태

## 실행

```bash
npm install
npm run dev
```

- 프론트엔드: `http://localhost:5173`
- 백엔드 API: `http://localhost:4000`

## 주요 API

- `GET /api/events?month=2026-03&search=블루아카&category=anime_game&sourceType=official&keyword=블루아카`
- `GET /api/events/:id`
- `GET /api/keywords`

## 주요 기능

- 월간 캘린더와 선택 날짜 기준 일정 리스트
- 검색어, 관심 키워드, 카테고리, 출처 유형 동시 필터링
- 공식 / 비공식 / 루머 배지 표시
- 출처명과 링크 표시
- 로딩 상태, 빈 상태, API 실패 fallback 처리

## 개발 스크립트

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run typecheck
```

## 확장 포인트

- `backend/src/repositories`를 DB 레이어로 교체해 영속 저장소 연결
- `backend/src/services/event-service.js`에 중복 제거, 정규화 규칙 추가
- `frontend/src/api/client.ts`에서 인증, 캐싱, 상세 모달 API 연결 확장
- 관심 키워드 저장 기능과 사용자별 설정 API 추가
