import { Customer, CustomerTag, RatingCriteria } from '../types';

export const CRITERIA_LABELS: Record<keyof RatingCriteria, string> = {
  bookingTime: '예약 시간 준수',
  earlyNotice: '사전 연락 여부',
  staffResponse: '직원 응대 태도',
  storeManner: '매장 이용 매너',
  tableCleanup: '테이블 정리 상태',
  recommendRevisit: '재방문 응대 추천도',
};

export const CRITERIA_DESCRIPTIONS: Record<keyof RatingCriteria, string> = {
  bookingTime: '예약 시간에 정확히 맞춰 오거나 사전에 시간 맞춰 입장함',
  earlyNotice: '변동 사항 또는 지각 시 매장에 미리 연락하여 소통함',
  staffResponse: '직원에게 정중한 인칭 및 예의 바른 말투를 사용함',
  storeManner: '과도한 소음 방지, 매장 규칙 준수 및 타 고객 배려',
  tableCleanup: '테이블 위 쓰레기 회수, 식기 반납 또는 잔여물 정돈',
  recommendRevisit: '해당 고객의 재방문 시 홀 팀원들이 적극 환영 및 추천함',
};

// 태그 메타데이터
export const TAG_DETAILS: Record<CustomerTag, { label: string; color: string; bg: string; border: string; desc: string }> = {
  VIP: {
    label: 'VIP 고객',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900/60',
    desc: '평균 점수 4.5 이상 및 3회 이상 방문한 최우수 매너 고객',
  },
  RECOMMENDED: {
    label: '재방문 추천',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    desc: '평균 점수 4.0 이상으로 매너가 훌륭하고 정중한 고객',
  },
  NORMAL: {
    label: '일반 고객',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-900/60',
    desc: '평균 점수 3.0 이상 4.0 미만의 일반적인 매너를 가진 고객',
  },
  CAUTION: {
    label: '주의 필요',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-900/60',
    desc: '평균 점수 2.5 미만으로 직원 응대나 소음, 기물 관리상 주의선',
  },
  STRICT_CHECK: {
    label: '예약 확인 필요',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-900/60',
    desc: '예약 시간 상습 지각, 사전 미연락 노쇼 이력 등이 있어 확인 요망',
  },
};

// 매너 태그 자동 분류 함수
export function classifyCustomerTags(averageScore: number, visitsCount: number, ratings: RatingCriteria[]): CustomerTag[] {
  const tags: CustomerTag[] = [];

  // 1. VIP 고객: 평균 4.5 이상 & 3회 이상 방문
  if (averageScore >= 4.5 && visitsCount >= 3) {
    tags.push('VIP');
  } 
  // 2. 재방문 추천: 평균 4.0 이상
  else if (averageScore >= 4.0) {
    tags.push('RECOMMENDED');
  }
  // 3. 주의 필요: 평균 2.5 미만
  else if (averageScore < 2.5 && visitsCount > 0) {
    tags.push('CAUTION');
  }
  // 4. 예약 확인 필요: 예약시간 준수 혹은 사전 연락 점수가 극히 낮은 경우 (1회 이상 평균이 2.2 이하거나, 전체 평점이 2.5~3.0)
  const isTimeMannerIssue = ratings.length > 0 && 
    (ratings.some(r => r.bookingTime <= 2 || r.earlyNotice <= 2) || (averageScore >= 2.5 && averageScore < 2.9));
  
  if (isTimeMannerIssue) {
    tags.push('STRICT_CHECK');
  }

  // 5. 기본이거나 분류가 안되었을 때 일반고객 추가
  if (tags.length === 0) {
    tags.push('NORMAL');
  }

  return tags;
}

// 개별 고객 점수 및 태그 재계산기
export function computeCustomerStats(ratingsList: import('../types').RatingRecord[], originalCreatedAt: string): {
  visitsCount: number;
  averageScore: number;
  tags: CustomerTag[];
} {
  if (ratingsList.length === 0) {
    return {
      visitsCount: 0,
      averageScore: 0.0,
      tags: ['NORMAL'],
    };
  }

  const visitsCount = ratingsList.length;
  let totalScore = 0;
  let countOfScores = 0;

  const criterias = ratingsList.map(r => r.criteria);
  criterias.forEach(c => {
    totalScore += c.bookingTime + c.earlyNotice + c.staffResponse + c.storeManner + c.tableCleanup + c.recommendRevisit;
    countOfScores += 6;
  });

  const averageScore = Math.round((totalScore / countOfScores) * 10) / 10;
  const tags = classifyCustomerTags(averageScore, visitsCount, criterias);

  return {
    visitsCount,
    averageScore,
    tags,
  };
}

