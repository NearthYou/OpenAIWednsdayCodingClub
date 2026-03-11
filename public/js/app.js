import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);
const appConfig = window.__APP_CONFIG__ ?? {};

function cx(...tokens) {
  return tokens.filter(Boolean).join(" ");
}

function formatPublishedAt(value) {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPercent(value, total) {
  if (!total) {
    return "0%";
  }
  return `${Math.round((value / total) * 100)}%`;
}

function Badge({ label, tone = "neutral" }) {
  return html`<span className=${cx("badge", `tone-${tone}`)}>${label}</span>`;
}

function MetricCard({ label, value, note }) {
  return html`
    <article className="metric-card">
      <span className="metric-label">${label}</span>
      <strong className="metric-value">${value}</strong>
      <p className="metric-note">${note}</p>
    </article>
  `;
}

function DonutChart({ segments, total }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offsetCursor = 0;

  return html`
    <article className="viz-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Coverage</p>
          <h3>Region mix</h3>
        </div>
        <span className="subtle-copy">${total} articles</span>
      </div>
      <div className="donut-shell">
        <svg viewBox="0 0 140 140" className="donut-chart" aria-hidden="true">
          <circle cx="70" cy="70" r=${radius} className="donut-track"></circle>
          ${segments.map((segment) => {
            const ratio = total ? segment.value / total : 0;
            const length = circumference * ratio;
            const dashArray = `${length} ${circumference - length}`;
            const dashOffset = -offsetCursor;
            offsetCursor += length;
            return html`
              <circle
                key=${segment.label}
                cx="70"
                cy="70"
                r=${radius}
                className="donut-segment"
                stroke=${segment.color}
                strokeDasharray=${dashArray}
                strokeDashoffset=${dashOffset}
              ></circle>
            `;
          })}
        </svg>
        <div className="donut-center">
          <strong>${total}</strong>
          <span>stories</span>
        </div>
      </div>
      <div className="legend-list">
        ${segments.map(
          (segment) => html`
            <div key=${segment.label} className="legend-item">
              <span className="legend-dot" style=${{ "--dot-color": segment.color }}></span>
              <span>${segment.label}</span>
              <strong>${segment.value}</strong>
            </div>
          `,
        )}
      </div>
    </article>
  `;
}

function StackedTone({ breakdown, total }) {
  const rows = [
    { key: "positive", label: "Positive", color: "#31d0aa" },
    { key: "neutral", label: "Neutral", color: "#8798ba" },
    { key: "negative", label: "Negative", color: "#ff6b7a" },
  ];

  return html`
    <article className="viz-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Tone</p>
          <h3>Headline balance</h3>
        </div>
      </div>
      <div className="stack-bar">
        ${rows.map((row) => {
          const value = breakdown[row.key] ?? 0;
          return html`
            <span
              key=${row.key}
              className="stack-segment"
              style=${{
                "--segment-width": `${total ? (value / total) * 100 : 0}%`,
                "--segment-color": row.color,
              }}
            ></span>
          `;
        })}
      </div>
      <div className="tone-grid">
        ${rows.map((row) => {
          const value = breakdown[row.key] ?? 0;
          return html`
            <div key=${row.key} className="tone-tile">
              <span style=${{ color: row.color }}>${row.label}</span>
              <strong>${value}</strong>
              <p>${formatPercent(value, total)}</p>
            </div>
          `;
        })}
      </div>
    </article>
  `;
}

function FeedChart({ feeds, total }) {
  return html`
    <article className="viz-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Sources</p>
          <h3>Feed intensity</h3>
        </div>
      </div>
      <div className="bar-list">
        ${feeds.length
          ? feeds.map(
              (feed) => html`
                <div key=${feed.label} className="bar-row">
                  <div className="bar-meta">
                    <span>${feed.label}</span>
                    <strong>${feed.count}</strong>
                  </div>
                  <div className="bar-track">
                    <span
                      className="bar-fill"
                      style=${{ "--bar-width": `${total ? (feed.count / total) * 100 : 0}%` }}
                    ></span>
                  </div>
                </div>
              `,
            )
          : html`<p className="empty-inline">No source data yet.</p>`}
      </div>
    </article>
  `;
}

function OverviewPanel({ summary, totalArticles, selectedNews, onAnalyzeSelected, isAnalyzing }) {
  const regionSegments = [
    { label: "Global", value: summary.region_counts.global ?? 0, color: "#4d89ff" },
    { label: "Korea", value: summary.region_counts.korea ?? 0, color: "#31d0aa" },
  ];

  return html`
    <section className="tab-grid">
      <div className="viz-grid">
        <${DonutChart} segments=${regionSegments} total=${totalArticles} />
        <${StackedTone} breakdown=${summary.sentiment_breakdown} total=${totalArticles} />
        <${FeedChart} feeds=${summary.top_feeds} total=${totalArticles} />
      </div>
      <article className="focus-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Selected story</p>
            <h3>${selectedNews ? selectedNews.title : "No article selected"}</h3>
          </div>
          ${selectedNews
            ? html`
                <${Badge}
                  label=${selectedNews.region === "korea" ? "Korea" : "Global"}
                  tone=${selectedNews.region === "korea" ? "positive" : "neutral"}
                />
              `
            : null}
        </div>
        ${selectedNews
          ? html`
              <p className="body-copy">${selectedNews.summary}</p>
              <div className="meta-grid">
                <div>
                  <span>Source</span>
                  <strong>${selectedNews.source}</strong>
                </div>
                <div>
                  <span>Feed</span>
                  <strong>${selectedNews.feed_label}</strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>${formatPublishedAt(selectedNews.published_at)}</strong>
                </div>
              </div>
              <div className="action-row">
                <button className="primary-button" type="button" onClick=${onAnalyzeSelected} disabled=${isAnalyzing}>
                  ${isAnalyzing ? "Analyzing..." : "Analyze selected"}
                </button>
                <a className="ghost-link" href=${selectedNews.link} target="_blank" rel="noreferrer">
                  Open source
                </a>
              </div>
            `
          : html`<p className="empty-inline">Pick a story in the News tab to populate this area.</p>`}
      </article>
    </section>
  `;
}

function NewsPanel({
  query,
  market,
  regionFilter,
  setQuery,
  setRegionFilter,
  loadNews,
  newsState,
  deferredItems,
  selectedNews,
  setSelectedNewsIndex,
  onAnalyzeSelected,
  isAnalyzing,
}) {
  return html`
    <section className="split-layout">
      <article className="panel-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">News radar</p>
            <h3>Fast filter</h3>
          </div>
          <button className="secondary-button" type="button" onClick=${() => loadNews()} disabled=${newsState.loading}>
            ${newsState.loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <form
          className="query-form"
          onSubmit=${(event) => {
            event.preventDefault();
            loadNews(query, market);
          }}
        >
          <input
            className="text-input dark-input"
            type="text"
            value=${query}
            placeholder="Search macro, FX, semiconductors, Korea..."
            onInput=${(event) => setQuery(event.target.value)}
          />
          <div className="chip-row">
            ${["all", "global", "korea"].map(
              (option) => html`
                <button
                  key=${option}
                  type="button"
                  className=${cx("tab-chip", market === option && "active")}
                  onClick=${() => loadNews(query, option)}
                >
                  ${option}
                </button>
              `,
            )}
          </div>
          <div className="chip-row compact">
            ${["all", "global", "korea"].map(
              (option) => html`
                <button
                  key=${option}
                  type="button"
                  className=${cx("filter-pill", regionFilter === option && "active")}
                  onClick=${() => setRegionFilter(option)}
                >
                  ${option === "all" ? "All stories" : `${option} only`}
                </button>
              `,
            )}
          </div>
        </form>

        ${newsState.error ? html`<p className="inline-error">${newsState.error}</p>` : null}

        <div className="story-list">
          ${deferredItems.length
            ? deferredItems.slice(0, 10).map(
                (item, index) => html`
                  <button
                    key=${`${item.title}-${index}`}
                    type="button"
                    className=${cx("story-card", selectedNews?.title === item.title && "active")}
                    onClick=${() => setSelectedNewsIndex(index)}
                  >
                    <div className="story-topline">
                      <${Badge}
                        label=${item.language === "ko" ? "KO" : "EN"}
                        tone=${item.language === "ko" ? "positive" : "neutral"}
                      />
                      <span>${item.source}</span>
                      <span>${formatPublishedAt(item.published_at)}</span>
                    </div>
                    <strong>${item.title}</strong>
                    <p>${item.summary}</p>
                  </button>
                `,
              )
            : html`<p className="empty-inline">No stories match the current filter.</p>`}
        </div>
      </article>

      <article className="panel-card detail-panel">
        <div className="card-head">
          <div>
            <p className="eyebrow">Story detail</p>
            <h3>${selectedNews ? "Summary and actions" : "Waiting for selection"}</h3>
          </div>
        </div>
        ${selectedNews
          ? html`
              <div className="detail-summary">
                <h4>${selectedNews.title}</h4>
                <p className="body-copy">${selectedNews.summary}</p>
              </div>
              <div className="meta-grid">
                <div>
                  <span>Region</span>
                  <strong>${selectedNews.region}</strong>
                </div>
                <div>
                  <span>Language</span>
                  <strong>${selectedNews.language}</strong>
                </div>
                <div>
                  <span>Feed</span>
                  <strong>${selectedNews.feed_label}</strong>
                </div>
              </div>
              <div className="action-row">
                <button className="primary-button" type="button" onClick=${onAnalyzeSelected} disabled=${isAnalyzing}>
                  ${isAnalyzing ? "Analyzing..." : "Send to analysis"}
                </button>
                <a className="ghost-link" href=${selectedNews.link} target="_blank" rel="noreferrer">
                  Open source
                </a>
              </div>
            `
          : html`<p className="empty-inline">Select a story from the left to review it here.</p>`}
      </article>
    </section>
  `;
}

function AnalysisPanel({
  analysis,
  article,
  manualMode,
  setManualMode,
  manualInput,
  updateManualInput,
  analyzeManualInput,
  analysisState,
}) {
  return html`
    <section className="split-layout">
      <article className="panel-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Analysis input</p>
            <h3>Manual article lab</h3>
          </div>
          <div className="chip-row">
            ${["text", "url"].map(
              (option) => html`
                <button
                  key=${option}
                  type="button"
                  className=${cx("tab-chip", manualMode === option && "active")}
                  onClick=${() => setManualMode(option)}
                >
                  ${option}
                </button>
              `,
            )}
          </div>
        </div>
        <div className="form-stack">
          <label className="field">
            <span>Title</span>
            <input
              className="text-input dark-input"
              type="text"
              value=${manualInput.title}
              onInput=${(event) => updateManualInput("title", event.target.value)}
              placeholder="Optional but useful for context"
            />
          </label>
          ${manualMode === "text"
            ? html`
                <label className="field">
                  <span>Article body</span>
                  <textarea
                    className="text-area dark-input"
                    value=${manualInput.text}
                    onInput=${(event) => updateManualInput("text", event.target.value)}
                    placeholder="Paste a story or a condensed article summary"
                  ></textarea>
                </label>
              `
            : html`
                <label className="field">
                  <span>Article URL</span>
                  <input
                    className="text-input dark-input"
                    type="url"
                    value=${manualInput.url}
                    onInput=${(event) => updateManualInput("url", event.target.value)}
                    placeholder="https://..."
                  />
                </label>
              `}
          <button className="primary-button full-width" type="button" onClick=${analyzeManualInput} disabled=${analysisState.loading}>
            ${analysisState.loading ? "Analyzing..." : "Run analysis"}
          </button>
        </div>
      </article>

      <article className="panel-card detail-panel">
        <div className="card-head">
          <div>
            <p className="eyebrow">Summary</p>
            <h3>${analysis ? "Analysis snapshot" : "No analysis yet"}</h3>
          </div>
          ${analysis
            ? html`
                <div className="chip-row">
                  <${Badge} label=${analysis.engine} tone=${analysis.engine === "openai" ? "positive" : "warning"} />
                  <${Badge} label=${analysis.confidence} tone="neutral" />
                </div>
              `
            : null}
        </div>

        ${analysisState.error ? html`<p className="inline-error">${analysisState.error}</p>` : null}

        ${analysis
          ? html`
              <div className="summary-panel">
                <h4>${article?.title || "Analysis result"}</h4>
                <p className="body-copy">${analysis.overview}</p>
                <div className="summary-strip">
                  <span>Sentiment ${analysis.market_sentiment.label}</span>
                  <span>Market ${analysis.market_move.direction}</span>
                  <span>FX ${analysis.fx_move.direction}</span>
                </div>
              </div>

              <div className="accordion-list">
                <details className="accordion-card" open>
                  <summary>Key signals</summary>
                  <div className="tag-cloud">
                    ${analysis.keywords.map(
                      (keyword) => html`
                        <div key=${keyword.term} className="signal-chip">
                          <strong>${keyword.term}</strong>
                          <span>${keyword.signal}</span>
                        </div>
                      `,
                    )}
                  </div>
                </details>

                <details className="accordion-card">
                  <summary>Sector impact</summary>
                  <div className="accordion-body">
                    ${analysis.stock_move.sectors.map(
                      (sector) => html`
                        <div key=${sector.name} className="impact-item">
                          <div className="impact-item-head">
                            <strong>${sector.name}</strong>
                            <span>${sector.impact}</span>
                          </div>
                          <p>${sector.reason}</p>
                        </div>
                      `,
                    )}
                  </div>
                </details>

                <details className="accordion-card">
                  <summary>Watchlist and scenarios</summary>
                  <div className="accordion-body dual-stack">
                    <div className="stack-card">
                      ${analysis.watchlist.map(
                        (item) => html`
                          <div key=${item.ticker} className="watch-item">
                            <strong>${item.ticker}</strong>
                            <span>${item.name}</span>
                            <p>${item.reason}</p>
                          </div>
                        `,
                      )}
                    </div>
                    <div className="stack-card">
                      ${analysis.scenarios.map(
                        (scenario) => html`
                          <div key=${scenario.name} className="watch-item">
                            <strong>${scenario.name}</strong>
                            <span>${scenario.probability}</span>
                            <p>${scenario.summary}</p>
                          </div>
                        `,
                      )}
                    </div>
                  </div>
                </details>

                <details className="accordion-card">
                  <summary>Risk review</summary>
                  <ul className="risk-list">
                    ${analysis.risk_flags.map((flag) => html`<li key=${flag}>${flag}</li>`)}
                  </ul>
                </details>
              </div>
            `
          : html`<p className="empty-inline">Use a selected story or paste your own article to populate this panel.</p>`}
      </article>
    </section>
  `;
}

function App() {
  const [health, setHealth] = useState({
    openaiConfigured: appConfig.openaiConfigured ?? false,
    defaultNewsQuery: appConfig.defaultNewsQuery ?? "",
    defaultModel: appConfig.defaultModel ?? "",
  });
  const [activeView, setActiveView] = useState("overview");
  const [query, setQuery] = useState(appConfig.defaultNewsQuery ?? "");
  const [market, setMarket] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [newsState, setNewsState] = useState({
    loading: false,
    error: "",
    items: [],
    summary: {
      total: 0,
      region_counts: { global: 0, korea: 0 },
      language_counts: {},
      sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 },
      top_feeds: [],
    },
  });
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0);
  const [manualMode, setManualMode] = useState("text");
  const [manualInput, setManualInput] = useState({
    title: "",
    url: "",
    text: "",
  });
  const [analysisState, setAnalysisState] = useState({
    loading: false,
    error: "",
    result: null,
  });
  const newsControllerRef = useRef(null);
  const analyzeControllerRef = useRef(null);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data) => {
        React.startTransition(() => setHealth(data));
      })
      .catch(() => null);

    loadNews(appConfig.defaultNewsQuery ?? query, "all");

    return () => {
      newsControllerRef.current?.abort();
      analyzeControllerRef.current?.abort();
    };
  }, []);

  function loadNews(nextQuery = query, nextMarket = market) {
    newsControllerRef.current?.abort();
    const controller = new AbortController();
    newsControllerRef.current = controller;

    setNewsState((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    fetch(
      `/api/news?query=${encodeURIComponent(nextQuery)}&market=${encodeURIComponent(nextMarket)}&limit=18`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load news.");
        }
        return response.json();
      })
      .then((data) => {
        React.startTransition(() => {
          setNewsState({
            loading: false,
            error: "",
            items: data.items ?? [],
            summary:
              data.summary ?? {
                total: 0,
                region_counts: { global: 0, korea: 0 },
                language_counts: {},
                sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 },
                top_feeds: [],
              },
          });
          setSelectedNewsIndex(0);
          setMarket(nextMarket);
          setRegionFilter(nextMarket === "all" ? "all" : nextMarket);
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        React.startTransition(() => {
          setNewsState((current) => ({
            ...current,
            loading: false,
            error: error.message,
            items: [],
          }));
        });
      });
  }

  function updateManualInput(field, value) {
    setManualInput((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function runAnalysis(payload) {
    analyzeControllerRef.current?.abort();
    const controller = new AbortController();
    analyzeControllerRef.current = controller;

    setAnalysisState((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Analysis request failed.");
        }
        return data;
      })
      .then((data) => {
        React.startTransition(() => {
          setAnalysisState({
            loading: false,
            error: "",
            result: data,
          });
          setActiveView("analysis");
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        React.startTransition(() => {
          setAnalysisState({
            loading: false,
            error: error.message,
            result: null,
          });
        });
      });
  }

  const filteredItems = useMemo(() => {
    if (regionFilter === "all") {
      return newsState.items;
    }
    return newsState.items.filter((item) => item.region === regionFilter);
  }, [newsState.items, regionFilter]);
  const deferredItems = useDeferredValue(filteredItems);
  const selectedNews = deferredItems[selectedNewsIndex] ?? deferredItems[0] ?? null;

  useEffect(() => {
    setSelectedNewsIndex(0);
  }, [regionFilter]);

  function analyzeSelectedNews() {
    if (!selectedNews) {
      return;
    }

    runAnalysis({
      title: selectedNews.title,
      source: selectedNews.source,
      summary: selectedNews.summary,
    });
  }

  function analyzeManualInput() {
    if (manualMode === "url") {
      runAnalysis({ title: manualInput.title, url: manualInput.url });
      return;
    }
    runAnalysis({ title: manualInput.title, text: manualInput.text });
  }

  const analysis = analysisState.result?.analysis ?? null;
  const article = analysisState.result?.article ?? null;
  const totalArticles = newsState.summary.total ?? newsState.items.length;

  return html`
    <main className="page-shell">
      <header className="hero-frame">
        <div>
          <p className="eyebrow">Market Sense Lab</p>
          <h1>Dark dashboard for global and Korean market news.</h1>
          <p className="hero-copy">
            Summary comes first, detail stays separate, and every interaction is built to reduce
            wait time and scrolling.
          </p>
        </div>
        <div className="hero-badge-row">
          <${Badge}
            label=${health.openaiConfigured ? "OpenAI active" : "Fallback mode"}
            tone=${health.openaiConfigured ? "positive" : "warning"}
          />
          <${Badge} label=${`Model ${health.defaultModel || "unset"}`} tone="neutral" />
          <${Badge} label="Global + Korea feeds" tone="neutral" />
        </div>
      </header>

      <section className="metric-grid">
        <${MetricCard} label="Total stories" value=${String(totalArticles)} note="Balanced global and Korea feed mix" />
        <${MetricCard}
          label="Global stories"
          value=${String(newsState.summary.region_counts.global ?? 0)}
          note={`${newsState.summary.language_counts.en ?? 0} English stories`}
        />
        <${MetricCard}
          label="Korea stories"
          value=${String(newsState.summary.region_counts.korea ?? 0)}
          note={`${newsState.summary.language_counts.ko ?? 0} Korean stories`}
        />
        <${MetricCard}
          label="Analysis engine"
          value=${analysis?.engine || (health.openaiConfigured ? "openai" : "heuristic")}
          note="Abortable fetch keeps repeated clicks responsive"
        />
      </section>

      <nav className="tab-nav" aria-label="Dashboard sections">
        ${[
          { id: "overview", label: "Overview" },
          { id: "news", label: "News Radar" },
          { id: "analysis", label: "Analysis Lab" },
        ].map(
          (tab) => html`
            <button
              key=${tab.id}
              type="button"
              className=${cx("view-tab", activeView === tab.id && "active")}
              onClick=${() => setActiveView(tab.id)}
            >
              ${tab.label}
            </button>
          `,
        )}
      </nav>

      ${activeView === "overview"
        ? html`
            <${OverviewPanel}
              summary=${newsState.summary}
              totalArticles=${totalArticles}
              selectedNews=${selectedNews}
              onAnalyzeSelected=${analyzeSelectedNews}
              isAnalyzing=${analysisState.loading}
            />
          `
        : null}

      ${activeView === "news"
        ? html`
            <${NewsPanel}
              query=${query}
              market=${market}
              regionFilter=${regionFilter}
              setQuery=${setQuery}
              setRegionFilter=${setRegionFilter}
              loadNews=${loadNews}
              newsState=${newsState}
              deferredItems=${deferredItems}
              selectedNews=${selectedNews}
              setSelectedNewsIndex=${setSelectedNewsIndex}
              onAnalyzeSelected=${analyzeSelectedNews}
              isAnalyzing=${analysisState.loading}
            />
          `
        : null}

      ${activeView === "analysis"
        ? html`
            <${AnalysisPanel}
              analysis=${analysis}
              article=${article}
              manualMode=${manualMode}
              setManualMode=${setManualMode}
              manualInput=${manualInput}
              updateManualInput=${updateManualInput}
              analyzeManualInput=${analyzeManualInput}
              analysisState=${analysisState}
            />
          `
        : null}
    </main>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
