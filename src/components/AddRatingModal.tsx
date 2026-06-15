import { useState, useEffect, FormEvent } from 'react';
import { X, Star, FileText, Sparkles, User, HelpCircle, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, RatingCriteria, RatingRecord } from '../types';
import { CRITERIA_LABELS, CRITERIA_DESCRIPTIONS } from '../data/mockCustomers';

const PARTNER_RESTAURANTS = [
  { name: '마포 양지순대국', type: '한식' },
  { name: '라치오 오스테리아', type: '양식' },
  { name: '도쿄스시 신촌점', type: '일식' },
  { name: '클라우드 인더스트리 카페', type: '카페/디저트' },
  { name: '소맥포차 밤거리', type: '술집/주점' },
];

interface AddRatingModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (customerId: string, newRating: Omit<RatingRecord, 'id'>) => void;
}

const CRITERIA_RATING_EXPLAIN: Record<number, string> = {
  1: '매우 미흡 (매장에 상당한 손해/불편 초래)',
  2: '미흡 (원활한 매너가 아니며 대기/지체 유발)',
  3: '보통 (일반적인 방문 행태 및 평이함)',
  4: '우수 (매우 모범적이고 배려 넘침)',
  5: '매우 우수 (최상의 매너, 직원 감동 요소 있음)',
};

