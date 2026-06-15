import { AlertTriangle, ShieldCheck, HeartHandshake, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function EthicsGuide() {
  return (
    <motion.div
      id="ethics-guide-panel"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          올바른 고객 방문 매너 평가 가이드
        </h3>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
        GuestRate는 고객을 악의적으로 감시하거나 비난하기 위한 도구가 아닙니다.
        행동 기준과 명확한 사실 중심의 기록을 통해 현장 직원의 정신적 고통을 경감하고,
        모든 매니저와 서포터가 동일한 정량적 기준 위에서 매끄럽게 응대할 수 있도록 설계되었습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 핵심 가이드 3원칙 */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 border-l-2 border-indigo-500 pl-2">
            평가 작성 3대 핵심 원칙
          </h4>
          
          <div className="flex gap-2.5">
            <div className="bg-indigo-100 dark:bg-indigo-950/50 p-1.5 rounded-lg h-fit text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-300">
                1. 철저한 감정 분리 및 사실 위주 서술
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                "성격이 이상함" 대신 "예약 변경 통보 없이 30분 지각하여 입장함" 또는 "직원에게 존대어를 쓰고 인사를 건넴"처럼 행동 위주로 가감 없이 기록하세요.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="bg-amber-100 dark:bg-amber-950/50 p-1.5 rounded-lg h-fit text-amber-600 dark:text-amber-400 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-300">
                2. 편견 및 차별적 언사 절대 금지
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                성별, 나이, 직업, 국적, 외모, 옷차림에 대한 추측 및 폄하 표현을 일체 사용하지 않고, 오직 매장 기물 위생 관리와 매너 점수 요건으로 판단합니다.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="bg-emerald-100 dark:bg-emerald-950/50 p-1.5 rounded-lg h-fit text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-300">
                3. 우수 고객을 위한 감사 표시
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                주의 고객 기록도 중요하지만, 정중하고 예의 바르게 행동한 우수 고객(VIP)들의 상세 요소를 적어 전 직원이 더 귀중히 대접할 수 있도록 하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 올바른 기록 vs 나쁜 기록 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            평가 메모 올바른 표현 예시
          </h4>

          <div className="space-y-2 text-[11px]">
            <div className="p-2 bg-rose-50/50 dark:bg-rose-950/20 border-l-2 border-rose-400 rounded-r">
              <span className="font-semibold text-rose-700 dark:text-rose-300 block mb-0.5">❌ 감정적/차별적 서술</span>
              "나이 많은 꼰대 손님이라 유세 떨고 직원을 엄청 귀찮게 괴롭히며 불통임. 식사 모습도 시끄럽고 무례함."
            </div>
            <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-emerald-400 rounded-r">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-0.5">✅ 사실/행동 중심 서술</span>
              "메뉴 추천 시 다소 긴 설명 요청이 반복되었으며, 호흡기가 불편한 상황으로 대화 데시벨이 높음. 직원 호출 벨을 여러 차례 연달아 누르셨으나 응대 시 태도는 정중함."
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
