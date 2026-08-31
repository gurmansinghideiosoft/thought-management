'use client';

import type { JSONContent } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Italic, Link2, Quote } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { JournalContent } from '@/lib/types';

function MenuButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex size-7 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-accent text-white'
          : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

export function JournalEditor({
  initialContent,
  onChange,
}: {
  initialContent: JournalContent;
  onChange: (content: JournalContent, text: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: 'end',
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Placeholder.configure({ placeholder: 'Write about your day…' }),
    ],
    content: initialContent as JSONContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none min-h-[62vh] pb-32 text-[17px] leading-8 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as JournalContent, e.getText()),
  });

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <>
      <BubbleMenu
        editor={editor}
        className="border-border bg-surface flex items-center gap-0.5 rounded-lg border p-1 shadow-lg shadow-black/10"
      >
        <MenuButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </MenuButton>
        <MenuButton active={editor.isActive('link')} onClick={setLink}>
          <Link2 size={15} />
        </MenuButton>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
}
