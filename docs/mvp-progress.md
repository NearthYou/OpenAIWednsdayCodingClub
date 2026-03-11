# 일정 캘린더 MVP 진행 문서

## 목표

- 덕후 일정 통합 플랫폼의 "일정 캘린더 페이지" 단일 MVP를 구현한다.
- `frontend`는 React, `backend`는 Node.js + Express로 분리한다.
- mock 데이터만으로도 바로 실행 가능해야 한다.

## 범위

- 월간 캘린더 뷰
- 선택 날짜 기준 일정 리스트
- 검색창
- 관심 키워드 칩
- 카테고리/출처 유형 필터
- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/keywords`

## 우선순위

1. 워크스페이스 재구성
2. 백엔드 mock 데이터와 필터 API 구현
3. 프론트 캘린더/리스트/필터 UI 구현
4. 에러/빈 상태 처리
5. README와 실행 검증

## 진행 상태

- [x] 기존 프로젝트 구조 검토
- [x] 구현 계획 문서 생성
- [x] 루트 워크스페이스 설정 정리
- [x] 백엔드 API 및 mock 데이터 구현
- [x] 프론트 일정 캘린더 페이지 구현
- [x] 실행 방법 및 확장 포인트 문서화
- [x] 빌드와 기본 동작 검증

## 메모

- 검색은 자연어 완전 이해 대신 포함 검색 중심으로 처리한다.
- API 실패 시 프론트는 fallback mock 데이터를 사용한다.
- source type은 `official`, `community`, `rumor`로 분리하고 `isOfficial`을 별도로 유지한다.
- `winget`으로 Node.js LTS를 설치했고 `npm install`, `npm run typecheck`, `npm run build`까지 검증했다.
- 개발 서버는 `npm run dev`로 기동했고 `http://localhost:5173`, `http://localhost:4000` 응답을 확인했다.
