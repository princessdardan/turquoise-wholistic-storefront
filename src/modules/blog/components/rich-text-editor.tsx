"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { useEffect, useCallback } from "react"

// ─── Toolbar Button ───────────────────────────────────────────────

const ToolbarButton = ({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      px-2 py-1 rounded text-sm font-medium transition-colors
      ${active ? "bg-turquoise-100 text-turquoise-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}
      ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    {children}
  </button>
)

const ToolbarSeparator = () => <div className="w-px h-5 bg-gray-200 mx-1" />

// ─── Toolbar ──────────────────────────────────────────────────────

const Toolbar = ({ editor }: { editor: Editor }) => {
  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL:", previousUrl || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const insertCta = useCallback(() => {
    const ctaId = window.prompt("Enter CTA ID:")
    if (ctaId) {
      editor.chain().focus().insertContent(`[cta:${ctaId}]`).run()
    }
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Headings */}
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 4 }).run()
        }
        active={editor.isActive("heading", { level: 4 })}
        title="Heading 4"
      >
        H4
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        &bull; List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered List"
      >
        1. List
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Block formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        &ldquo; Quote
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
      >
        {"</>"}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        &#x2500;&#x2500;
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Text alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        &#x2261;L
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        &#x2261;C
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        &#x2261;R
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Links & Media */}
      <ToolbarButton
        onClick={addLink}
        active={editor.isActive("link")}
        title="Insert Link"
      >
        Link
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        Image
      </ToolbarButton>

      <ToolbarSeparator />

      {/* CTA Embed */}
      <button
        type="button"
        onClick={insertCta}
        className="px-3 py-1 text-xs font-medium rounded bg-turquoise-50 text-turquoise-700 border border-turquoise-200 hover:bg-turquoise-100 transition-colors cursor-pointer"
      >
        Insert CTA
      </button>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        &#x21A9;
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        &#x21AA;
      </ToolbarButton>
    </div>
  )
}

// ─── Editor Styles ────────────────────────────────────────────────

const editorStyles = `
  .sf-tiptap-editor .ProseMirror {
    outline: none;
    min-height: var(--editor-min-height, 400px);
    padding: 16px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.7;
  }
  .sf-tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }
  .sf-tiptap-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 1em 0 0.5em; }
  .sf-tiptap-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.5em; }
  .sf-tiptap-editor .ProseMirror h4 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; }
  .sf-tiptap-editor .ProseMirror p { margin: 0.5em 0; }
  .sf-tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
  .sf-tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
  .sf-tiptap-editor .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; margin: 0.5em 0; color: #6b7280; font-style: italic; }
  .sf-tiptap-editor .ProseMirror pre { background: #f3f4f6; border-radius: 6px; padding: 0.75em 1em; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9em; margin: 0.5em 0; overflow-x: auto; }
  .sf-tiptap-editor .ProseMirror code { background: #f3f4f6; border-radius: 3px; padding: 0.1em 0.3em; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9em; }
  .sf-tiptap-editor .ProseMirror pre code { background: none; padding: 0; }
  .sf-tiptap-editor .ProseMirror a { color: #1F8A7E; text-decoration: underline; cursor: pointer; }
  .sf-tiptap-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 6px; margin: 0.5em 0; }
  .sf-tiptap-editor .ProseMirror hr { border: none; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
`

// ─── Component ────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article...",
  minHeight = 400,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image,
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div>
      <style>{editorStyles}</style>
      <div
        className="sf-tiptap-editor rounded-lg border border-gray-300 overflow-hidden bg-white"
        style={
          { "--editor-min-height": `${minHeight}px` } as React.CSSProperties
        }
      >
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
