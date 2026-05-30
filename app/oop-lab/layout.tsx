export default function OopLabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-[calc(100dvh-var(--app-header-h))] min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}
