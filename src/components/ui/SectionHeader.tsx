interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`border-b border-vc-border pb-10 ${className}`}>
      {eyebrow && (
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-vc-secondary">
          {eyebrow}
        </div>
      )}
      <h1 className="mt-4 text-3xl md:text-4xl font-serif font-light">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-sm text-vc-tertiary max-w-xl">{description}</p>
      )}
    </header>
  );
}
