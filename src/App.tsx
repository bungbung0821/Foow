import { useState, useMemo, FormEvent, useEffect } from 'react';
import { Star, Plus, X, Search, Info, SlidersHorizontal, ChevronRight, User, Calendar, Smile, AlertTriangle, Check, RotateCcw, Building2, Utensils, GlassWater, Coffee, ShieldAlert, Award, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, setDoc, doc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

// 손님 리뷰 인터페이스 정의 (식당 필드 추가)
interface GuestReview {
  id: string;
  guestName: string;
  restaurantName: string; // 평가를 기록한 식당 이름
  restaurantType: string; // 식당 업종
  rating: number;
  visitDate: string;
  visitType: string;
  tags: string[];
  reviewText: string;
  createdAt?: any;
}

// 등록/작성 시간(밀리초 변환) 유틸리티 함수
function getReviewTimeMs(review: GuestReview): number {
  if (!review.createdAt) return Date.now();
  if (typeof review.createdAt.toMillis === 'function') {
    return review.createdAt.toMillis();
  }
  if (review.createdAt.seconds) {
    return review.createdAt.seconds * 1000;
  }
  return 0;
}

// 초기 데모 데이터셋
const INITIAL_REVIEWS: GuestReview[] = [
  {
    id: 'review-1-1',
    guestName: '예약고객 A102',
    restaurantName: '마포 양지순대국',
    restaurantType: '한식',
    rating: 5.0,
    visitDate: '2026-06-12',
    visitType: '예약 방문',
    tags: ['시간 약속 잘 지킴', '친절함', '재방문 추천'],
    reviewText: '예약 시간보다 5분 일찍 도착했고, 직원에게 친절하게 응대했습니다. 테이블 정리 상태도 좋아 다시 받고 싶은 고객입니다.'
  },
  {
    id: 'review-1-2',
    guestName: '예약고객 A102',
    restaurantName: '도쿄스시 신촌점',
    restaurantType: '일식',
    rating: 4.8,
    visitDate: '2026-06-02',
    visitType: '예약 방문',
    tags: ['조용한 이용', '재방문 추천', 'VIP'],
    reviewText: '매우 격식있고 차분한 태도로 품위 있게 식사를 하셨습니다. 프라이빗 룸을 이용하셨고, 고가의 추천 사케를 매너 있게 페어링해 가시며 직원들에게 감사 인사를 남겼습니다.'
  },
  {
    id: 'review-1-3',
    guestName: '예약고객 A102',
    restaurantName: '라치오 오스테리아',
    restaurantType: '양식',
    rating: 4.5,
    visitDate: '2026-05-24',
    visitType: '예약 방문',
    tags: ['친절함', '정리 상태 좋음'],
    reviewText: '연인분과 함께 기념일 예약을 통해 내방하셨습니다. 디너 만석 상황으로 분주했음에도 서빙되는 식기를 가볍게 정리해 주시는 등 훌륭한 배려가 돋보였습니다.'
  },
  {
    id: 'review-2-1',
    guestName: '예약고객 B221',
    restaurantName: '마포 양지순대국',
    restaurantType: '한식',
    rating: 3.5,
    visitDate: '2026-06-10',
    visitType: '일반 방문',
    tags: ['보통', '약간 지각'],
    reviewText: '예약 시간보다 조금 늦었지만 정중하게 늦는다고 매장으로 연락을 주셔서 대처할 수 있었습니다. 전반적인 식사 매너는 평이했습니다.'
  },
  {
    id: 'review-2-2',
    guestName: '예약고객 B221',
    restaurantName: '클라우드 인더스트리 카페',
    restaurantType: '카페/디저트',
    rating: 4.0,
    visitDate: '2026-05-28',
    visitType: '일반 방문',
    tags: ['조용한 이용', '정리 상태 좋음'],
    reviewText: '음료와 시그니처 크로플을 주문하여 조용히 업무를 진행했습니다. 가기 전에 빈 식기와 컵을 반납구에 바르게 정돈해주셔서 고마웠습니다.'
  },
  {
    id: 'review-3-1',
    guestName: '예약고객 C019',
    restaurantName: '라치오 오스테리아',
    restaurantType: '양식',
    rating: 1.5,
    visitDate: '2026-06-09',
    visitType: '예약 방문',
    tags: ['노쇼', '연락 없음', '주의 필요'],
    reviewText: '주말 피크 타임인 금요일 저녁 7시에 4인 예약을 해두시고 아무 기별 없이 불참하셨습니다. 전화를 수차례 드렸으나 끝내 수신하지 않았습니다.'
  },
  {
    id: 'review-3-2',
    guestName: '예약고객 C019',
    restaurantName: '도쿄스시 신촌점',
    restaurantType: '일식',
    rating: 1.0,
    visitDate: '2026-05-15',
    visitType: '예약 방문',
    tags: ['노쇼', '연락 없음', '주의 필요'],
    reviewText: '오마카세 예약금 미설정 이벤트 시간에 코스 요리를 2인 슬롯 예약해 두고 노쇼했습니다. 타 가맹점에서도 본 계정명의 예약이 접수되면 반드시 주의가 요망됩니다.'
  },
  {
    id: 'review-4-1',
    guestName: '예약고객 D774',
    restaurantName: '마포 양지순대국',
    restaurantType: '한식',
    rating: 4.2,
    visitDate: '2026-06-08',
    visitType: '단체 방문',
    tags: ['조용한 이용', '매너 좋음'],
    reviewText: '단체 모임 회식으로 8명이 함께 오셨습니다. 다소 분위기가 술렁거릴 수 있는 자리였으나 소음이 도를 넘지 않도록 서로 통제하며 예의 바르게 이용하셨습니다.'
  },
  {
    id: 'review-4-2',
    guestName: '예약고객 D774',
    restaurantName: '소맥포차 밤거리',
    restaurantType: '술집/주점',
    rating: 4.5,
    visitDate: '2026-05-30',
    visitType: '단체 방문',
    tags: ['친절함', '재방문 추천'],
    reviewText: '금요일 야간에 단체 2차 모임으로 방문했습니다. 안주 및 주류 매출 회전을 시원하게 이끌어 주셨고 서빙 직원에게도 연신 감사 인사를 전해주셔서 매장에 활력이 돋았습니다.'
  },
  {
    id: 'review-5-1',
    guestName: '예약고객 E305',
    restaurantName: '클라우드 인더스트리 카페',
    restaurantType: '카페/디저트',
    rating: 4.8,
    visitDate: '2026-06-07',
    visitType: '예약 방문',
    tags: ['친절함', '정리 상태 좋음', 'VIP'],
    reviewText: '스페셜 드립커피 바 자리에 앉으셔서 음료 설명에 매우 환대해 주시고 수고가 많다 하셨습니다. 나갈 때 냅킨으로 자리를 윤이 날 정도로 깨끗이 치워주신 천사 고객님입니다.'
  },
  {
    id: 'review-5-2',
    guestName: '예약고객 E305',
    restaurantName: '라치오 오스테리아',
    restaurantType: '양식',
    rating: 5.0,
    visitDate: '2026-05-10',
    visitType: '예약 방문',
    tags: ['친절함', '재방문 추천', 'VIP'],
    reviewText: '어머님 칠순 가족 식사 예약을 통해 6인 슬롯을 차분하게 이용해 주셨습니다. 서비스에 감사를 전하기 위해 마지막에 소정의 감동 피드백 메모까지 전해주시는 완벽한 VIP이십니다.'
  }
];

// 선택 가능한 매너 태그들 목록
const AVAILABLE_TAGS = [
  '시간 약속 잘 지킴',
  '친절함',
  '조용한 이용',
  '정리 상태 좋음',
  '약간 지각',
  '연락 없음',
  '노쇼',
  '주의 필요',
  '재방문 추천'
];

// 고정 가입 제휴 식당 정보 목록
const ALLIANCE_STORES = [
  { name: '마포 양지순대국', type: '한식' },
  { name: '라치오 오스테리아', type: '양식' },
  { name: '도쿄스시 신촌점', type: '일식' },
  { name: '클라우드 인더스트리 카페', type: '카페/디저트' },
  { name: '소맥포차 밤거리', type: '술집/주점' }
];

// 방문 유형 목록
const VISIT_TYPES = ['예약 방문', '일반 방문', '단체 방문', '배달/포장'];

// 업종 아이콘 매핑 어시스트
function getStoreIcon(type: string) {
  switch (type) {
    case '한식':
      return <Utensils className="w-3.5 h-3.5 text-orange-600" />;
    case '일식':
      return <GlassWater className="w-3.5 h-3.5 text-blue-500" />;
    case '양식':
      return <Utensils className="w-3.5 h-3.5 text-rose-500" />;
    case '카페/디저트':
      return <Coffee className="w-3.5 h-3.5 text-amber-700" />;
    default:
      return <Utensils className="w-3.5 h-3.5 text-[#2AC1BC]" />;
  }
}

// 상생 안전 수호 정책 푸터 컴포넌트
function SafetyFooter() {
  return (
    <footer className="p-4 text-center space-y-3 mt-6 shrink-0 border-t border-slate-150 bg-slate-50/30 rounded-2xl">
      <div className="bg-amber-50/50 border border-amber-100/70 rounded-2xl p-3.5 text-left text-[10.5px] text-slate-500 space-y-2 leading-relaxed">
        <div className="flex items-start gap-1 text-amber-700 font-bold">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>안전 안내 정책</span>
        </div>
        <p className="font-semibold leading-relaxed">
          &ldquo;본 서비스는 식당의 단골 확보 및 신속한 고객 밀착 케어를 제공하기 위한 상생 대조망 장부입니다. 개인정보 존중 및 비방을 지양해 주십시오.&rdquo;
        </p>
      </div>

      <div className="text-[9px] text-slate-400 font-semibold leading-none">
        <span className="font-extrabold block text-slate-500 mb-1">손님평점 Co-op Owner Workspace</span>
        <p>© 2026 민생 단골평점. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'작성' | '손님관리' | 'My'>('손님관리');

  // Firestore 실시간 데이터 동기화 및 최초 1회 씨딩 처리
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_REVIEWS.forEach(async (review) => {
          try {
            await setDoc(doc(db, 'reviews', review.id), {
              ...review,
              createdAt: serverTimestamp(),
            });
          } catch (e) {
            console.error('Error seeding data:', e);
          }
        });
      } else {
        const loadedReviews: GuestReview[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedReviews.push({
            id: data.id || docSnap.id,
            guestName: data.guestName || '',
            restaurantName: data.restaurantName || '',
            restaurantType: data.restaurantType || '',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            visitDate: data.visitDate || '',
            visitType: data.visitType || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            reviewText: data.reviewText || '',
            createdAt: data.createdAt,
          });
        });
        loadedReviews.sort((a, b) => {
          const timeA = getReviewTimeMs(a);
          const timeB = getReviewTimeMs(b);
          if (timeA !== timeB) return timeB - timeA;
          const dateCompare = b.visitDate.localeCompare(a.visitDate);
          if (dateCompare !== 0) return dateCompare;
          return b.id.localeCompare(a.id);
        });
        setReviews(loadedReviews);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reviews');
    });

    return () => unsubscribe();
  }, []);

  // 새 리뷰 작성 폼 상태
  const [customGuestName, setCustomGuestName] = useState('');
  const [selectedRaterStore, setSelectedRaterStore] = useState('마포 양지순대국');
  const [isCustomStoreInput, setIsCustomStoreInput] = useState(false);
  const [customStoreName, setCustomStoreName] = useState('');
  const [customStoreType, setCustomStoreType] = useState('한식');

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [customVisitDate, setCustomVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedVisitType, setSelectedVisitType] = useState('예약 방문');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customReviewText, setCustomReviewText] = useState('');

  // 필터 및 검색 상태
  const [currentFilter, setCurrentFilter] = useState<string>('전체');
  const [currentSort, setCurrentSort] = useState<string>('최신순');
  const [searchTerm, setSearchTerm] = useState('');

  // 통계 계산 (실시간)
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    let sumRatings = 0;
    const uniqueGuests = new Set<string>();
    reviews.forEach(r => uniqueGuests.add(r.guestName));

    let recommendRevisitCount = 0;
    let cautionNeededCount = 0;

    reviews.forEach((r) => {
      sumRatings += r.rating;
      if (r.rating >= 4.0 || r.tags.includes('재방문 추천') || r.tags.includes('VIP')) {
        recommendRevisitCount++;
      }
      if (r.rating < 2.5 || r.tags.includes('주의 필요') || r.tags.includes('노쇼')) {
        cautionNeededCount++;
      }
    });

    const averageRating = totalReviews > 0 ? Math.round((sumRatings / totalReviews) * 10) / 10 : 0.0;

    return {
      averageRating,
      totalReviews,
      uniqueGuestsCount: uniqueGuests.size,
      recommendRevisitCount,
      cautionNeededCount
    };
  }, [reviews]);

  // 필터링 적용
  const filteredReviews = useMemo(() => {
    let result = reviews.filter((r) => {
      const matchSearch =
        r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchSearch) return false;

      if (currentFilter === '전체') return true;
      if (currentFilter === '5점') return r.rating === 5.0;
      if (currentFilter === '4점 이상') return r.rating >= 4.0;
      if (currentFilter === '3점 이하') return r.rating <= 3.0;
      if (currentFilter === '주의 필요') return r.rating < 2.5 || r.tags.includes('주의 필요') || r.tags.includes('노쇼');
      if (currentFilter === '노쇼') return r.tags.includes('노쇼') || r.tags.includes('연락 없음');
      if (currentFilter === '재방문 추천') return r.rating >= 4.0 || r.tags.includes('재방문 추천') || r.tags.includes('VIP');

      return true;
    });

    if (currentSort === '최신순') {
      result = [...result].sort((a, b) => {
        const timeA = getReviewTimeMs(a);
        const timeB = getReviewTimeMs(b);
        if (timeA !== timeB) return timeB - timeA;
        const dateCompare = b.visitDate.localeCompare(a.visitDate);
        if (dateCompare !== 0) return dateCompare;
        return b.id.localeCompare(a.id);
      });
    } else if (currentSort === '별점 높은순') {
      result = [...result].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        const timeA = getReviewTimeMs(a);
        const timeB = getReviewTimeMs(b);
        if (timeA !== timeB) return timeB - timeA;
        const dateCompare = b.visitDate.localeCompare(a.visitDate);
        if (dateCompare !== 0) return dateCompare;
        return b.id.localeCompare(a.id);
      });
    } else if (currentSort === '별점 낮은순') {
      result = [...result].sort((a, b) => {
        if (a.rating !== b.rating) return a.rating - b.rating;
        const timeA = getReviewTimeMs(a);
        const timeB = getReviewTimeMs(b);
        if (timeA !== timeB) return timeB - timeA;
        const dateCompare = b.visitDate.localeCompare(a.visitDate);
        if (dateCompare !== 0) return dateCompare;
        return b.id.localeCompare(a.id);
      });
    }

    return result;
  }, [reviews, currentFilter, currentSort, searchTerm]);

  // 선택된 상세 리뷰
  const selectedReview = useMemo(() => {
    return reviews.find(r => r.id === selectedReviewId) || null;
  }, [reviews, selectedReviewId]);

  // 점수별 안심 가이드라인
  const getGuidanceMessage = (rating: number) => {
    if (rating >= 4.5) {
      return {
        text: '재방문 시 적극 응대 추천 (VIP 대우, 선호 좌석 배정 및 웰컴 서비스 권장)',
        color: 'text-teal-700 bg-teal-50 border-teal-200'
      };
    } else if (rating >= 3.0) {
      return {
        text: '일반 고객으로 응대 (친절하고 편안한 표준 프로토콜 가이드라인 준수)',
        color: 'text-sky-700 bg-sky-50 border-sky-200'
      };
    } else if (rating >= 2.0) {
      return {
        text: '예약 시간 확인 필요 (일정 변경 우려가 있으므로 내방 30분 전 사전 확인 통화 권장)',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    } else {
      return {
        text: '다음 예약 시 사전 확인 필요 (보증금 예약 지정 혹은 긴급 페널티 사전 고지 권장)',
        color: 'text-rose-700 bg-rose-50 border-rose-200'
      };
    }
  };

  // 태그 핸들러
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 새 평가 제출 등록
  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!customGuestName.trim()) return alert('고객 식별번호(예: 예약고객 A102)를 입력해 주십시오.');
    if (!customReviewText.trim()) return alert('리뷰 내용을 입력해 주십시오.');

    let finalStoreName = selectedRaterStore;
    let finalStoreType = '한식';

    if (isCustomStoreInput) {
      if (!customStoreName.trim()) return alert('작성자 식당명을 입력해 주십시오.');
      finalStoreName = customStoreName.trim();
      finalStoreType = customStoreType;
    } else {
      const matched = ALLIANCE_STORES.find(s => s.name === selectedRaterStore);
      if (matched) {
        finalStoreType = matched.type;
      }
    }

    try {
      const newId = `rev-${Date.now()}`;
      const newReview: GuestReview = {
        id: newId,
        guestName: customGuestName.trim(),
        restaurantName: finalStoreName,
        restaurantType: finalStoreType,
        rating: selectedRating,
        visitDate: customVisitDate || new Date().toISOString().split('T')[0],
        visitType: selectedVisitType,
        tags: selectedTags,
        reviewText: customReviewText.trim(),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'reviews', newId), newReview);

      setCustomGuestName('');
      setCustomReviewText('');
      setSelectedRating(5);
      setSelectedTags([]);
      setCustomStoreName('');

      setSelectedReviewId(newId);
      setActiveTab('손님관리');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    }
  };

  // 테스트 도중 씨드 복원 초기화
  const handleResetData = async () => {
    if (!window.confirm('기존 데이터를 모두 삭제하고 초기 11개 제휴 교차 데이터셋으로 리셋하시겠습니까?')) return;
    try {
      // 1. 기존 데이터 전체 소거
      const reviewsRef = collection(db, 'reviews');
      const loaded = await getDocs(reviewsRef);
      const deletes = loaded.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletes);

      // 2. 초기 11개 탑재
      const seeds = INITIAL_REVIEWS.map(r => setDoc(doc(db, 'reviews', r.id), {
        ...r,
        createdAt: serverTimestamp()
      }));
      await Promise.all(seeds);

      setSelectedReviewId(null);
      alert('공동 대조망 장부가 완전히 초기 테이터로 복원되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'reviews');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5F5] py-6 px-4 md:py-10 flex items-center justify-center antialiased">
      <div className="w-full max-w-[480px] bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-150 flex flex-col h-[820px] transition-all relative">
        
        {/* 상단 시그니처 배민 민트 헤더 */}
        <header id="baemin-accent-header" className="bg-[#2AC1BC] text-white p-6 relative shrink-0">
          <div className="flex justify-between items-start">
            <span className="bg-white/20 text-white border border-white/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase">
              {activeTab === '손님관리' ? 'GUEST MANNER COOP REPORT' : activeTab === '작성' ? 'WRITE NEW COOP' : 'MY OWNER STORE'}
            </span>
            {activeTab === 'My' && (
              <button
                onClick={handleResetData}
                className="text-white/85 hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer bg-black/10 hover:bg-black/20 px-2 py-0.5 rounded-lg transition-all"
                id="btn-baemin-reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>데이터 원복</span>
              </button>
            )}
          </div>
          <h1 className="text-2.5xl font-black mt-3 flex items-center gap-2 tracking-tight">
            <span>민생 단골평점</span>
            <Star className="w-6 h-6 fill-white text-white drop-shadow-sm animate-pulse" />
          </h1>
          <p className="text-xs text-white/85 font-medium mt-1 leading-relaxed">
            비매너·노쇼 제로 공동 영업 수호 대조망
          </p>
        </header>

        {/* 메인 뷰 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === '손님관리' && (
              <motion.div
                key="tab-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="flex-1 p-4.5 space-y-4 font-sans"
              >
                {/* 종합 현황 판틀 대시보드 */}
                <div className="bg-white border border-slate-150 rounded-2.5xl p-4.5 shadow-sm space-y-3 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800">실시간 전국 연대망 동익 통계</span>
                    <span className="text-[10px] text-[#2AC1BC] bg-[#EBF8F8] font-extrabold px-2 py-0.5 rounded-full">365일 실시간 분석</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">누적 평가</span>
                      <strong className="text-base font-black text-slate-800">{stats.totalReviews}건</strong>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">식별 고객</span>
                      <strong className="text-base font-black text-slate-800">{stats.uniqueGuestsCount}명</strong>
                    </div>
                    <div className="bg-[#FAFDFD] rounded-2xl p-2.5 border border-[#EBF8F8]">
                      <span className="text-[10px] text-[#2AC1BC] block mb-0.5 font-extrabold">평균 매너</span>
                      <strong className="text-base font-black text-[#2AC1BC]">★ {stats.averageRating.toFixed(1)}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-2 bg-white justify-between">
                    <div className="flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5 text-teal-600" />
                      <span>우수 응대 권장: <span className="text-teal-700 font-extrabold">{stats.recommendRevisitCount}건</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>노쇼 등 요주의: <span className="text-rose-600 font-extrabold">{stats.cautionNeededCount}건</span></span>
                    </div>
                  </div>
                </div>

                {/* 검색 필터 바 */}
                <div className="space-y-2 text-left">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      id="input-search-guest"
                      type="text"
                      placeholder="손님 식별번호, 식당 혹은 내용 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2AC1BC] focus:outline-none focus:border-[#2AC1BC] font-semibold text-slate-700 placeholder-slate-400 shadow-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="p-1 text-slate-350 hover:text-slate-600 absolute right-3 top-2 rounded-full cursor-pointer hover:bg-slate-50 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-0.5" />
                    {['전체', '4점 이상', '주의 필요', '노쇼'].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setCurrentFilter(filter)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full border shrink-0 cursor-pointer transition ${
                          currentFilter === filter
                            ? 'bg-[#2AC1BC] border-[#2AC1BC] text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 리뷰 목록 */}
                {filteredReviews.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl py-12 px-6 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 bg-slate-50 text-slate-350 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                      검색 및 필터 조건에 부합하는 장부가 없습니다.<br />
                      상하위 입력 기준이나 검색 단어를 변경해 주세요.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReviews.map((review) => {
                      const isSelected = selectedReviewId === review.id;
                      const averageMatchScore = reviews
                        .filter(r => r.guestName === review.guestName)
                        .reduce((acc, curr, _, array) => acc + curr.rating / array.length, 0);

                      const otherReviewsOfThisGuest = reviews.filter(
                        r => r.guestName === review.guestName && r.id !== review.id
                      );

                      return (
                        <article
                          key={review.id}
                          id={`review-item-${review.id}`}
                          onClick={() => setSelectedReviewId(isSelected ? null : review.id)}
                          className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden text-left ${
                            isSelected
                              ? 'ring-1 px-4 py-4 border-[#2AC1BC]'
                              : 'border-slate-150 hover:border-slate-250 py-3.5 px-4.5 shadow-xs'
                          }`}
                        >
                          {/* 리스트 바 헤더 (언제나 보이며 극도로 콤팩트한 레이아웃) */}
                          <div className="flex items-center justify-between gap-1.5 select-none">
                            <div className="flex items-center gap-3">
                              {/* 콤팩트한 손님 서브 서클 아이콘 가볍게 배치 */}
                              <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border ${
                                review.tags.includes('노쇼')
                                  ? 'bg-rose-50 border-rose-100 text-rose-500'
                                  : review.rating >= 4.5
                                  ? 'bg-teal-50 border-teal-100 text-teal-600'
                                  : 'bg-slate-50 border-slate-150 text-slate-400'
                              }`}>
                                <User className="w-4 h-4" />
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="text-xs font-black text-slate-800 leading-none">{review.guestName}</h3>
                                  {review.tags.includes('노쇼') && (
                                    <span className="text-[8px] bg-rose-50 border border-rose-200 text-rose-600 font-extrabold px-1.2 py-0.2 rounded uppercase tracking-wider">
                                      노쇼주의
                                    </span>
                                  )}
                                  {review.tags.includes('VIP') && (
                                    <span className="text-[8px] bg-amber-50 border border-[#FFD20F]/45 text-amber-700 font-extrabold px-1.2 py-0.2 rounded uppercase tracking-wider">
                                      VIP
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-450 font-bold flex items-center gap-1">
                                  <span className="max-w-[130px] truncate">{review.restaurantName}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-mono">{review.visitDate.slice(5)}</span>
                                </p>
                              </div>
                            </div>

                            {/* 우측 별점 및 개별 식별 평점 */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="text-right">
                                <span className="text-[11.5px] text-[#2AC1BC] font-extrabold block leading-none">
                                  ★ {review.rating.toFixed(1)}
                                </span>
                                <span className="text-[8px] text-slate-400 font-bold block mt-1">
                                  연망 ★{averageMatchScore.toFixed(1)}
                                </span>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${
                                isSelected ? 'rotate-90 text-[#2AC1BC]' : ''
                              }`} />
                            </div>
                          </div>

                          {/* 상세 아코디언 서랍 */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden mt-3.5 pt-3.5 border-t border-slate-100"
                              >
                                <div className="space-y-4">
                                  {/* 평가 원문 상세 내용 */}
                                  <div className="space-y-1 text-left">
                                    <span className="text-[9px] text-[#2AC1BC] font-black uppercase tracking-wider block">평가 원문</span>
                                    <p className="text-xs text-slate-650 leading-relaxed font-semibold bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                      {review.reviewText}
                                    </p>
                                  </div>

                                  {/* 매너 태그 목록 */}
                                  {review.tags.length > 0 && (
                                    <div className="space-y-1 text-left">
                                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">등록 태그</span>
                                      <div className="flex flex-wrap gap-1">
                                        {review.tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                                              tag === '노쇼' || tag === '주의 필요'
                                                ? 'bg-rose-50 border-rose-150 text-rose-600'
                                                : tag === '재방문 추천' || tag === 'VIP'
                                                ? 'bg-teal-50 border-teal-150 text-teal-600'
                                                : 'bg-slate-50 border-slate-150 text-slate-500'
                                            }`}
                                          >
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 사장 안심 가이드라인 지표 */}
                                  <div className="space-y-1.5 text-left">
                                    <h4 className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">연망 안심 가이드라인</h4>
                                    <div className={`p-3 rounded-xl border text-[10.5px] leading-relaxed font-semibold ${getGuidanceMessage(review.rating).color}`}>
                                      {getGuidanceMessage(review.rating).text}
                                    </div>
                                  </div>

                                  {/* 교차 점포 대조 영역 */}
                                  <div className="space-y-2 text-left bg-slate-50/50 p-3 rounded-2xl border border-slate-150 font-sans">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                                      <h4 className="text-[10px] font-black text-slate-700">전체 공공 장부 교차 대조</h4>
                                      <span className="text-[9.5px] bg-[#E2F7F7] text-[#2AC1BC] px-1.5 py-0.2 rounded font-mono font-bold">
                                        종합평점: {averageMatchScore.toFixed(1)} / 5.0
                                      </span>
                                    </div>

                                    {otherReviewsOfThisGuest.length === 0 ? (
                                      <div className="text-center py-5 bg-white border border-dashed border-slate-200 rounded-xl text-[10px] text-slate-400">
                                        &ldquo;본 매장 외에 타 식당에 등록된 평가가 아직 없습니다.&rdquo;
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {otherReviewsOfThisGuest.map((other) => (
                                          <div
                                            key={other.id}
                                            className="p-2.5 bg-white rounded-xl border border-slate-150 space-y-1.5 text-xs"
                                          >
                                            <div className="flex items-center justify-between text-[10.5px]">
                                              <span className="font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[8.5px] flex items-center gap-0.5">
                                                {getStoreIcon(other.restaurantType)}
                                                <span>{other.restaurantName}</span>
                                              </span>
                                              <span className="text-[9px] text-[#2AC1BC] font-mono font-extrabold">★ {other.rating.toFixed(1)}</span>
                                            </div>
                                            <p className="text-slate-600 leading-snug font-medium text-[10.5px]">
                                              {other.reviewText}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* 하단 안전 수호 정책 라이선스 바 */}
                <SafetyFooter />
              </motion.div>
            )}

            {activeTab === '작성' && (
              <motion.div
                key="tab-write"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="flex-1 p-5 space-y-4 font-sans text-left"
              >
                <div className="bg-[#FAFDFD] border border-[#2AC1BC]/15 rounded-2.5xl p-4.5 space-y-2.5 text-left">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#2AC1BC]" />
                    <span>신뢰로운 사장 안전보장 장부 등재</span>
                  </h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                    매너 좋은 천사님들의 고마운 선행이나, 노쇼 및 무례함으로 피해를 주는 블랙 손님의 특이사항을 다른 사장님들과 전면 대조망에 기밀하게 공유할 수 있습니다.
                  </p>
                </div>

                <form id="new-review-form" onSubmit={handleAddReview} className="space-y-4">
                  {/* 항목 1: 손님 식업 번호 */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      고객 대표 식별값 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-guest-name"
                      type="text"
                      required
                      placeholder="예: 예약고객 A102, 번호 뒷자리, 플랫폼 계정명 등"
                      value={customGuestName}
                      onChange={(e) => setCustomGuestName(e.target.value)}
                      className="w-full bg-[#fcfdfe] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#2AC1BC] focus:outline-none text-slate-755 font-bold"
                    />
                  </div>

                  {/* 항목 2: 식당 선택 */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      보고하는 매장명 <span className="text-rose-500">*</span>
                    </label>
                    {isCustomStoreInput ? (
                      <div className="space-y-2">
                        <input
                          id="input-store-name"
                          type="text"
                          required
                          placeholder="수동 입력할 매장 이름을 입력하세요"
                          value={customStoreName}
                          onChange={(e) => setCustomStoreName(e.target.value)}
                          className="w-full bg-[#fcfdfe] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#2AC1BC] text-slate-750 font-bold"
                        />
                        <div className="flex gap-2">
                          <select
                            id="select-store-type"
                            value={customStoreType}
                            onChange={(e) => setCustomStoreType(e.target.value)}
                            className="bg-[#fafafa] border border-slate-200 rounded-xl px-3 py-1.5 text-[10.5px] font-bold text-slate-600 focus:outline-none"
                          >
                            {['한식', '일식', '양식', '카페/디저트', '술집/주점'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsCustomStoreInput(false)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            연합망 매장 선택으로 복귀
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <select
                          id="select-rater-store"
                          value={selectedRaterStore}
                          onChange={(e) => setSelectedRaterStore(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-[#2AC1BC] focus:outline-none text-slate-700 font-bold cursor-pointer"
                        >
                          {ALLIANCE_STORES.map(s => (
                            <option key={s.name} value={s.name}>{s.name} ({s.type})</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsCustomStoreInput(true)}
                          className="text-[10px] text-[#2AC1BC] hover:underline font-bold"
                        >
                          여기에 나의 매장이 없나요? 직접 작성하기
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 항목 3: 평점 */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      종합 동식 매너 점수 <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSelectedRating(num)}
                            className="p-0.5 hover:scale-110 transition cursor-pointer"
                          >
                            <Star
                              className={`w-5.5 h-5.5 ${
                                num <= selectedRating ? 'fill-[#FFD20F] text-[#FFD20F]' : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm font-black text-slate-800 font-mono">{selectedRating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>

                  {/* 항목 4: 방문날짜 및 유형 */}
                  <div className="grid grid-cols-2 gap-3.5 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">방문 날짜</label>
                      <input
                        id="input-visit-date"
                        type="date"
                        value={customVisitDate}
                        onChange={(e) => setCustomVisitDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#2AC1BC] text-slate-650 font-bold cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">방문 유형</label>
                      <select
                        id="select-visit-type"
                        value={selectedVisitType}
                        onChange={(e) => setSelectedVisitType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2AC1BC] text-slate-650 font-bold cursor-pointer"
                      >
                        {VISIT_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 항목 5: 매너 가이드 태그들 */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      고객 매너 태그 (복수 선택 가능)
                    </label>
                    <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-3 max-h-[140px] overflow-y-auto">
                      {AVAILABLE_TAGS.map((tag) => {
                        const isChecked = selectedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                              isChecked
                                ? 'bg-[#EBF8F8] border-[#2AC1BC] text-[#2AC1BC]'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 항목 6: 내용 기술 */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      구체적인 손님 매너 평가 내용 <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="textarea-review"
                      rows={3}
                      required
                      placeholder="방문 시간 준수 여부, 에티켓, 정리 정돈 상태 등을 솔직하고 명확히 적어주세요."
                      value={customReviewText}
                      onChange={(e) => setCustomReviewText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#2AC1BC] text-slate-700 resize-none min-h-[75px] leading-relaxed font-sans"
                    />
                  </div>

                  <button
                    id="btn-submit-review"
                    type="submit"
                    className="w-full bg-[#2AC1BC] hover:bg-[#24ad9f] text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition shadow-sm"
                  >
                    객관적 공동 평가 등록하기
                  </button>
                </form>

                {/* 하단 안전 수호 정책 라이선스 바 */}
                <SafetyFooter />
              </motion.div>
            )}

            {activeTab === 'My' && (
              <motion.div
                key="tab-my"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="flex-1 bg-slate-50 p-5 space-y-4 font-sans text-left"
              >
                {/* 프로필 요약 */}
                <div className="bg-white border border-slate-150 rounded-2.5xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 bg-[#E2F7F7] text-[#2AC1BC] rounded-full flex items-center justify-center font-black text-xl shrink-0 border border-[#baf1f1]">
                      사장
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span>{selectedRaterStore} 사장님</span>
                        <Award className="w-4 h-4 text-[#FFD20F]" />
                      </h4>
                      <p className="text-[11px] text-[#2AC1BC] font-bold mt-0.5">상생 동익 대조 네트워크 정회원 • 가입 활성</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="bg-[#FAFDFD] border border-[#D2EFEF] rounded-xl p-3 flex flex-col justify-center text-center">
                      <span className="text-[10px] text-slate-400 block mb-1 font-bold">대표 업종</span>
                      <span className="font-extrabold text-slate-700 text-sm flex items-center justify-center gap-1">
                        {getStoreIcon(ALLIANCE_STORES.find(s => s.name === selectedRaterStore)?.type || '한식')}
                        <span>{ALLIANCE_STORES.find(s => s.name === selectedRaterStore)?.type || '한식'}</span>
                      </span>
                    </div>
                    <div className="bg-[#FAFDFD] border border-[#D2EFEF] rounded-xl p-3 flex flex-col justify-center text-center">
                      <span className="text-[10px] text-slate-400 block mb-1 font-bold">참여 제휴 기간</span>
                      <span className="font-extrabold text-[#2AC1BC] text-sm">365일 무중단</span>
                    </div>
                  </div>
                </div>

                {/* 가입 매장 리스트 전체 */}
                <div className="bg-white border border-slate-150 rounded-2.5xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Building2 className="w-4 h-4 text-[#2AC1BC]" />
                    <span>실시간 공동 대조망 제휴 점포 (총 {ALLIANCE_STORES.length}개소)</span>
                  </h4>
                  <div className="divide-y divide-slate-100 divide-dashed">
                    {ALLIANCE_STORES.map((store) => (
                      <div key={store.name} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          {getStoreIcon(store.type)}
                          <span>{store.name}</span>
                        </span>
                        <span className="text-[10px] bg-slate-100 border border-slate-150 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                          {store.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 장부 관리 작업 */}
                <div className="bg-white border border-slate-150 rounded-2.5xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>전용 보안 장부 초기화 시스템</span>
                  </h4>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold">
                    테스트 도중 리뷰 데이터를 완전히 지우고, 초기 11개 교차 테스트 데이터 세트로 리셋하려면 아래 버튼을 클릭하십시오.
                  </p>
                  <button
                    onClick={handleResetData}
                    className="w-full bg-[#FAFAFA] hover:bg-rose-50 border border-slate-200 text-slate-750 hover:text-rose-600 hover:border-rose-200 font-black text-xs py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                    id="btn-tab-my-reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>공유 장부 완전 원복 초기화</span>
                  </button>
                </div>

                {/* 하단 안전 수호 정책 라이선스 바 */}
                <SafetyFooter />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* 배달앱 형식 하단 고정 메뉴바 */}
        <footer id="baemin-bottom-nav" className="sticky bottom-0 bg-white border-t border-slate-150 py-3.5 px-6 flex justify-around items-center z-40 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.035)] shrink-0">
          
          <button
            type="button"
            id="btn-nav-list"
            onClick={() => setActiveTab('손님관리')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === '손님관리' ? 'text-[#2AC1BC] scale-102 font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <Clipboard className="w-5.5 h-5.5" />
            <span className="text-[10.5px]">손님관리</span>
          </button>

          <button
            type="button"
            id="btn-nav-write"
            onClick={() => setActiveTab('작성')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === '작성' ? 'text-[#2AC1BC] scale-102 font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <div className={`relative ${activeTab === '작성' ? 'scale-110' : ''} transition-transform`}>
              <Plus className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10.5px]">평가쓰기</span>
          </button>

          <button
            type="button"
            id="btn-nav-my"
            onClick={() => setActiveTab('My')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'My' ? 'text-[#2AC1BC] scale-102 font-black' : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10.5px]">My 매장</span>
          </button>

          {/* 모바일 하단 가상 홈 인디케이터 */}
          <div className="absolute bottom-1 left-12 right-12 mx-auto h-1 w-24 bg-slate-900 rounded-full opacity-10"></div>
        </footer>

      </div>
    </div>
  );
}
