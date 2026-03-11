const eventInfo = {
  title: "블루밍 스테이지 팬 페스타 2026",
  date: "2026.03.14 토요일 18:00",
  venue: "서울 코엑스 라이브홀",
  category: "팬 이벤트",
  source: "공식 X 계정 + 공식 홈페이지 공지",
  trust: "공식",
  summary:
    "사전 응모 당첨자 입장형 팬 이벤트예요. 현장 굿즈 판매는 오후 1시부터 시작되고, 포토존은 행사 종료 후 1시간까지 운영됩니다.",
  alerts: [
    "응모 마감은 3월 12일 밤 11시 59분",
    "실물 신분증과 모바일 티켓 모두 필요",
    "한정 포토카드는 현장 수령만 가능"
  ],
  actions: [
    "내 캘린더에 추가",
    "굿즈 알림 받기",
    "친구와 공유하기"
  ]
};

const timeline = [
  { time: "13:00", label: "현장 굿즈 판매 시작", tone: "gold" },
  { time: "15:00", label: "입장 대기열 오픈", tone: "teal" },
  { time: "18:00", label: "메인 팬 이벤트 시작", tone: "coral" },
  { time: "20:30", label: "포토존 자유 관람", tone: "teal" }
];

const chatter = [
  {
    kind: "assistant",
    text: "이 일정은 공식 계정 공지와 장소 예약 공지가 일치해서 신뢰도가 높아요."
  },
  {
    kind: "user",
    text: "팬 입장에서 꼭 챙길 포인트만 짧게 알려줘."
  },
  {
    kind: "assistant",
    text: "응모 마감, 신분증 지참, 한정 특전 수령 시간을 먼저 챙기면 됩니다."
  }
];

function App() {
  return (
    <main className="app-shell">
      <section className="page-frame">
        <header className="hero-card">
          <div>
            <p className="eyebrow">Page 3 / Event Detail</p>
            <h1>{eventInfo.title}</h1>
            <p className="hero-copy">
              팬들이 가장 궁금해하는 일정 정보, 공식 여부, AI 요약, 행동 버튼을 한 화면에서
              바로 확인하는 상세 페이지입니다.
            </p>
          </div>
          <div className="hero-badges">
            <span className="pill pill-coral">{eventInfo.category}</span>
            <span className="pill pill-dark">{eventInfo.trust}</span>
          </div>
        </header>

        <section className="content-grid">
          <article className="panel info-panel">
            <div className="panel-header">
              <h2>이벤트 정보</h2>
              <span className="status-dot">LIVE</span>
            </div>

            <dl className="info-list">
              <div>
                <dt>일정</dt>
                <dd>{eventInfo.date}</dd>
              </div>
              <div>
                <dt>장소</dt>
                <dd>{eventInfo.venue}</dd>
              </div>
              <div>
                <dt>출처</dt>
                <dd>{eventInfo.source}</dd>
              </div>
            </dl>

            <div className="trust-box">
              <p className="trust-label">신뢰도 분석</p>
              <strong>공식 공지 기반으로 검증된 일정</strong>
              <p>
                여러 팬 커뮤니티에서 재가공된 게시물과 비교했을 때 날짜, 장소, 응모 방식이 모두
                동일하게 확인됩니다.
              </p>
            </div>

            <div className="action-list">
              {eventInfo.actions.map((action) => (
                <button key={action} type="button" className="action-button">
                  {action}
                </button>
              ))}
            </div>
          </article>

          <article className="panel summary-panel">
            <div className="panel-header">
              <h2>AI 요약</h2>
              <span className="mini-tag">팬 시점 정리</span>
            </div>

            <p className="summary-copy">{eventInfo.summary}</p>

            <div className="alert-box">
              <p className="alert-title">꼭 챙길 포인트</p>
              <ul>
                {eventInfo.alerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            </div>

            <div className="chat-preview">
              {chatter.map((message, index) => (
                <div
                  key={`${message.kind}-${index}`}
                  className={`bubble bubble-${message.kind}`}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="bottom-grid">
          <article className="panel timeline-panel">
            <div className="panel-header">
              <h2>당일 타임라인</h2>
              <span className="mini-tag">현장 동선</span>
            </div>

            <div className="timeline">
              {timeline.map((item) => (
                <div key={`${item.time}-${item.label}`} className="timeline-row">
                  <span className={`timeline-badge tone-${item.tone}`}>{item.time}</span>
                  <div className="timeline-copy">
                    <strong>{item.label}</strong>
                    <p>도착 시간과 특전 수령 동선을 미리 체크해두면 훨씬 편해요.</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel recommendation-panel">
            <div className="panel-header">
              <h2>추천 액션</h2>
              <span className="mini-tag">덕질 플랜</span>
            </div>

            <div className="recommend-card featured">
              <p>우선순위 1</p>
              <strong>응모 마감 알림부터 저장</strong>
              <span>마감 시간이 가장 빠른 항목이에요.</span>
            </div>
            <div className="recommend-row">
              <div className="recommend-card">
                <p>우선순위 2</p>
                <strong>굿즈 발매 체크</strong>
                <span>현장 판매 품절 가능성이 높아요.</span>
              </div>
              <div className="recommend-card">
                <p>우선순위 3</p>
                <strong>동행 친구 공유</strong>
                <span>입장 시간 맞추기 좋습니다.</span>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export default App;
