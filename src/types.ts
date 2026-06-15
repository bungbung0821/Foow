export interface RatingCriteria {
  bookingTime: number;      // 예약 시간 준수
  earlyNotice: number;      // 사전 연락 여부 (상황 변경 시 미끼 알림 등)
  staffResponse: number;    // 직원 응대 태도
  storeManner: number;      // 매장 이용 매너
  tableCleanup: number;     // 테이블 정리 상태
  recommendRevisit: number; // 재방문 응대 추천도
}

export type CustomerTag = 'VIP' | 'RECOMMENDED' | 'NORMAL' | 'CAUTION' | 'STRICT_CHECK';

export interface RatingRecord {
  id: string;
  date: string;            // YYYY-MM-DD
  bookingNumber: string;    // 예약번호
  criteria: RatingCriteria;
  raterName: string;       // 작성자 (매니저/홀 직원 등)
  restaurantName: string;  // 작성 업장명 (예: 우가네 삼겹살, 도쿄스시 등)
  restaurantType?: string; // 업소 카테고리 (한식, 일식, 양식, 카페, 술집 등)
  memo: string;            // 메모
}

export interface Customer {
  id: string;
  name: string;
  phoneSuffix: string;     // 휴대폰 뒷번호 (e.g. 1234)로 식별력 향상
  bookingNumber: string;   // 최근 예약번호
  visitsCount: number;
  averageScore: number;
  tags: CustomerTag[];
  notes: string;           // 종합 메모
  ratings: RatingRecord[];
  createdAt: string;       // 최초 등록일시
}
