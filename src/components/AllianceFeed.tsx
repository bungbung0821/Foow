import { useState } from 'react';
import { Building2, MessageSquare, ShieldAlert, Award, Star, Search, RefreshCw, ArrowRightLeft, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer, RatingRecord, RatingCriteria } from '../types';
import { CRITERIA_LABELS } from '../data/mockCustomers';

interface AllianceFeedProps {
  customers: Customer[];
  onSelectCustomerById: (customerId: string) => void;
}

const ALLIANCE_STORES = [
  { name: '마포 양지순대국', type: '한식', desc: '해장국 및 순대 전문 주방 마감 이른 매장', bg: 'bg-amber-100/50 dark:bg-amber-950/20 text-amber-700' },
  { name: '라치오 오스테리아', type: '양식', desc: '이탈리안 퀴진 주말 저녁 단체 비중 높음', bg: 'bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-700' },
  { name: '도쿄스시 신촌점', type: '일식', desc: '닷찌 중심 조용한 정통스시 룸 예약제', bg: 'bg-blue-100/50 dark:bg-blue-950/20 text-blue-700' },
  { name: '클라우드 인더스트리 카페', type: '카페/디저트', desc: '스페셜티 드립 및 대형 디저트 라운지', bg: 'bg-purple-100/50 dark:bg-purple-950/20 text-purple-700' },
  { name: '소맥포차 밤거리', type: '술집/주점', desc: '이자카야 스타일 단골 고객 주류 회전 매장', bg: 'bg-rose-100/50 dark:bg-rose-950/20 text-rose-700' },
];

