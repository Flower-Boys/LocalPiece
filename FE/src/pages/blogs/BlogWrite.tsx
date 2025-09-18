import { useState, useRef } from "react";
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

import { createBlog } from "../../api/blog";
import { BlogCreateRequest, BlogContentRequest } from "../../types/blog";
import SearchBar from "../../components/home/SearchBar";
import AuthButtons from "../../components/share/auth/AuthButtons";

const BlogWrite = () => {
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState<File[]>([]); // 업로드할 이미지 파일 목록
  const navigate = useNavigate();

  // ✅ 파일객체(File) → 에디터에 삽입한 미리보기 src(dataURL) 매핑
  //    File을 key로 쓰면 중복 파일명 충돌도 방지됨
  const previewSrcMap = useRef<Map<File, string>>(new Map());

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
    onUpdate: ({ editor }) => {
      // 에디터에 현재 남아 있는 img src 수집
      const html = editor.getHTML();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const liveSrcSet = new Set(Array.from(tempDiv.querySelectorAll("img")).map((img) => (img as HTMLImageElement).src));

      // ✅ images를 "해당 파일의 dataURL이 에디터에 실제로 남아있는가"로 필터
      setImages((prev) =>
        prev.filter((file) => {
          const src = previewSrcMap.current.get(file);
          return !!src && liveSrcSet.has(src);
        })
      );
    },
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
          const dataUrl = reader.result as string;

          // ✅ 매핑 먼저 저장
          previewSrcMap.current.set(file, dataUrl);

          // ✅ state에 파일 추가 (onUpdate에서 정확히 걸러짐)
          setImages((prev) => [...prev, file]);

          // ✅ 에디터에는 방금 생성한 dataURL로 삽입
          editor.chain().focus().setImage({ src: dataUrl }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 링크 삽입
  const addLink = () => {
    const url = window.prompt("링크 주소를 입력하세요");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  // 저장
  const handleSave = async () => {
    const contents: BlogContentRequest[] = [];
    let sequence = 1;

    // 1) 본문 TEXT: (명세가 TEXT/IMAGE 배열 요구하므로 img 태그 제거 후 텍스트만)
    const htmlContent = editor.getHTML();
    const cleanHtml = htmlContent.replace(/<img[^>]*>/g, "");
    if (cleanHtml.trim()) {
      contents.push({
        sequence: sequence++,
        contentType: "TEXT",
        content: cleanHtml,
      });
    }

    // 2) IMAGE: 현재 state(images)에 남은 파일만 그대로 추가
    //    (onUpdate에서 이미 '실제로 남은 것'만 유지되므로, 여기서는 그대로 쓰면 됨)
    images.forEach((file) => {
      contents.push({
        sequence: sequence++,
        contentType: "IMAGE",
        content: file.name,
      });
    });

    const requestData: BlogCreateRequest = {
      title,
      isPrivate,
      contents,
    };

    try {
      const response = await createBlog(requestData, images);
      alert("블로그 저장 완료!");
      navigate(`/blog/${response.id}`);
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("블로그 저장 중 오류가 발생했습니다.");
    }
  };
  const handleSearch = (params: { sigunguCode?: string; contentTypeId?: string; keyword?: string }) => {
    const nextParams = new URLSearchParams();

    if (params.sigunguCode) nextParams.set("sigunguCode", params.sigunguCode);
    if (params.contentTypeId) nextParams.set("contentTypeId", params.contentTypeId);
    if (params.keyword) nextParams.set("keyword", params.keyword);

    nextParams.set("page", "1"); // 검색 시 항상 1페이지부터 시작
    nextParams.set("arrange", "R"); // ✅ 대표이미지 + 생성일순 정렬
    navigate({ pathname: "/", search: nextParams.toString() });
  };
  return (
    <div>
      {/* ✅ 상단 헤더: 전체폭 */}
      <section className="from-pink-500 to-red-500 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr,2fr,1fr] items-center gap-4">
          <div></div>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
          <div className="flex justify-end">
            <AuthButtons />
          </div>
        </div>
      </section>
      <div className="border-b py-2 border-gray-300"></div>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
        {/* 제목 + 뒤로가기 */}
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
    </div>
  );
};

export default BlogWrite;
