import { Users, Star, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Customer } from '../types';

interface DashboardStatsProps {
  customers: Customer[];
}

export default function DashboardStats({ customers }: DashboardStatsProps) {
  // 전체 고객 수
  const totalCount = customers.length;

  // 전체 평균 점수
  const validCustomersWithScores = customers.filter(c => c.visitsCount > 0);
  const averageMannerScore = validCustomersWithScores.length > 0
    ? Math.round((validCustomersWithScores.reduce((sum, c) => sum + c.averageScore, 0) / validCustomersWithScores.length) * 10) / 10
    : 0.0;

  // 재방문 추천 고객 수 (RECOMMENDED or VIP)
  const recommendedCount = customers.filter(c => c.tags.includes('RECOMMENDED') || c.tags.includes('VIP')).length;

  // 주의 필요 고객 수 (CAUTION)
  const cautionCount = customers.filter(c => c.tags.includes('CAUTION')).length;

  // 예약 확인 필요 고객 수 (STRICT_CHECK)
  const strictCheckCount = customers.filter(c => c.tags.includes('STRICT_CHECK')).length;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const stats = [
    {
      id: 'stat-total-guests',
      title: '누적 등록 고객',
      value: `${totalCount}명`,
      description: '등록된 전체 고객 장부 수',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-100 dark:border-indigo-900/40',
    },
    {
      id: 'stat-avg-score',
      title: '종합 매너 점수',
      value: `${averageMannerScore.toFixed(1)} / 5.0`,
      description: '전체 방문 평가 평균점',
      icon: Star,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      id: 'stat-recommended',
      title: '재방문 추천 우수자',
      value: `${recommendedCount}명`,
      description: 'VIP 및 적극 추천 방문자',
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      id: 'stat-caution',
      title: '주의/추가확인 대상',
      value: `${cautionCount + strictCheckCount}명`,
      description: `주의 필요 ${cautionCount}명 · 확인 요망 ${strictCheckCount}명`,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-100 dark:border-rose-900/40',
    },
  ];

  return (
    <div id="dashboard-statistics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <motion.div
          id={`stat-card-${stat.id}`}
          key={stat.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: idx * 0.08 }}
          className={`bg-white dark:bg-slate-900 border ${stat.borderColor} rounded-xl px-5 py-4 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300`}
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {stat.title}
            </span>
            <div className="flex items-baseline gap-1.5 focus:outline-none">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {stat.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-300" />
              {stat.description}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} flex-shrink-0`}>
            <stat.icon id={`stat-icon-${stat.id}`} className="w-6 h-6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
