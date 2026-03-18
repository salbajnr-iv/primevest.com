import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Support</h1>
        <div className="space-x-2">
          <Link href="/admin/support">
            <Button variant="ghost">Chats List</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
