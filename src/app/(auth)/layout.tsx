export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/60 flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}
