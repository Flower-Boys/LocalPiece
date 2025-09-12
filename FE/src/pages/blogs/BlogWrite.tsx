import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight/lib/core";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, ImagePlus, ArrowLeft } from "lucide-react";

const BlogWrite = () => {
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: true }),
      Image,
      BulletList,
      OrderedList,
      Blockquote,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: "<p>여행의 추억을 기록해보세요 ✈️</p>",
  });

  if (!editor) return null;

  // 이미지 업로드
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          editor
            .chain()
            .focus()
            .setImage({ src: reader.result as string })
            .run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 링크 삽입
  const addLink = () => {
    const url = window.prompt("링크 주소를 입력하세요");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // 저장
  const handleSave = () => {
    const requestData = {
      title,
      content: editor.getHTML(),
      isPrivate,
    };

    console.log("Request Payload:", requestData);
    alert("블로그 저장됨! (API 연동 예정)");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">✍️ 블로그 작성</h1>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-400 hover:bg-gray-200 text-white hover:text-gray-700 transition">
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">뒤로가기</span>
        </button>
      </div>

      {/* 제목 입력 */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full text-xl font-semibold border-b border-gray-300 p-2 mb-6 focus:outline-none"
      />

      {/* 툴바 */}
      <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive("bold") ? "bg-gray-300" : "bg-gray-100"}`}>
          <Bold size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive("italic") ? "bg-gray-300" : "bg-gray-100"}`}>
          <Italic size={16} />
        </button>
        <button onClick={addLink} className="p-2 rounded bg-gray-100 hover:bg-gray-200">
          <LinkIcon size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-gray-300" : "bg-gray-100"}`}>
          <List size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-gray-300" : "bg-gray-100"}`}>
          <ListOrdered size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-gray-300" : "bg-gray-100"}`}>
          <Quote size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-2 rounded ${editor.isActive("codeBlock") ? "bg-gray-300" : "bg-gray-100"}`}>
          <Code size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : "bg-gray-100"}`}>
          <Heading1 size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : "bg-gray-100"}`}>
          <Heading2 size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-gray-300" : "bg-gray-100"}`}>
          <Heading3 size={16} />
        </button>
        <button onClick={addImage} className="p-2 rounded bg-gray-100 hover:bg-gray-200">
          <ImagePlus size={16} />
        </button>
      </div>

      {/* 본문 */}
      <div className="border rounded-lg p-3 min-h-[600px] prose prose-lg max-w-none">
        <EditorContent editor={editor} className="min-h-[500px]" />
      </div>

      {/* 공개 여부 */}
      <div className="flex items-center gap-2 mt-4">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
        <label className="text-gray-700">비공개로 설정</label>
      </div>

      {/* 저장 버튼 */}
      <button onClick={handleSave} className="mt-6 w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">
        저장하기
      </button>
    </div>
  );
};

export default BlogWrite;
