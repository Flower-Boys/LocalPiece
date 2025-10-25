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
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, ImagePlus, ArrowLeft, Hash, X } from "lucide-react";

import { createBlog } from "@/api/blog";
import { BlogCreateRequest, BlogContentRequest } from "@/types/blog";
import SearchBar from "@/components/home/SearchBar";
import AuthButtons from "@/components/share/auth/AuthButtons";
import Dropcursor from "@tiptap/extension-dropcursor";

const MAX_TAGS = 10;
const MAX_TAG_LEN = 20;

const BlogWrite = () => {
  const [title, setTitle] = useState("");
  const [Private, setPrivate] = useState(false);
  const [images, setImages] = useState<File[]>([]); // 업로드할 이미지 파일 목록

  // ✅ 해시태그 상태
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();
  // ✅ 빈/의미없는 HTML인지 판별
  const isMeaningfulHtml = (html: string) => {
    const trimmed = html.replace(/<p><br\/?><\/p>/g, "").trim();
    const withoutTags = trimmed.replace(/<[^>]+>/g, "").trim();
    return Boolean(trimmed) && Boolean(withoutTags); // 태그만 있는 덩어리는 버림
  };

  // ✅ dataURL(src) → 파일명 역매핑 생성
  const buildSrcToFileNameMap = (previewSrcMap: React.MutableRefObject<Map<File, string>>) => {
    const map = new Map<string, string>();
    for (const [file, src] of previewSrcMap.current.entries()) {
      map.set(src, file.name);
    }
    return map;
  };
  // 이미지 파일만 추려서 TipTap에 삽입
  const insertLocalImageFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;

    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        previewSrcMap.current.set(file, dataUrl);
        setImages((prev) => [...prev, file]);
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: { src: dataUrl },
          })
          .run();
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ 에디터 내용을 "등장 순서대로" TEXT/IMAGE로 직렬화
  const buildOrderedContents = (html: string, srcToFileName: Map<string, string>) => {
    // 1) img를 코멘트 마커로 변환: <!--LPIMG::src-->
    const temp = document.createElement("div");
    temp.innerHTML = html;

    temp.querySelectorAll("img").forEach((img) => {
      const src = (img as HTMLImageElement).src || "";
      const marker = document.createComment(`LPIMG::${src}`);
      img.replaceWith(marker);
    });

    // 2) 직렬화한 문자열에서 마커 기준으로 순서대로 분해
    const serialized = temp.innerHTML;
    const re = /<!--LPIMG::(.*?)-->/g;

    const chunks: { type: "TEXT" | "IMAGE"; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = re.exec(serialized)) !== null) {
      const beforeHtml = serialized.slice(lastIndex, match.index);
      if (isMeaningfulHtml(beforeHtml)) {
        chunks.push({ type: "TEXT", value: beforeHtml });
      }

      const src = match[1];
      const fileName = srcToFileName.get(src);
      // 업로드된 이미지와 매칭되는 경우에만 IMAGE로 기록
      if (fileName) {
        chunks.push({ type: "IMAGE", value: fileName });
      }
      lastIndex = re.lastIndex;
    }

    // 마지막 꼬리 텍스트
    const tail = serialized.slice(lastIndex);
    if (isMeaningfulHtml(tail)) {
      chunks.push({ type: "TEXT", value: tail });
    }

    return chunks;
  };

  // ✅ File → dataURL 매핑(에디터 이미지 미리보기 추적)
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
      Dropcursor, // 👈 드롭 커서 하이라이트
    ],
    content: "<p>여행의 추억을 기록해보세요 ✈️</p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const liveSrcSet = new Set(Array.from(tempDiv.querySelectorAll("img")).map((img) => (img as HTMLImageElement).src));
      setImages((prev) =>
        prev.filter((file) => {
          const src = previewSrcMap.current.get(file);
          return !!src && liveSrcSet.has(src);
        })
      );
    },
  });

  if (!editor) return null;

  // =========================
  // 이미지 업로드
  // =========================
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
          previewSrcMap.current.set(file, dataUrl);
          setImages((prev) => [...prev, file]);
          editor.chain().focus().setImage({ src: dataUrl }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // =========================
  // 링크 삽입
  // =========================
  const addLink = () => {
    const url = window.prompt("링크 주소를 입력하세요");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  // =========================
  // 해시태그 유틸
  // =========================
  const normalizeTag = (raw: string) => {
    // 앞뒤 공백 제거, 앞의 # 제거, 중간 연속 공백 축약
    const cleaned = raw.trim().replace(/^#+/, "").replace(/\s+/g, " ");
    // 너무 길면 자르기
    return cleaned.slice(0, MAX_TAG_LEN);
  };

  const tryAddTag = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t) return;
    // 공백만 있는 태그, 콤마만 있는 태그 방지
    if (/^[#,]+$/.test(t)) return;

    // 중복 방지(대소문자 구분없이)
    const exists = tags.some((v) => v.toLowerCase() === t.toLowerCase());
    if (exists) return;

    if (tags.length >= MAX_TAGS) return;

    setTags((prev) => [...prev, t]);
  };

  const handleTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // IME 조합 중에는 Enter 처리하지 않음

    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput) {
        tryAddTag(tagInput);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      // 입력이 비어있고 백스페이스면 마지막 태그 제거 UX
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleTagPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;

    // 쉼표/공백/개행/샾 기준으로 분해
    const parts = text.split(/[,\s#]+/).filter(Boolean);
    if (parts.length > 1) {
      e.preventDefault();
      for (const p of parts) {
        if (tags.length >= MAX_TAGS) break;
        tryAddTag(p);
      }
    }
  };

  const removeTag = (t: string) => {
    setTags((prev) => prev.filter((v) => v !== t));
  };

  // =========================
  // 저장
  // =========================
  const handleSave = async () => {
    // 0) 역매핑 준비: dataURL(src) -> 파일명
    const srcToFileName = buildSrcToFileNameMap(previewSrcMap);

    // 1) 현재 에디터 HTML
    const html = editor.getHTML();

    // 2) TEXT/IMAGE 순서 보존 직렬화
    const chunks = buildOrderedContents(html, srcToFileName);

    // 3) 시퀀싱하여 contents 생성
    let sequence = 1;
    const contents: BlogContentRequest[] = chunks.map((c) => ({
      sequence: sequence++,
      contentType: c.type, // "TEXT" | "IMAGE"
      content: c.value, // TEXT면 html, IMAGE면 file.name
    }));

    // 4) 요청 본문
    const requestData: BlogCreateRequest & { hashtags: string[] } = {
      title,
      private: Private,
      contents,
      hashtags: tags,
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
    nextParams.set("page", "1");
    nextParams.set("arrange", "R");
    navigate({ pathname: "/", search: nextParams.toString() });
  };

  return (
    <div>
      {/* 상단 헤더 */}
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
        <div
          className={["border rounded-lg p-3 min-h-[600px] prose prose-lg max-w-none transition", dragActive ? "ring-2 ring-red-400 border-red-300" : "border-gray-200"].join(" ")}
          // 드래그 중 스타일
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault(); // 기본 파일 오픈 방지
          }}
          onDragLeave={(e) => {
            // 에디터 밖으로 나갈 때만 해제
            if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (!editor) return;

            // 드랍 좌표 → 문서 위치로 커서 이동
            const view = editor.view;
            const posAt = view.posAtCoords({ left: e.clientX, top: e.clientY });
            if (posAt) {
              editor.commands.setTextSelection(posAt.pos);
            }

            if (e.dataTransfer?.files?.length) {
              insertLocalImageFiles(e.dataTransfer.files);
            }
          }}
          onPaste={(e) => {
            // 클립보드에 이미지가 있으면 바로 삽입 (텍스트 붙여넣기엔 영향 X)
            if (e.clipboardData?.files?.length) {
              const hasImage = Array.from(e.clipboardData.files).some((f) => f.type.startsWith("image/"));
              if (hasImage) {
                e.preventDefault();
                insertLocalImageFiles(e.clipboardData.files);
              }
            }
          }}
        >
          <EditorContent editor={editor} className="min-h-[500px] outline-none" />
        </div>

        {/* 공개 여부 */}
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" checked={Private} onChange={(e) => setPrivate(e.target.checked)} id="privateCheck" />
          <label htmlFor="privateCheck" className="text-gray-700">
            비공개로 설정
          </label>
        </div>

        {/* 해시태그 입력 */}
        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Hash size={16} />
            해시태그 (최대 {MAX_TAGS}개)
          </label>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
            {/* 태그 칩 */}
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                #{t}
                <button aria-label={`${t} 삭제`} onClick={() => removeTag(t)} className="hover:text-red-500">
                  <X size={14} />
                </button>
              </span>
            ))}

            {/* 입력창 */}
            {tags.length < MAX_TAGS && (
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onPaste={handleTagPaste}
                placeholder="예) 경주여행, 불국사, 첨성대"
                className="flex-1 min-w-[160px] outline-none p-1 text-sm"
                maxLength={MAX_TAG_LEN + 5} // 여유분
              />
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">Enter 또는 쉼표(,)로 추가 · 한 태그 최대 {MAX_TAG_LEN}자 · 중복/공백만 태그는 자동 제외</p>
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
