import { useDeferredValue, useEffect, useState } from "react";
import { fetchGoods, fetchKeywords } from "../api/client";
import { GoodsFilterPanel } from "../components/GoodsFilterPanel";
import { GoodsReleaseCard } from "../components/GoodsReleaseCard";
import { KeywordSubscriptionChips } from "../components/KeywordSubscriptionChips";
import { SearchBar } from "../components/SearchBar";
import { GOODS_RELEASE_OPTIONS } from "../constants/goods-options";
import { SOURCE_TYPE_OPTIONS } from "../constants/filter-options";
import { fallbackKeywords } from "../data/fallback-data";
import { fallbackGoods } from "../data/goods-fallback-data";
import "../styles/goods-explore.css";
import type { InterestKeyword, SourceType } from "../types/event";
import type { GoodsItem, GoodsReleaseType } from "../types/goods";
import { formatMonthLabel, getMonthKey } from "../utils/date";
import { filterGoods } from "../utils/goods-filters";

const GOODS_PER_PAGE = 6;

function getInitialMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function toggleArrayItem<T>(items: T[], value: T) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function getFallbackGoodsByMonth(monthKey: string) {
  return fallbackGoods.filter((item) => item.startAt.slice(0, 7) === monthKey);
}

function getAllReleaseTypes() {
  return GOODS_RELEASE_OPTIONS.map((option) => option.value);
}

function getAllSourceTypes() {
  return SOURCE_TYPE_OPTIONS.map((option) => option.value);
}

