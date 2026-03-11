import Parser from "rss-parser";
import YahooFinance from "yahoo-finance2";

import { Company, NewsHeadline, PricePoint } from "@/lib/types";

const yahooFinance = new YahooFinance();
const parser = new Parser();

const dedupeNews = (headlines: NewsHeadline[]) => {
  const seen = new Set<string>();
  return headlines.filter((headline) => {
    const key = headline.title.trim().toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const getPriceSnapshot = async (ticker: string) => {
  try {
    const chart = await yahooFinance.chart(ticker, {
      period1: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      interval: "1d",
    });

    const quotes = chart.quotes
      .filter((quote) => typeof quote.close === "number")
      .map((quote) => ({
        date: quote.date.toISOString(),
        close: Number(quote.close?.toFixed(2)),
      })) satisfies PricePoint[];

    const first = quotes[0];
    const last = quotes.at(-1);

    return {
      currency: chart.meta.currency ?? null,
      currentPrice: last?.close ?? null,
      changeRate:
        first && last && first.close !== 0 ? Number((((last.close - first.close) / first.close) * 100).toFixed(2)) : null,
      chartPoints: quotes,
      marketNote:
        quotes.length > 1 ? `${quotes.length}개 거래일 기준 최근 1개월 흐름` : "최근 시세 데이터를 충분히 불러오지 못했다.",
    };
  } catch {
    return {
      currency: null,
      currentPrice: null,
      changeRate: null,
      chartPoints: [] as PricePoint[],
      marketNote: "시세 데이터를 불러오지 못했다.",
    };
  }
};

const getYahooNews = async (company: Company) => {
  try {
    const result = await yahooFinance.search(company.name, {
      quotesCount: 0,
      newsCount: 6,
      lang: company.country === "KR" ? "ko-KR" : "en-US",
      region: company.country === "KR" ? "KR" : "US",
    });

    return result.news.map((article) => ({
      title: article.title,
      link: article.link,
      source: article.publisher,
      publishedAt: article.providerPublishTime ? article.providerPublishTime.toISOString() : null,
    })) satisfies NewsHeadline[];
  } catch {
    return [] as NewsHeadline[];
  }
};

const getGoogleNews = async (company: Company, keyword: string) => {
  try {
    const searchTerm = encodeURIComponent(`${company.name} ${keyword}`);
    const region = company.country === "KR" ? "KR:ko" : "US:en";
    const url = `https://news.google.com/rss/search?q=${searchTerm}&hl=${region.split(":")[1]}&gl=${
      region.split(":")[0]
    }&ceid=${region}`;
    const feed = await parser.parseURL(url);

    return feed.items.map((item) => ({
      title: item.title ?? "제목 없음",
      link: item.link ?? "#",
      source: "Google News",
      publishedAt: item.isoDate ?? item.pubDate ?? null,
    })) satisfies NewsHeadline[];
  } catch {
    return [] as NewsHeadline[];
  }
};

export const getNewsHeadlines = async (company: Company, keyword: string) => {
  const yahooNews = await getYahooNews(company);
  if (yahooNews.length >= 3) {
    return dedupeNews(yahooNews).slice(0, 3);
  }

  const googleNews = await getGoogleNews(company, keyword);
  return dedupeNews([...yahooNews, ...googleNews]).slice(0, 3);
};
