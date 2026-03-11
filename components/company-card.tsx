import { compactDateTime, currencyFormatter, percentFormatter } from "@/lib/format";
import { CompanyInsight, RiskGuideItem } from "@/lib/types";

import { Sparkline } from "./sparkline";

interface CompanyCardProps {
  company: CompanyInsight;
}

const riskLevelLabel: Record<RiskGuideItem["level"], string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

function RiskBox({ label, risk }: { label: string; risk: RiskGuideItem }) {
  return (
    <div className={`risk-box risk-box--${risk.level}`}>
      <div className="risk-box__header">
        <span>{label}</span>
        <strong>{riskLevelLabel[risk.level]}</strong>
      </div>
      <p>{risk.summary}</p>
      <ul>
        {risk.factors.slice(0, 3).map((factor) => (
          <li key={`${label}-${factor}`}>{factor}</li>
        ))}
      </ul>
    </div>
  );
}

export function CompanyCard({ company }: CompanyCardProps) {
  const priceFormatter = currencyFormatter(company.currency);
  const changeRate = company.changeRate === null ? null : percentFormatter.format(company.changeRate / 100);
  const changeTone = company.changeRate === null ? "neutral" : company.changeRate >= 0 ? "up" : "down";

  return (
    <article className="company-card">
      <div className="company-card__header">
        <div>
          <p className="company-card__eyebrow">
            {company.market} · {company.ticker}
          </p>
          <h3>{company.name}</h3>
        </div>
        <span className={`pill pill--${changeTone}`}>{changeRate ?? "변동률 없음"}</span>
      </div>

      <p className="company-card__reason">{company.relationship}</p>

      <div className="company-card__stats">
        <div>
          <span>최근가</span>
          <strong>{company.currentPrice !== null ? priceFormatter.format(company.currentPrice) : "데이터 없음"}</strong>
        </div>
        <div>
          <span>설명</span>
          <strong>{company.description}</strong>
        </div>
      </div>

      <div className="company-card__chart">
        <div className="section-label">최근 주가 흐름</div>
        <Sparkline points={company.chartPoints} />
        <p className="chart-note">{company.marketNote ?? "시장 메모 없음"}</p>
      </div>

      <div className="company-card__risk">
        <div className="section-label">매수/매도 시 위험도 가이드</div>
        <p className="risk-copy">{company.riskGuide.disclaimer}</p>
        <div className="risk-grid">
          <RiskBox label="매수 진입 위험도" risk={company.riskGuide.buy} />
          <RiskBox label="매도 판단 위험도" risk={company.riskGuide.sell} />
        </div>
      </div>

      <div className="company-card__news">
        <div className="section-label">관련 뉴스 헤드라인</div>
        {company.news.length ? (
          <ul>
            {company.news.map((headline) => (
              <li key={`${company.id}-${headline.link}-${headline.title}`}>
                <a href={headline.link} target="_blank" rel="noreferrer">
                  {headline.title}
                </a>
                <span>
                  {headline.source} · {compactDateTime(headline.publishedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-copy">최근 헤드라인을 불러오지 못했다.</p>
        )}
      </div>
    </article>
  );
}
