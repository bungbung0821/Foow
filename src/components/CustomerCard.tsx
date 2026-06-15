import { Star, Eye, PlusCircle, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer } from '../types';
import { TAG_DETAILS } from '../data/mockCustomers';

interface CustomerCardProps {
  key?: string;
  customer: Customer;
  onSelect: (customer: Customer) => void;
  onAddRating: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onSelect, onAddRating }: CustomerCardProps) {
  // 최신 평가 레코드 확인
  const latestRating = customer.ratings.length > 0 
    ? [...customer.ratings].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  // 전체 별 그리기 서포트 함수
  const renderStars = (score: number) => {
    const totalStars = 5;
    const filledStars = Math.round(score);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalStars }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < filledStars 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-slate-200 dark:text-slate-800'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      id={`customer-card-${customer.id}`}
      layoutId={`card-container-${customer.id}`}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 flex flex-col justify-between h-full transition-all duration-200 relative group"
    >
      <div>
        {/* 헤더: 이름 + 휴대폰 표시 + 상태 배지 */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {customer.name}
              <span className="text-xs font-mono font-medium text-slate-400">
                ({customer.phoneSuffix})
              </span>
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
              최근 예약: {customer.bookingNumber}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 justify-end">
            {customer.tags.map(tag => {
              const tagMeta = TAG_DETAILS[tag] || { label: tag, bg: 'bg-slate-100', color: 'text-slate-800', border: 'border-slate-200' };
              return (
                <span
                  key={tag}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tagMeta.bg} ${tagMeta.color} ${tagMeta.border} shadow-2xs`}
                >
                  {tagMeta.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* 점수 요약 & 방문 횟수 */}
        <div className="flex items-center gap-3 py-1.5 border-y border-slate-50 dark:border-slate-800/60 mb-3.5 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {customer.averageScore.toFixed(1)}
            </span>
            {renderStars(customer.averageScore)}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div>
            방문 횟수: <span className="font-bold text-slate-800 dark:text-slate-200">{customer.visitsCount}회</span>
          </div>
        </div>

        {/* 최근 메모 요약 */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>최근 메모</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed min-h-[54px] bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100/50 dark:border-slate-900/60">
            {latestRating ? latestRating.memo : customer.notes || '등록된 메모 내용이 없습니다.'}
          </p>
        </div>
      </div>

      {/* 하단 카드 액션 버튼 */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-50 dark:border-slate-800/60">
        <button
          id={`btn-view-detail-${customer.id}`}
          onClick={() => onSelect(customer)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          상세 분석
        </button>
        <button
          id={`btn-add-rating-${customer.id}`}
          onClick={() => onAddRating(customer)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-200"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          방문 평가
        </button>
      </div>
    </motion.div>
  );
}
