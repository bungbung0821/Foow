import { X, Calendar, Star, MessageSquare, Clipboard, User, BadgeAlert, PlusCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer, RatingCriteria } from '../types';
import { CRITERIA_LABELS, CRITERIA_DESCRIPTIONS, TAG_DETAILS } from '../data/mockCustomers';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onAddRating: () => void;
}

export default function CustomerDetail({ customer, onClose, onAddRating }: CustomerDetailProps) {
  // 각 평가 항목별 평균 점수 계산
  const getCriteriaAverages = (): Record<keyof RatingCriteria, number> => {
    const list = customer.ratings;
    const defaults: Record<keyof RatingCriteria, number> = {
      bookingTime: 0,
      earlyNotice: 0,
      staffResponse: 0,
      storeManner: 0,
      tableCleanup: 0,
      recommendRevisit: 0,
    };

    if (list.length === 0) return defaults;

    const sum = list.reduce((acc, current) => {
      const c = current.criteria;
      return {
        bookingTime: acc.bookingTime + c.bookingTime,
        earlyNotice: acc.earlyNotice + c.earlyNotice,
        staffResponse: acc.staffResponse + c.staffResponse,
        storeManner: acc.storeManner + c.storeManner,
        tableCleanup: acc.tableCleanup + c.tableCleanup,
        recommendRevisit: acc.recommendRevisit + c.recommendRevisit,
      };
    }, defaults);

    const count = list.length;
    return {
      bookingTime: Math.round((sum.bookingTime / count) * 10) / 10,
      earlyNotice: Math.round((sum.earlyNotice / count) * 10) / 10,
      staffResponse: Math.round((sum.staffResponse / count) * 10) / 10,
      storeManner: Math.round((sum.storeManner / count) * 10) / 10,
      tableCleanup: Math.round((sum.tableCleanup / count) * 10) / 10,
      recommendRevisit: Math.round((sum.recommendRevisit / count) * 10) / 10,
    };
  };

  const averages = getCriteriaAverages();

  // 별점 렌더링 도구
  const renderStars = (score: number) => {
    const totalStars = 5;
    const filledStars = Math.round(score);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalStars }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < filledStars
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200 dark:text-slate-800'
            }`}
          />
        ))}
      </div>
    );
  };

  // 점수에 따른 바 색상 지정 (1~5점 기준)
  const getBarColor = (score: number) => {
    if (score >= 4.0) return 'bg-emerald-500';
    if (score >= 3.0) return 'bg-indigo-500';
    if (score >= 2.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const panelVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <motion.div
      id={`customer-detail-panel-${customer.id}`}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-sm flex flex-col h-full"
    >
      {/* 헤더 부분 */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            id="btn-close-detail-left"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            title="목록으로 이동"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {customer.name}
              </h2>
              <span className="text-sm font-mono text-slate-400 font-semibold bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                {customer.phoneSuffix}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              최초 등록일시: {new Date(customer.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {customer.tags.map(tag => {
            const tagMeta = TAG_DETAILS[tag] || { label: tag, bg: 'bg-slate-100', color: 'text-slate-800', border: 'border-slate-200' };
            return (
              <span
                key={tag}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tagMeta.bg} ${tagMeta.color} ${tagMeta.border} shadow-2xs`}
              >
                {tagMeta.label}
              </span>
            );
          })}
          <button
            id="btn-close-detail-right"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hidden md:block cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {/* 종합 점수 및 기본 안내 */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-4.5 flex flex-col md:flex-row items-center md:items-start gap-4 justify-between">
          <div className="text-center md:text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              종합 방문 매너
            </span>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-50">
                {customer.averageScore.toFixed(1)}
              </span>
              <div className="space-y-1">
                {renderStars(customer.averageScore)}
                <span className="text-[11px] text-slate-400 block text-left">
                  누적 평가 {customer.visitsCount}건 기준
                </span>
              </div>
            </div>
          </div>

          <div className="text-slate-600 dark:text-slate-400 text-xs md:max-w-md w-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              종합 의견
            </span>
            <p className="leading-relaxed bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-lg">
              {customer.notes || '등록된 종합 의견이 없습니다. 방문 평가 시 자동으로 요약이 업데이트됩니다.'}
            </p>
          </div>
        </div>

        {/* 6개 항목 수치 세부 현황 */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3.5 flex items-center gap-1.5">
            <Clipboard className="w-4 h-4 text-indigo-500" />
            <span>상세 행동 요건별 별점 평가 평균</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4.5 rounded-xl">
            {(Object.keys(CRITERIA_LABELS) as Array<keyof RatingCriteria>).map(key => {
              const score = averages[key];
              const pct = (score / 5) * 100;
              return (
                <div key={key} id={`criteria-stat-${key}`} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {CRITERIA_LABELS[key]}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {score.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(score)} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {CRITERIA_DESCRIPTIONS[key]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 개별 평가지 타임라인 목록 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>방문 기록 타임라인 ({customer.ratings.length}건)</span>
            </h3>

            <button
              id="btn-detail-add-evaluation"
              onClick={onAddRating}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              방문 기록 추가
            </button>
          </div>

          {customer.ratings.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400">아직 등록된 방문 세부 평가가 없습니다.</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {[...customer.ratings]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record, index) => (
                  <div
                    key={record.id}
                    id={`timeline-item-${record.id}`}
                    className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3"
                  >
                    {/* 타임라인 원소 헤더 */}
                    <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {record.date}
                        </span>
                        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-semibold border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
                          <span className="font-bold">{record.restaurantName || '공유 연합 매장'}</span>
                          {record.restaurantType && (
                            <span className="text-[10px] opacity-75">· {record.restaurantType}</span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          예약번호: {record.bookingNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>작성자: {record.raterName}</span>
                      </div>
                    </div>

                    {/* 평가 기록 요소별 평점 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-lg">
                      {(Object.keys(CRITERIA_LABELS) as Array<keyof RatingCriteria>).map(key => {
                        const val = record.criteria[key];
                        return (
                          <div key={key} className="text-center">
                            <span className="text-[10px] text-slate-400 block truncate">
                              {CRITERIA_LABELS[key]}
                            </span>
                            <span className={`text-xs font-bold ${val >= 4 ? 'text-emerald-600 dark:text-emerald-400' : val <= 2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {val}점
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* 작성자 메모 */}
                    {record.memo && (
                      <div className="flex gap-2 text-xs bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-950/8s p-2.5 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-600 dark:text-slate-300 leading-normal">
                          {record.memo}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
