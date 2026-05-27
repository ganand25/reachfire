import { cn } from '@/lib/utils';

interface FireScoreProps {
  score: number; // 0–100
  className?: string;
  showLevel?: boolean;
}

interface FireLevel {
  name: string;
  minScore: number;
  color: string;
  emoji: string;
}

const FIRE_LEVELS: FireLevel[] = [
  { name: 'Spark', minScore: 0, color: 'text-muted-foreground', emoji: '✨' },
  { name: 'Ember', minScore: 20, color: 'text-amber-400', emoji: '🔥' },
  { name: 'Flame', minScore: 40, color: 'text-orange-400', emoji: '🔥' },
  { name: 'Blaze', minScore: 60, color: 'text-orange-300', emoji: '🔥' },
  { name: 'Inferno', minScore: 80, color: 'text-yellow-300', emoji: '⚡' },
];

export function getFireLevel(score: number): FireLevel {
  const clamped = Math.min(100, Math.max(0, score));
  let level = FIRE_LEVELS[0];
  for (const l of FIRE_LEVELS) {
    if (clamped >= l.minScore) level = l;
  }
  return level;
}

export function calculateFireScore(params: {
  savingsRate: number; // 0-100
  hasEmergencyFund: boolean;
  debtToIncomeRatio: number; // 0-1 (lower is better)
  progressToFireNumber: number; // 0-1
  diversified: boolean;
}): number {
  let score = 0;

  // Savings rate (40 points max)
  score += Math.min(40, params.savingsRate * 0.8);

  // Emergency fund (15 points)
  if (params.hasEmergencyFund) score += 15;

  // Debt ratio (20 points)
  score += Math.max(0, 20 - params.debtToIncomeRatio * 40);

  // Progress to FIRE (20 points)
  score += Math.min(20, params.progressToFireNumber * 20);

  // Diversification (5 points)
  if (params.diversified) score += 5;

  return Math.round(Math.min(100, score));
}

export function FireScore({
  score,
  className,
  showLevel = true,
}: FireScoreProps): React.JSX.Element {
  const level = getFireLevel(score);
  const percent = score;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="url(#score-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 34}
            strokeDashoffset={2 * Math.PI * 34 * (1 - percent / 100)}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          <defs>
            <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="oklch(0.62 0.26 35)" />
              <stop offset="1" stopColor="oklch(0.82 0.18 75)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{score}</span>
        </div>
      </div>
      {showLevel && (
        <div className={cn('text-sm font-semibold', level.color)}>
          {level.emoji} {level.name}
        </div>
      )}
    </div>
  );
}
