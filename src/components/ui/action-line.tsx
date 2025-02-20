export function ActionLine({
  children,
  action,
  description,
}: React.PropsWithChildren<{ action: string; description?: string }>) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p>{action}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
