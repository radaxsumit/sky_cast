export function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`card rounded-[26px] ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ icon: Icon, children, aside }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-ink-muted flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
        {children}
      </h2>
      {aside}
    </div>
  );
}
