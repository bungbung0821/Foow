import { useState, FormEvent } from 'react';
import { X, UserPlus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCustomer: Omit<Customer, 'id' | 'averageScore' | 'visitsCount' | 'tags' | 'ratings' | 'createdAt'>) => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSubmit }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setPhoneSuffix('');
    setBookingNumber('');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('고객 성함 또는 닉네임을 입력해 주세요.');
      return;
    }

    if (phoneSuffix.length > 0 && !/^\d{4}$/.test(phoneSuffix)) {
      setError('휴대폰 뒷자리는 숫자 4자리로 정확하게 입력해 주세요.');
      return;
    }

    // 기본 예약번호 자동 생성 (없을 시)
    const bookingCode = bookingNumber.trim() || `R-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    onSubmit({
      name: name.trim(),
      phoneSuffix: phoneSuffix.trim() || '정보없음',
      bookingNumber: bookingCode,
      notes: notes.trim(),
    });

    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 백드롭 레이어 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs"
          />

          {/* 모달 박스 컨테이너 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden relative z-10"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-150">
                  신규 장부 고객 기본 등록
                </h3>
              </div>
              <button
                id="btn-close-register-modal"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 폼 필드 입력 */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 고객 성명 */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                    고객 성함 또는 닉네임 *
                  </label>
                  <input
                    id="input-new-customer-name"
                    type="text"
                    required
                    placeholder="예: 홍길동 (또는 단골명)"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* 휴대폰 뒷자리 식별값 */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                    휴대폰 뒷번호 (4자리)
                  </label>
                  <input
                    id="input-new-customer-phone"
                    type="text"
                    maxLength={4}
                    placeholder="예: 0820 (미기입 가능)"
                    value={phoneSuffix}
                    onChange={(e) => { 
                      const cleanValue = e.target.value.replace(/\D/g, '');
                      setPhoneSuffix(cleanValue); 
                      setError(''); 
                    }}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* 최근 예약번호 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  방문 예약번호 (선택)
                </label>
                <input
                  id="input-new-customer-booking"
                  type="text"
                  placeholder="예: R-20260612X (공란 시 당일 자동 생성)"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* 기본 설명/메모 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  고객 종합 특이사항 메모
                </label>
                <textarea
                  id="textarea-new-customer-notes"
                  rows={3}
                  placeholder="예: 선호하는 테이블 위치, 알레르기 식품군, 홀 응대 시 선호사항 또는 특이사항 기록"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 flex gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  고객 이름 또는 휴대폰 뒷자리 식별 번호를 설정하면, 신속하게 고객을 매칭하고 방문 평점을 점수로 환산하여 직원들이 참고할 수 있습니다.
                </p>
              </div>

              {/* 버튼 액션 */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="btn-cancel-new-customer"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-lg cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button
                  id="btn-submit-new-customer"
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  고객 추가 완료
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