export const INITIAL_MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: '김태수',
    phoneSuffix: '5842',
    bookingNumber: 'R-20260611A',
    visitsCount: 4,
    averageScore: 4.8,
    tags: ['VIP'],
    notes: '마포 양지순대, 라치오 파스타 등 관내 4개 연합 매장 모두가 최고의 손님으로 인정한 청정 매너 소유자입니다. 방문 시 웰컴 드링크 제공 추천.',
    createdAt: '2026-03-12T18:30:00Z',
    ratings: [
      {
        id: 'rate-1-1',
        date: '2026-03-12',
        bookingNumber: 'R-20260312X',
        criteria: {
          bookingTime: 5,
          earlyNotice: 5,
          staffResponse: 5,
          storeManner: 5,
          tableCleanup: 4,
          recommendRevisit: 5,
        },
        raterName: '이은경 점장',
        restaurantName: '마포 양지순대국',
        restaurantType: '한식',
        memo: '처음 오셨는데 예약 시간보다 5분 일찍 방문하셨고, 태도가 친절하십니다.',
      },
      {
        id: 'rate-1-2',
        date: '2026-04-18',
        bookingNumber: 'R-20260418Y',
        criteria: {
          bookingTime: 5,
          earlyNotice: 5,
          staffResponse: 5,
          storeManner: 5,
          tableCleanup: 5,
          recommendRevisit: 5,
        },
        raterName: '강호진 매니저',
        restaurantName: '라치오 오스테리아',
        restaurantType: '양식',
        memo: '파스타 드신 후 식기들을 서빙 트레이에 들기 좋게 겹쳐서 정돈해 주셨습니다. 최고의 게스트 플레이어.',
      },
      {
        id: 'rate-1-3',
        date: '2026-05-20',
        bookingNumber: 'R-20260520P',
        criteria: {
          bookingTime: 4,
          earlyNotice: 5,
          staffResponse: 5,
          storeManner: 5,
          tableCleanup: 5,
          recommendRevisit: 5,
        },
        raterName: '이은경 점장',
        restaurantName: '도쿄스시 신촌점',
        restaurantType: '일식',
        memo: '동행하신 가족분들도 매우 교용하시고 매너가 완벽하셨습니다.',
      },
      {
        id: 'rate-1-4',
        date: '2026-06-11',
        bookingNumber: 'R-20260611A',
        criteria: {
          bookingTime: 5,
          earlyNotice: 5,
          staffResponse: 5,
          storeManner: 5,
          tableCleanup: 4,
          recommendRevisit: 5,
        },
        raterName: '백진우 바리스타',
        restaurantName: '클라우드 인더스트리 카페',
        restaurantType: '카페/디저트',
        memo: '서빙 시마다 매번 고개 숙여 따뜻하게 감사 편안한 눈인사를 건네 주셨습니다.',
      }
    ]
  },
  {
    id: 'cust-2',
    name: '이화령',
    phoneSuffix: '1094',
    bookingNumber: 'R-20260602M',
    visitsCount: 2,
    averageScore: 2.1,
    tags: ['CAUTION'],
    notes: '과도한 음주 시 데시벨 제어가 안 되며 직원 대상 무리한 강압적 요청 태도가 있습니다. 노쇼 위험군에 가깝습니다.',
    createdAt: '2026-05-15T20:00:00Z',
    ratings: [
      {
        id: 'rate-2-1',
        date: '2026-05-15',
        bookingNumber: 'R-20260515K',
        criteria: {
          bookingTime: 3,
          earlyNotice: 3,
          staffResponse: 2,
          storeManner: 2,
          tableCleanup: 2,
          recommendRevisit: 2,
        },
        raterName: '강호진 매니저',
        restaurantName: '소맥포차 밤거리',
        restaurantType: '술집/주점',
        memo: '과음 후 전 호실 테이블에 벨을 지연 누르며 이모라 반말을 사사건건 하심. 바닥에 액체를 흘린 것을 모른 체하고 퇴장하여 다른 손님 피해 위기였음.',
      },
      {
        id: 'rate-2-2',
        date: '2026-06-02',
        bookingNumber: 'R-20260602M',
        criteria: {
          bookingTime: 1,
          earlyNotice: 1,
          staffResponse: 2,
          storeManner: 3,
          tableCleanup: 2,
          recommendRevisit: 1,
        },
        raterName: '이은경 점장',
        restaurantName: '마포 양지순대국',
        restaurantType: '한식',
        memo: '전화조차 되지 않는 상태로 35분간 식탁을 비우게 한 후 불만 가득히 늦장 등장. 마감 대기 직전 서비스가 늦다며 직원에게 큰소리로 고함.',
      }
    ]
  },
  {
    id: 'cust-3',
    name: '박지철',
    phoneSuffix: '8839',
    bookingNumber: 'R-20260610Q',
    visitsCount: 1,
    averageScore: 2.7,
    tags: ['STRICT_CHECK'],
    notes: '한식 및 양식 라인 공유망 기록: 통보 없는 일방적 시간 미준수 이력이 있으므로, 단체 예약 시 사전에 예약금(Deposit) 징수나 사전 통화 권장합니다.',
    createdAt: '2026-06-10T19:00:00Z',
    ratings: [
      {
        id: 'rate-3-1',
        date: '2026-06-10',
        bookingNumber: 'R-20260610Q',
        criteria: {
          bookingTime: 2,
          earlyNotice: 1,
          staffResponse: 4,
          storeManner: 4,
          tableCleanup: 3,
          recommendRevisit: 2,
        },
        raterName: '지현우 대리',
        restaurantName: '라치오 오스테리아',
        restaurantType: '양식',
        memo: '예약 시간 10분 전에 문자 통보 하나만 남기고 임의로 40분 늦게 등장하여 메인 타임 테이블 점유 타격. 말투는 매너 있으시나 매장 타임라인 타격 주의.',
      }
    ]
  },
  {
    id: 'cust-4',
    name: '최현우',
    phoneSuffix: '2288',
    bookingNumber: 'R-20260605Z',
    visitsCount: 3,
    averageScore: 4.2,
    tags: ['RECOMMENDED'],
    notes: '아동 동반 단체 고객으로서, 흘리는 오염이 있어도 퇴장 전 적극적으로 티슈 클리닝을 돕는 매너 있는 양질의 단골 후보입니다.',
    createdAt: '2026-04-10T12:00:00Z',
    ratings: [
      {
        id: 'rate-4-1',
        date: '2026-04-10',
        bookingNumber: 'R-20260410C',
        criteria: {
          bookingTime: 4,
          earlyNotice: 4,
          staffResponse: 4,
          storeManner: 4,
          tableCleanup: 4,
          recommendRevisit: 4,
        },
        raterName: '백진우 사원',
        restaurantName: '클라우드 인더스트리 카페',
        restaurantType: '카페/디저트',
        memo: '유기농 케이크 부스러기가 나왔으나 본인이 다 담아서 반납해주시는 선한 매너.',
      },
      {
        id: 'rate-4-2',
        date: '2026-05-01',
        bookingNumber: 'R-20260501D',
        criteria: {
          bookingTime: 4,
          earlyNotice: 5,
          staffResponse: 5,
          storeManner: 4,
          tableCleanup: 3,
          recommendRevisit: 4,
        },
        raterName: '이은경 점장',
        restaurantName: '마포 양지순대국',
        restaurantType: '한식',
        memo: '자녀들과 함께 식사하느라 다소 바닥 클리닝 이슈가 있었으나, 미안하다며 테이블을 수건으로 직접 문지르시려고 노력하시어 전 직원이 감동함.',
      },
      {
        id: 'rate-4-3',
        date: '2026-06-05',
        bookingNumber: 'R-20260605Z',
        criteria: {
          bookingTime: 5,
          earlyNotice: 5,
          staffResponse: 5,
          storeManner: 4,
          tableCleanup: 4,
          recommendRevisit: 5,
        },
        raterName: '강호진 매니저',
        restaurantName: '라치오 오스테리아',
        restaurantType: '양식',
        memo: '주말 저녁 타임 정각 도착하셨고 메뉴 선택도 막힘없이 완만히 소통. 퇴장하며 칭찬 피드백을 두 차례 인상 깊게 말씀해주심.',
      }
    ]
  },
  {
    id: 'cust-5',
    name: '한예슬',
    phoneSuffix: '3771',
    bookingNumber: 'R-20260529F',
    visitsCount: 1,
    averageScore: 3.5,
    tags: ['NORMAL'],
    notes: '비교적 평온하며, 불필요한 마찰 없이 깔끔한 티타임을 마친 우량 일반 고객에 속합니다.',
    createdAt: '2026-05-29T13:00:00Z',
    ratings: [
      {
        id: 'rate-5-1',
        date: '2026-05-29',
        bookingNumber: 'R-20260529F',
        criteria: {
          bookingTime: 3,
          earlyNotice: 3,
          staffResponse: 4,
          storeManner: 4,
          tableCleanup: 3,
          recommendRevisit: 4,
        },
        raterName: '민선이 사원',
        restaurantName: '클라우드 인더스트리 카페',
        restaurantType: '카페/디저트',
        memo: '조용히 차 마시는 동안 조명 밝기 조절 등 사소한 것 이외에는 트러블 일체 없이 예의 바르게 행동하심.',
      }
    ]
  }
];
