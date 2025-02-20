import { Card } from "@/components/ui/card";

export default function MdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto max-w-screen-xl px-4">
      <main className="prose dark:prose-dark">
        <Card>{children}</Card>
      </main>
    </div>
  );
}
