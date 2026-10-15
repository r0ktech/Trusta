import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info, MessageCircle, MoreVertical, Search, Send, Trash2 } from 'lucide-react';
import { useMessages } from '../context/MessagesContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getCategory } from '../data/categories';
import { Avatar } from '../components/ui/Avatar';
import { DemoTag } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { cn, formatChatDay, formatRelative, formatTime } from '../utils/format';

export default function MessagesPage() {
  useDocumentTitle('Messages');
  const { conversations, sendMessage, markRead, deleteConversation } = useMessages();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const activeId = params.get('c');
  const active = conversations.find((c) => c.id === activeId) ?? null;

  const select = (id) => setParams(id ? { c: id } : {}, { replace: false });

  useEffect(() => {
    if (active?.unread) markRead(active.id);
  }, [active, markRead]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.participantName.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [conversations, search]);

  return (
    <div className="container-page flex flex-1 flex-col py-0 md:py-6">
      <div className="flex h-[calc(100dvh-8rem)] min-h-[28rem] overflow-hidden border-line bg-surface md:h-[calc(100dvh-10rem)] md:rounded-2xl md:border md:shadow-card">
        {/* Conversation list */}
        <section
          aria-label="Conversations"
          className={cn('flex w-full flex-col border-line md:w-80 md:shrink-0 md:border-r', active && 'hidden md:flex')}
        >
          <div className="border-b border-line p-4">
            <h1 className="text-xl font-extrabold">Messages</h1>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
              <label htmlFor="conv-search" className="sr-only">
                Search conversations
              </label>
              <input
                id="conv-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="input-base h-10 py-2 pl-9 text-sm"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const last = c.messages[c.messages.length - 1];
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    aria-current={c.id === activeId ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 border-b border-line/60 px-4 py-3.5 text-left transition-colors',
                      c.id === activeId ? 'bg-accent-soft' : 'hover:bg-surface2/60',
                    )}
                  >
                    <Avatar name={c.participantName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('truncate text-sm text-ink', c.unread ? 'font-bold' : 'font-semibold')}>{c.participantName}</span>
                        <span className="shrink-0 text-[11px] text-subtle">{formatRelative(c.updatedAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className={cn('truncate text-sm', c.unread ? 'font-medium text-ink' : 'text-muted')}>
                          {last ? `${last.sender === 'me' ? 'You: ' : ''}${last.text}` : 'Start the conversation'}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white dark:text-on-primary">
                            {c.unread}
                            <span className="sr-only"> unread</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {!filtered.length && (
              <li className="px-4 py-10 text-center text-sm text-muted">
                {conversations.length ? `No conversations match “${search}”.` : 'No conversations yet.'}
              </li>
            )}
          </ul>
          <p className="flex items-start gap-2 border-t border-line px-4 py-3 text-xs text-subtle">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Messages are simulated and stored on this device. Nothing is delivered to real people.
          </p>
        </section>

        {/* Conversation view */}
        <section aria-label="Conversation" className={cn('min-w-0 flex-1 flex-col', active ? 'flex' : 'hidden md:flex')}>
          {active ? (
            <Thread
              key={active.id}
              conversation={active}
              onBack={() => select(null)}
              onSend={(text) => sendMessage(active.id, text)}
              onDelete={() => {
                deleteConversation(active.id);
                select(null);
              }}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={MessageCircle}
                className="border-0"
                title={conversations.length ? 'Select a conversation' : 'No messages yet'}
                description={
                  conversations.length
                    ? 'Choose a conversation from the list to read and reply.'
                    : 'Open a provider’s profile and tap “Send Message” to start a conversation.'
                }
              >
                {!conversations.length && <ButtonLink to="/explore">Find a provider</ButtonLink>}
              </EmptyState>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Thread({ conversation, onBack, onSend, onDelete }) {
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { toast } = useToast();
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [conversation.messages.length]);

  const groups = useMemo(() => {
    const out = [];
    conversation.messages.forEach((m) => {
      const day = formatChatDay(m.sentAt);
      const g = out[out.length - 1];
      if (g && g.day === day) g.items.push(m);
      else out.push({ day, items: [m] });
    });
    return out;
  }, [conversation.messages]);

  const submit = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
    inputRef.current?.focus();
  };

  const isLocal = conversation.artisanId === 'local-provider';

  return (
    <>
      <header className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-5">
        <button type="button" onClick={onBack} className="rounded-lg p-2 text-muted hover:bg-surface2 md:hidden" aria-label="Back to conversations">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={conversation.participantName} size="sm" />
        <div className="min-w-0 flex-1">
          <Link to={`/artisan/${conversation.artisanId}`} className="block truncate font-semibold text-ink hover:underline">
            {conversation.participantName}
          </Link>
          <p className="truncate text-xs text-muted">{getCategory(conversation.participantCategory)?.provider}</p>
        </div>
        <DemoTag className="hidden sm:inline-flex">Simulated</DemoTag>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-haspopup="menu"
            aria-expanded={menu}
            className="rounded-lg p-2 text-muted hover:bg-surface2"
            aria-label="Conversation options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-line bg-surface p-1.5 shadow-pop">
              <Link role="menuitem" to={`/artisan/${conversation.artisanId}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface2">
                View profile
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setMenu(false);
                  setConfirm(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete conversation
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-canvas/60 px-3 py-5 sm:px-6" aria-live="polite">
        {groups.length === 0 && (
          <div className="mx-auto mt-10 max-w-sm text-center">
            <p className="font-semibold text-ink">Say hello to {conversation.participantName.split(' ')[0]}</p>
            <p className="mt-1 text-sm text-muted">Ask about availability, pricing or materials. {isLocal ? 'This is your own listing.' : 'This is a fictional demo provider — they won’t reply.'}</p>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.day} className="mb-4">
            <p className="my-3 text-center text-xs font-medium text-subtle">{g.day}</p>
            <ul className="space-y-1.5">
              {g.items.map((m) => {
                const mine = m.sender === 'me';
                return (
                  <li key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug sm:max-w-[70%]',
                        mine ? 'rounded-br-md bg-primary text-on-primary' : 'rounded-bl-md border border-line bg-surface text-ink',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className={cn('mt-1 text-right text-[11px]', mine ? 'text-on-primary/70' : 'text-subtle')}>
                        <span className="sr-only">{mine ? 'You, ' : `${conversation.participantName}, `}</span>
                        {formatTime(m.sentAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line bg-surface p-3 sm:p-4">
        <label htmlFor="message-input" className="sr-only">
          Write a message
        </label>
        <textarea
          id="message-input"
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={1000}
          placeholder="Write a message…"
          className="input-base max-h-32 min-h-[44px] flex-1 resize-none py-2.5"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary transition-opacity disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this conversation?"
        description="The conversation will be removed from this device."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {
          onDelete();
          toast({ title: 'Conversation deleted', variant: 'info' });
        }}
      />
    </>
  );
}
