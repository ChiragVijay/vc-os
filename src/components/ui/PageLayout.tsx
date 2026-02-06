import { AppHeader } from "./AppHeader";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-vc-primary">
      <AppHeader />
      {children}
    </div>
  );
}
