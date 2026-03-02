"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────

type ToolbarMode = "medium" | "full"

interface RichTextEditorProps {
  /** HTML content string */
  value: string
  /** Callback when content changes (receives HTML) */
  onChange: (html: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Toolbar mode: "medium" for basic, "full" for all features */
  mode?: ToolbarMode
  /** Minimum height in pixels */
  minHeight?: number
}

// ─── Toolbar Button ───────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

const ToolbarButton = ({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      px-2 py-1 rounded text-sm font-medium transition-colors
      ${active ? "bg-turquoise-100 text-turquoise-700" : "text-grey-50 hover:text-grey-80 hover:bg-grey-10"}
      ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    {children}
  </button>
)

// ─── Toolbar Separator ────────────────────────────────────────────

const ToolbarSeparator = () => (
  <div className="w-px h-5 bg-grey-20 mx-1" />
)

// ─── Toolbar ──────────────────────────────────────────────────────

const Toolbar = ({
  editor,
  mode,
}: {
  editor: Editor
  mode: ToolbarMode
}) => {
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

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-grey-20 bg-grey-5">
      {/* Text formatting — always shown */}
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

      <ToolbarSeparator />

      {/* Headings — full mode only */}
      {mode === "full" && (
        <>
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
        </>
      )}

      {/* Lists — always shown */}
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

      {/* Blockquote — always shown */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        &ldquo; Quote
      </ToolbarButton>

      {mode === "full" && (
        <>
          {/* Full-mode block formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          >
            {"</>"}
          </ToolbarButton>
        </>
      )}

      <ToolbarSeparator />

      {/* Links — always shown */}
      <ToolbarButton
        onClick={addLink}
        active={editor.isActive("link")}
        title="Insert Link"
      >
        Link
      </ToolbarButton>

      {mode === "full" && (
        <ToolbarButton onClick={addImage} title="Insert Image">
          Image
        </ToolbarButton>
      )}

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
  .storefront-editor .ProseMirror {
    outline: none;
    min-height: var(--editor-min-height, 300px);
    padding: 16px;
  }

  .storefront-editor .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9CA3AF;
    pointer-events: none;
    height: 0;
  }

  .storefront-editor .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: 700;
    margin: 1em 0 0.5em;
  }

  .storefront-editor .ProseMirror h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 0.75em 0 0.5em;
  }

  .storefront-editor .ProseMirror h4 {
    font-size: 1.1em;
    font-weight: 600;
    margin: 0.5em 0 0.25em;
  }

  .storefront-editor .ProseMirror p {
    margin: 0.5em 0;
  }

  .storefront-editor .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .storefront-editor .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .storefront-editor .ProseMirror blockquote {
    border-left: 3px solid #D1D5DB;
    padding-left: 1em;
    margin: 0.5em 0;
    color: #6B7280;
    font-style: italic;
  }

  .storefront-editor .ProseMirror pre {
    background: #F3F4F6;
    border-radius: 6px;
    padding: 0.75em 1em;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 0.9em;
    margin: 0.5em 0;
    overflow-x: auto;
  }

  .storefront-editor .ProseMirror code {
    background: #F3F4F6;
    border-radius: 3px;
    padding: 0.1em 0.3em;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 0.9em;
  }

  .storefront-editor .ProseMirror pre code {
    background: none;
    padding: 0;
  }

  .storefront-editor .ProseMirror a {
    color: #1F8A7E;
    text-decoration: underline;
    cursor: pointer;
  }

  .storefront-editor .ProseMirror img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 0.5em 0;
  }

  .storefront-editor .ProseMirror hr {
    border: none;
    border-top: 1px solid #D1D5DB;
    margin: 1.5em 0;
  }
`

// ─── Component ────────────────────────────────────────────────────

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
  mode = "full",
  minHeight = 300,
}: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
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
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  // Sync external value changes (e.g. form reset, loading edit data)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const charCount = editor.getText().length

  return (
    <div>
      <style>{editorStyles}</style>
      <div
        className="storefront-editor rounded-lg border border-grey-20 overflow-hidden bg-white"
        style={{ "--editor-min-height": `${minHeight}px` } as React.CSSProperties}
      >
        <Toolbar editor={editor} mode={mode} />
        <EditorContent editor={editor} />
      </div>
      <p className="text-xs text-grey-40 mt-1">
        {charCount.toLocaleString()} characters
      </p>
    </div>
  )
}

export default RichTextEditor
