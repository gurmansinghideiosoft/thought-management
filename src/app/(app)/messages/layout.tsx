import { ConversationList } from '@/components/messages/conversation-list';

export default function MessagesLayout({ children }: LayoutProps<'/messages'>) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="border-hairline bg-surface/40 hidden w-72 shrink-0 border-r sm:block">
        <ConversationList />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
