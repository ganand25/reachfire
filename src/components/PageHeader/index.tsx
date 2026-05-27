import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  children,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{title}</h1>
          {badge && (
            <span className={cn('text-xs px-2 py-0.5 rounded bg-primary/15 text-primary')}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
      </div>

      {children && <div>{children}</div>}
    </div>
  );
}