export default function AddRatingModal({ isOpen, customer, onClose, onSubmit }: AddRatingModalProps) {
  const [bookingNumber, setBookingNumber] = useState('');
  const [raterName, setRaterName] = useState('매니저');
  const [restaurantName, setRestaurantName] = useState('라치오 오스테리아');
  const [restaurantType, setRestaurantType] = useState('양식');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');

  // 6개 항목 평가 점수 관리 기본값 3점(보통)
  const [criteria, setCriteria] = useState<RatingCriteria>({
    bookingTime: 3,
    earlyNotice: 3,
    staffResponse: 3,
    storeManner: 3,
    tableCleanup: 3,
    recommendRevisit: 3,
  });

  // 고객이 바뀌었을 때 기본정보 매칭 동기화
  useEffect(() => {
    if (customer) {
      // 새로운 예약번호 제안 (오늘 날짜 기반)
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      setBookingNumber(`R-${todayStr}${Math.floor(100 + Math.random() * 900)}`);
      setRaterName('이은경 점장'); // 기본 평가 담당자 추천
      setRestaurantName('라치오 오스테리아');
      setRestaurantType('양식');
      setMemo('');
      setCriteria({
        bookingTime: 3,
        earlyNotice: 3,
        staffResponse: 3,
        storeManner: 3,
        tableCleanup: 3,
        recommendRevisit: 3,
      });
      setError('');
    }
  }, [customer, isOpen]);

  if (!customer) return null;

  const handleStarClick = (key: keyof RatingCriteria, value: number) => {
    setCriteria(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!bookingNumber.trim()) {
      setError('예약번호를 기입해 주십시오.');
      return;
    }

    if (!raterName.trim()) {
      setError('평가를 내리는 직원 이름을 입력해 주십시오.');
      return;
    }

    if (!restaurantName.trim()) {
      setError('평가하려는 매장명을 기입하거나 선택해 주십시오.');
      return;
    }

    const todayString = new Date().toISOString().slice(0, 10);

    const newRatingData: Omit<RatingRecord, 'id'> = {
      date: todayString,
      bookingNumber: bookingNumber.trim(),
      criteria,
      raterName: raterName.trim(),
      restaurantName: restaurantName.trim(),
      restaurantType: restaurantType.trim() || '기타',
      memo: memo.trim(),
    };

    onSubmit(customer.id, newRatingData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배후 배경 흐림 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
          />

          {/* 모달 윈도우 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col relative z-10 animate-duration-300"
          >
            {/* 상단바 헤더 */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-855 dark:text-slate-150">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{customer.name}</span> 고객 방문 평가 기록
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    각 항목별로 고객이 매장에서 수행한 행동 기준에 맞는 별점을 매겨주세요.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-rating-modal"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 메인 폼 전개 영역 */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* 평가 작성 업장 설정 (배달의민족 스타일 - 식당 간 공유 연동) */}
              <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-950/65 p-4 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-850 dark:text-indigo-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>작성 매장 정보 (Shared alliance)</span>
                  </h4>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    협약 연합 매장 실시간 평점 공유 지원
                  </span>
                </div>

                {/* 퀵 셀렉트 버튼 보드 */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 block">
                    작성 업장 선택 (퀵 시뮬레이션):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PARTNER_RESTAURANTS.map(p => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => {
                          setRestaurantName(p.name);
                          setRestaurantType(p.type);
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border cursor-pointer ${
                          restaurantName === p.name
                            ? 'bg-indigo-650 border-indigo-700 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 입력 인풋 영역 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-550 dark:text-slate-400 block">
                      매장명 *
                    </label>
                    <input
                      id="input-rating-restaurant-name"
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="예: 마포 삼겹살"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-550 dark:text-slate-400 block">
                      업종 카테고리 *
                    </label>
                    <input
                      id="input-rating-restaurant-type"
                      type="text"
                      required
                      value={restaurantType}
                      onChange={(e) => setRestaurantType(e.target.value)}
                      placeholder="예: 한식, 일식, 술집 등"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* 기본 요건: 예약번호, 평가자 필드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block">
                    방문 당일 예약번호 *
                  </label>
                  <input
                    id="input-rating-booking-number"
                    type="text"
                    required
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block">
                    평가 참여 직원명 *
                  </label>
                  <input
                    id="input-rating-rater-name"
                    type="text"
                    required
                    value={raterName}
                    onChange={(e) => setRaterName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* 6대 행동 기준 평가 체크 보드 */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 border-l-2 border-amber-500 pl-2">
                  방문 매너 정량 별점 평가
                </h4>

                <div className="space-y-4.5">
                  {(Object.keys(CRITERIA_LABELS) as Array<keyof RatingCriteria>).map(key => {
                    const currentVal = criteria[key];
                    return (
                      <div
                        key={key}
                        id={`criteria-row-${key}`}
                        className="py-2.5 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        {/* 왼쪽 명칭 및 서술 */}
                        <div className="space-y-0.5 md:max-w-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {CRITERIA_LABELS[key]}
                          </span>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                            {CRITERIA_DESCRIPTIONS[key]}
                          </p>
                        </div>

                        {/* 오른쪽 별 5선택 컨트롤러 */}
                        <div className="flex flex-col items-start md:items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {/* 실제 클릭 가능한 별단추 배열 */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(starNum => (
                                <button
                                  id={`btn-star-${key}-${starNum}`}
                                  key={starNum}
                                  type="button"
                                  onClick={() => handleStarClick(key, starNum)}
                                  className="p-1 hover:scale-115 transition-transform cursor-pointer"
                                  title={`${starNum}점 선택`}
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      starNum <= currentVal
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200 dark:text-slate-700'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded">
                              {currentVal}점
                            </span>
                          </div>
                          
                          {/* 현재 점수에 대한 텍스트 부연 설명 */}
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                            {CRITERIA_RATING_EXPLAIN[currentVal]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 추가 식사 행동 및 세부 내용 서술 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  상세 방문 설명 / 메모기록
                </label>
                <textarea
                  id="textarea-rating-memo"
                  rows={3}
                  required
                  placeholder="예: 지체 없이 음식을 주문하시어 세팅이 아주 순조로웠음. 매너가 좋으나 아이가 아기 의자 이용 시 기물 오염이 살짝 남아서 홀 팀원들이 함께 보충 클리닝 수행."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              {/* 하단 제어부 단추 */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
                <button
                  id="btn-cancel-rating"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-lg cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button
                  id="btn-submit-rating"
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  평가 저장 완료
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
