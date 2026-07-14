import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconH1,
  IconH2,
  IconBulletList,
  IconOrderedList,
} from "./Icons";

export default function RichTextEditor({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content || "",
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  // Keep editor content in sync if the document loads/changes after mount
  // (e.g. navigating directly to a document URL).
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  const tools = [
    { icon: IconBold, label: "Bold", active: "bold", run: () => editor.chain().focus().toggleBold().run() },
    { icon: IconItalic, label: "Italic", active: "italic", run: () => editor.chain().focus().toggleItalic().run() },
    { icon: IconUnderline, label: "Underline", active: "underline", run: () => editor.chain().focus().toggleUnderline().run() },
  ];
  const blocks = [
    { icon: IconH1, label: "Heading 1", active: "heading", attrs: { level: 1 }, run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: IconH2, label: "Heading 2", active: "heading", attrs: { level: 2 }, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  ];
  const lists = [
    { icon: IconBulletList, label: "Bullet list", active: "bulletList", run: () => editor.chain().focus().toggleBulletList().run() },
    { icon: IconOrderedList, label: "Numbered list", active: "orderedList", run: () => editor.chain().focus().toggleOrderedList().run() },
  ];

  const renderGroup = (group) =>
    group.map(({ icon: Icon, label, active, attrs, run }) => (
      <button
        key={label}
        type="button"
        className={`icon-button ${editor.isActive(active, attrs) ? "active" : ""}`}
        onClick={run}
        title={label}
      >
        <Icon />
      </button>
    ));

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        {renderGroup(tools)}
        <span className="toolbar-divider" />
        {renderGroup(blocks)}
        <span className="toolbar-divider" />
        {renderGroup(lists)}
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
