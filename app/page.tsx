import { CompanyCard } from "@/components/company-card";
import { buildSearchResult } from "@/lib/search-service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await buildSearchResult(params.q);

  return (
    <main className="page-shell">
      <section className="hero">
        <span className="hero__badge">Keyword-Based Market Explorer</span>
        <h1>키워드로 기업과 시장 흐름을 한 화면에서 탐색한다.</h1>
        <p>
          특정 산업 키워드나 회사명을 넣으면 관련 상장사, 연결 이유, 최근 주가 흐름, 뉴스 헤드라인을 한 번에 보여준다.
          복잡한 트레이딩 화면이 아니라 초보자도 맥락을 읽기 쉬운 탐색형 UI로 설계했다.
        </p>

        <form className="search-panel" action="/" method="get">
          <div className="search-form">
            <input
              className="search-input"
              type="text"
              name="q"
              defaultValue={result.query}
              placeholder="예: AI, 반도체, 전기차 배터리, 로봇, 원전, 클라우드, 엔비디아"
            />
            <button className="search-button" type="submit">
              관련 기업 보기
            </button>
          </div>

          <div className="chip-row">
            {result.suggestions.map((suggestion) => (
              <a className="chip" key={suggestion} href={`/?q=${encodeURIComponent(suggestion)}`}>
                {suggestion}
              </a>
            ))}
          </div>
        </form>

        <div className="disclaimer-badge">투자 권유 아님 · 키워드 기반 분석/탐색용 서비스</div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <h2>{result.isDemo ? "예시 탐색 요약" : `"${result.query}" 키워드 요약`}</h2>
          <p>{result.summary}</p>
        </article>

        <aside className="theme-card">
          <h2>연결된 산업 맥락</h2>
          <p>검색어를 산업 키워드와 회사 연결 신호로 해석해 가장 가까운 테마를 먼저 정리했다.</p>
          <div className="theme-list">
            {result.themes.map((theme) => (
              <span key={theme.id} className="theme-pill">
                {theme.label}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="related-keyword-section">
        <div className="results-headline">
          <div>
            <h2>연관 키워드 추천</h2>
            <p>처음 검색한 키워드를 더 좁히거나 넓혀서 다시 탐색할 수 있는 추천어다.</p>
          </div>
          <p>추천 키워드는 현재 검색 결과의 산업 맥락과 대표 기업을 기준으로 만든다.</p>
        </div>

        <div className="related-keyword-grid">
          {result.relatedKeywords.map((keyword) => (
            <a key={keyword.term} className="related-keyword-card" href={`/?q=${encodeURIComponent(keyword.term)}`}>
              <strong>{keyword.term}</strong>
              <span>{keyword.reason}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="results-section">
        <div className="results-headline">
          <div>
            <h2>관련 상장 회사</h2>
            <p>{result.companies.length ? `검색 키워드와 연결된 ${result.companies.length}개 기업` : "표시할 결과가 없다."}</p>
          </div>
          <p>최근가와 등락률은 Yahoo Finance 기반 최근 1개월 데이터를 사용한다.</p>
        </div>

        {result.companies.length ? (
          <div className="results-grid">
            {result.companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              결과가 없을 때는 산업 키워드로 더 넓게 검색하는 편이 좋다. 예를 들어 &quot;AI&quot;, &quot;반도체&quot;,
              &quot;클라우드&quot;처럼 검색하면 관련 기업군을 먼저 파악할 수 있다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