export default function AllianceFeed({ customers, onSelectCustomerById }: AllianceFeedProps) {
  const [selectedStore, setSelectedStore] = useState<string | 'ALL'>('ALL');

  // 모든 고객의 모든 개별 평가지 데이터 플랫 수집 및 평정 업소 매칭
  const allSharedRatings: Array<{
    customerId: string;
    customerName: string;
    phoneSuffix: string;
    rating: RatingRecord;
  }> = [];

  customers.forEach(cust => {
    cust.ratings.forEach(rate => {
      allSharedRatings.push({
        customerId: cust.id,
        customerName: cust.name,
        phoneSuffix: cust.phoneSuffix,
        rating: rate,
      });
    });
  });

  // 최신 일자순으로 피드 정렬
  const sortedRatings = [...allSharedRatings].sort((a, b) => b.rating.date.localeCompare(a.rating.date));

  // 업장 필터가 켜졌을 시 해당 필터 적용
  const filteredRatings = selectedStore === 'ALL'
    ? sortedRatings
    : sortedRatings.filter(item => item.rating.restaurantName === selectedStore);

  // 기준 평균 계산 보조
  const getAverageScore = (criteria: RatingCriteria) => {
    const val = (criteria.bookingTime + criteria.earlyNotice + criteria.staffResponse + criteria.storeManner + criteria.tableCleanup + criteria.recommendRevisit) / 6;
    return Math.round(val * 10) / 10;
  };

  const getBadges = (score: number) => {
    if (score >= 4.5) return <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5"><Award className="w-2.5 h-2.5" /> 매너 VIP</span>;
    if (score < 2.5) return <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" /> 대면 주의</span>;
    return null;
  };

  return (
    <div id="alliance-shared-dashboard" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
      
      {/* 얼라이언스 시냅스 네트워크 상단 개요 */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4.5">
        <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-750 dark:text-indigo-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-tight inline-block mb-2">
          연동 중인 제휴 네트워크 가동 중
        </span>
        <h2 className="text-base font-black text-slate-850 dark:text-slate-150 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
          <span>점주 연합 실시간 장부 공유 피드 (Mutual Feed)</span>
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          배달앱 평점처럼 점주 연합망(Alliance Network)에 등록된 식당끼리 평점 정보를 공유하여 노쇼 예방 및 우수 기부 고객 서비스를 통합 제고합니다.
        </p>
      </div>

      {/* 가입한 연합 매장 현황 브리핑 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>현재 지역 연합 가입점 현황 (5개 점포 실시간 공유 중)</span>
          <span className="text-[10px] text-emerald-500 font-mono">● LIVE SYNCED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {ALLIANCE_STORES.map(store => {
            const reviewsCount = sortedRatings.filter(item => item.rating.restaurantName === store.name).length;
            const isSelected = selectedStore === store.name;
            return (
              <button
                type="button"
                id={`btn-alliance-store-${store.name.replace(/\s+/g, '-')}`}
                key={store.name}
                onClick={() => setSelectedStore(isSelected ? 'ALL' : store.name)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400/80 shadow-xs'
                    : 'bg-slate-50/65 dark:bg-slate-950/30 border-slate-100 dark:border-slate-850 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">{store.type}</span>
                  <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-sm font-bold font-mono">
                    공유 {reviewsCount}건
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-105 block mt-1 truncate">
                  {store.name}
                </span>
                <span className="text-[9.5px] text-slate-400 block mt-0.5 leading-snug line-clamp-2">
                  {store.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 실시간 평점 공유 피드 목록 */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>실시간 연동 공유 피드 {selectedStore === 'ALL' ? '' : `(${selectedStore})`}</span>
          </h3>

          {selectedStore !== 'ALL' && (
            <button
              id="btn-clear-store-filter"
              onClick={() => setSelectedStore('ALL')}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline"
            >
              전체 제휴점 피드 보기
            </button>
          )}
        </div>

        {filteredRatings.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">해당 매장에서 공유한 최근 방문 기록이 아직 존재하지 않습니다.</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredRatings.map(item => {
              const avg = getAverageScore(item.rating.criteria);
              return (
                <div
                  key={item.rating.id}
                  id={`alliance-feed-item-${item.rating.id}`}
                  className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2.5 hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between flex-wrap gap-2 text-xs">
                    {/* 상점 타이틀 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-indigo-600 text-white font-extrabold text-[9.5px] px-1.5 py-0.5 rounded-sm">
                        {item.rating.restaurantName}
                      </span>
                      {item.rating.restaurantType && (
                        <span className="text-[10px] text-slate-400">({item.rating.restaurantType})</span>
                      )}
                      <span className="text-slate-300">|</span>
                      <span className="font-mono text-slate-400 text-[10.5px]">{item.rating.date}</span>
                    </div>

                    {/* 피평가 대상 고객 링크 */}
                    <button
                      type="button"
                      id={`feed-customer-link-${item.customerId}`}
                      onClick={() => onSelectCustomerById(item.customerId)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <span>{item.customerName} (끝자리 *{item.phoneSuffix})</span>
                      <span className="text-slate-400 text-[10px] font-normal font-mono">상세 장부 ↗</span>
                    </button>
                  </div>

                  {/* 세부 별점 결과 바 */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-mono font-bold ml-1 text-slate-800 dark:text-slate-200">
                          {avg.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 hidden sm:block">
                        ({CRITERIA_LABELS.bookingTime}: {item.rating.criteria.bookingTime} · {CRITERIA_LABELS.storeManner}: {item.rating.criteria.storeManner})
                      </div>
                    </div>

                    {getBadges(avg)}
                  </div>

                  {/* 피드 메모 내용 */}
                  {item.rating.memo && (
                    <div className="flex gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-350 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal line-clamp-2">
                        {item.rating.memo}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 협약 수호자 시스템 흐름 설명 가이드 보드 */}
      <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11.5px] text-slate-500 space-y-2.5">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>협약 매장 간 상호 정보 보호 정책 가이드</span>
        </span>
        <p className="leading-snug">
          본 평점 연합은 소상공인 점주들의 정당한 운영권을 수호하기 위해 설계되었습니다. 등록된 모든 평가 장부는 연합 연계 보안 인증을 거쳐 대외 고객 실물 개인정보 무단 공유 없이 <strong>전화번호 뒷번호(4자리)</strong>와 <strong>예약 고유번호</strong>를 조합 매칭하여 상호 전자기록으로 대조합니다.
        </p>
      </div>

    </div>
  );
}
