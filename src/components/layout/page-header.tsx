interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-hub to-preditor bg-clip-text text-transparent">
        {title}
      </h1>
      {description && (
        <p className="text-sm font-mono text-foreground-dim mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