export function GoodsExplorePage() {
  const [month, setMonth] = useState<Date>(() => getInitialMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReleaseTypes, setSelectedReleaseTypes] =
    useState<GoodsReleaseType[]>(getAllReleaseTypes);
  const [selectedSourceTypes, setSelectedSourceTypes] =
    useState<SourceType[]>(getAllSourceTypes);
  const [selectedInterestKeywords, setSelectedInterestKeywords] = useState<string[]>([]);
  const [fetchedGoods, setFetchedGoods] = useState<GoodsItem[]>([]);
  const [filteredGoods, setFilteredGoods] = useState<GoodsItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [interestKeywords, setInterestKeywords] = useState<InterestKeyword[]>(fallbackKeywords);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const monthKey = getMonthKey(month);

  useEffect(() => {
    let isMounted = true;

    async function loadKeywords() {
      try {
        const keywords = await fetchKeywords();

        if (isMounted) {
          setInterestKeywords(keywords);
        }
      } catch {
        if (isMounted) {
          setInterestKeywords(fallbackKeywords);
        }
      }
    }

    void loadKeywords();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadGoods() {
      setIsLoading(true);
      setNoticeMessage("");

      try {
        const goods = await fetchGoods({ month: monthKey });

        if (!isMounted) {
          return;
        }

        setFetchedGoods(goods);
        setIsUsingFallback(false);
      } catch {
        if (!isMounted) {
          return;
        }

        setFetchedGoods(getFallbackGoodsByMonth(monthKey));
        setIsUsingFallback(true);
        setNoticeMessage("API 연결에 실패해 굿즈 탐색 페이지는 mock 데이터로 표시 중입니다.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadGoods();

    return () => {
      isMounted = false;
    };
  }, [monthKey]);

  useEffect(() => {
    setFilteredGoods(
      filterGoods(fetchedGoods, {
        searchQuery: deferredSearchQuery,
        selectedReleaseTypes,
        selectedSourceTypes,
        selectedInterestKeywords
      })
    );
  }, [
    deferredSearchQuery,
    fetchedGoods,
    selectedInterestKeywords,
    selectedReleaseTypes,
    selectedSourceTypes
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, monthKey, selectedInterestKeywords, selectedReleaseTypes, selectedSourceTypes]);

  function handleReleaseTypeToggle(releaseType: GoodsReleaseType) {
    setSelectedReleaseTypes((current) => toggleArrayItem(current, releaseType));
  }

  function handleSourceTypeToggle(sourceType: SourceType) {
    setSelectedSourceTypes((current) => toggleArrayItem(current, sourceType));
  }

  function handleKeywordToggle(keyword: string) {
    setSelectedInterestKeywords((current) => toggleArrayItem(current, keyword));
  }

  const isAllFiltersSelected =
    selectedReleaseTypes.length === GOODS_RELEASE_OPTIONS.length &&
    selectedSourceTypes.length === SOURCE_TYPE_OPTIONS.length;

  function toggleAllFilters() {
    if (isAllFiltersSelected) {
      setSelectedReleaseTypes([]);
      setSelectedSourceTypes([]);
      return;
    }

    setSelectedReleaseTypes(getAllReleaseTypes());
    setSelectedSourceTypes(getAllSourceTypes());
  }

  const officialCount = filteredGoods.filter((item) => item.sourceType === "official").length;
  const directOpenCount = filteredGoods.filter((item) => item.releaseType !== "lottery").length;
  const totalPages = Math.max(1, Math.ceil(filteredGoods.length / GOODS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedGoods = filteredGoods.slice(
    (safePage - 1) * GOODS_PER_PAGE,
    safePage * GOODS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="hero-eyebrow">4번 페이지 / 굿즈 탐색</p>
          <h1 className="hero-title">예약, 현장 판매, 재입고를 한 화면에서 찾는 굿즈 탐색 페이지</h1>
          <p className="hero-description">
            메인 캘린더 구조를 유지하면서도 굿즈 발매 흐름에 맞게 카드형 탐색 화면으로 분리했습니다.
            판매 방식, 출처 유형, 관심 키워드를 조합해 이번 달 굿즈 오픈 일정을 빠르게 추릴 수 있습니다.
          </p>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <span>현재 월</span>
            <strong>{formatMonthLabel(month)}</strong>
          </div>
          <div className="hero-stat-card">
            <span>표시 굿즈</span>
            <strong>{filteredGoods.length}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>공식 출처</span>
            <strong>{officialCount}개</strong>
          </div>
          <div className="hero-stat-card">
            <span>즉시 오픈</span>
            <strong>{directOpenCount}개</strong>
          </div>
        </div>
      </section>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        eyebrow="굿즈 검색"
        helperText="아티스트, 작품명, 판매처, 태그까지 포함해서 검색합니다."
        placeholder="아이브 팝업 MD, 원신 재입고, 미쿠 한정판..."
        iconLabel="굿즈"
        inputId="goods-search"
      />

      <KeywordSubscriptionChips
        keywords={interestKeywords}
        selectedKeywords={selectedInterestKeywords}
        onToggle={handleKeywordToggle}
        onReset={() => setSelectedInterestKeywords([])}
      />

      {noticeMessage ? <div className="notice-banner">{noticeMessage}</div> : null}

      <section className="goods-layout">
        <GoodsFilterPanel
          selectedReleaseTypes={selectedReleaseTypes}
          selectedSourceTypes={selectedSourceTypes}
          filteredCount={filteredGoods.length}
          totalCount={fetchedGoods.length}
          isAllFiltersSelected={isAllFiltersSelected}
          onToggleReleaseType={handleReleaseTypeToggle}
          onToggleSourceType={handleSourceTypeToggle}
          onToggleAll={toggleAllFilters}
        />

        <section className="panel goods-board">
          <div className="goods-board__header">
            <div>
              <p className="section-eyebrow">굿즈 보드</p>
              <h2 className="section-title">{formatMonthLabel(month)} 탐색 결과</h2>
            </div>
          </div>

          <p className="goods-board__helper">
            메인 캘린더와 같은 월 기준 흐름을 유지하되, 카드형으로 굿즈 일정만 모아서 보는 화면입니다.
          </p>

          {isLoading ? <div className="state-box">굿즈 데이터를 불러오는 중입니다.</div> : null}

          {!isLoading && !filteredGoods.length ? (
            <div className="state-box state-box--empty">
              조건에 맞는 굿즈 일정이 없습니다. 필터를 바꾸거나 월을 이동해 보세요.
            </div>
          ) : null}

          {!isLoading && filteredGoods.length ? (
            <div className="goods-grid">
              {pagedGoods.map((item) => (
                <GoodsReleaseCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}

          {!isLoading && filteredGoods.length > GOODS_PER_PAGE ? (
            <div className="goods-board__footer">
              <span className="goods-board__page-status">
                {safePage} / {totalPages} 페이지
              </span>
              <div className="month-nav">
                <button
                  className="month-nav__button"
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                >
                  이전
                </button>
                <button
                  className="month-nav__button"
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safePage === totalPages}
                >
                  다음
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </section>

      {isUsingFallback ? (
        <div className="goods-footer-note">현재 백엔드 실패 대비 fallback mock 데이터가 활성화되어 있습니다.</div>
      ) : null}
    </main>
  );
}
