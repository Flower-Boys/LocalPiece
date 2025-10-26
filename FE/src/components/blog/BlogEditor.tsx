// src/components/blog/BlogEditor.tsx
import { useEffect, useRef, useState } from "react";
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
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, ImagePlus, Hash, X } from "lucide-react";

import type { BlogCreateRequest, BlogContentRequest, BlogDetailResponse } from "@/types/blog";
import Dropcursor from "@tiptap/extension-dropcursor";

const MAX_TAGS = 10;
const MAX_TAG_LEN = 20;

type Props = {
  mode: "create" | "edit";
  initialData?: BlogDetailResponse; // edit에서 필요
  onSubmit: (payload: BlogCreateRequest & { deletedImageKeys?: string[] }, newImages: File[]) => Promise<void>;
  /**
   * 이미지 키(= BlogContentResponse.content)를 실제 표시 가능한 URL로 바꿔주는 함수.
   * - 서버가 내용에 '절대 URL'을 바로 내려주면 기본값 그대로 써도 됨.
   * - 파일명/키만 내려오는 경우, 여기서 CDN/S3 주소로 변환해서 반환.
   */
  getImageUrl?: (key: string) => string;
};

// 기존 이미지와 신규 이미지를 한 풀에서 관리
type ExistingImage = { kind: "existing"; key: string; url: string; filename?: string };
type NewImage = { kind: "new"; file: File; previewUrl: string };
type ImageRef = ExistingImage | NewImage;

export default function BlogEditor({
  mode,
  initialData,
  onSubmit,
  getImageUrl = (k) => k, // 기본: key를 그대로 URL로 사용
}: Props) {
  // --- 상태
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [isPrivate, setIsPrivate] = useState<boolean>(initialData?.private ?? false); // ← 타입이 private이므로 state명은 혼동 피하려고 isPrivate로 둠(보낼 땐 private)
  const [tags, setTags] = useState<string[]>(initialData?.hashtags ?? []);
  const [images, setImages] = useState<ImageRef[]>([]); // 기존 + 신규
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewSrcMap = useRef<Map<File, string>>(new Map());
  const [dragActive, setDragActive] = useState(false);

  // 로컬 이미지 파일들 삽입 (드롭/붙여넣기/파일선택 공용)
  const insertLocalImageFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;

    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        previewSrcMap.current.set(file, dataUrl);

        const ref: NewImage = { kind: "new", file, previewUrl: dataUrl };
        setImages((prev) => [...prev, ref]);

        editor
          ?.chain()
          .focus()
          .insertContent({ type: "image", attrs: { src: dataUrl } })
          .run();
      };
      reader.readAsDataURL(file);
    });
  };

  // --- TipTap
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
      Dropcursor, // ✅ 드롭 커서
    ],
    content: mode === "edit" ? buildInitialHtmlFromContents(initialData) : "<p>여행의 추억을 기록해보세요 ✈️</p>",
    onUpdate: ({ editor }) => syncImagesWithEditor(editor),
  });

  // 의미 있는 HTML인지(빈 <p><br></p>만 있는 경우 제외)
  const isMeaningfulHtml = (html: string) => {
    const trimmed = html.replace(/<p><br\/?><\/p>/g, "").trim();
    const withoutTags = trimmed.replace(/<[^>]+>/g, "").trim();
    return Boolean(trimmed) && Boolean(withoutTags);
  };

  // 1) 에디터 내 <img> src → 서버 key(file.name) 매핑 테이블 생성
  function buildSrcToKeyMap(images: ImageRef[]) {
    const map = new Map<string, string>();
    for (const ref of images) {
      if (ref.kind === "existing") {
        // 기존 이미지: 화면에 보이는 src(URL) -> 서버 보관키
        map.set(ref.url, ref.filename ?? ref.key);
      } else {
        // 신규 이미지: dataURL -> 업로드 시 파일명
        map.set(ref.previewUrl, ref.file.name);
      }
    }
    return map;
  }
  // 2) HTML을 TEXT/IMAGE 순서로 분해하되, key 매핑이 없으면 <img alt="KEY">로 폴백
  function buildOrderedChunksFromHtmlWithAlt(html: string, srcToKey: Map<string, string>) {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // <img>를 마커로 바꾸되, src/alt 둘 다 보관
    const altMap = new Map<string, string>(); // markerId -> altKey
    let markerSeq = 0;

    temp.querySelectorAll("img").forEach((img) => {
      const src = (img as HTMLImageElement).src || "";
      const altKey = (img as HTMLImageElement).alt || ""; // 수정 모드에서 넣어준 key
      const markerId = `LPIMG_${markerSeq++}`;
      if (altKey) altMap.set(markerId, altKey);
      const marker = document.createComment(`LPIMG::${markerId}::${src}`);
      img.replaceWith(marker);
    });

    const serialized = temp.innerHTML;
    const re = /<!--LPIMG::(.*?)::(.*?)-->/g;

    const chunks: { type: "TEXT" | "IMAGE"; value: string }[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    const isMeaningfulHtml = (h: string) => {
      const trimmed = h.replace(/<p><br\/?><\/p>/g, "").trim();
      const withoutTags = trimmed.replace(/<[^>]+>/g, "").trim();
      return Boolean(trimmed) && Boolean(withoutTags);
    };

    while ((m = re.exec(serialized)) !== null) {
      const before = serialized.slice(lastIndex, m.index);
      if (isMeaningfulHtml(before)) chunks.push({ type: "TEXT", value: before });

      const markerId = m[1];
      const src = m[2];

      // 우선 src 매핑, 실패 시 alt 폴백
      const key = srcToKey.get(src) ?? altMap.get(markerId);
      if (key) {
        chunks.push({ type: "IMAGE", value: key });
      }
      lastIndex = re.lastIndex;
    }
    const tail = serialized.slice(lastIndex);
    if (isMeaningfulHtml(tail)) chunks.push({ type: "TEXT", value: tail });

    return chunks;
  }
  // HTML을 이미지 마커로 치환 후 TEXT/IMAGE 순서대로 쪼개기
  function buildOrderedChunksFromHtml(html: string, srcToKey: Map<string, string>) {
    // 1) img -> <!--LPIMG::src-->
    const temp = document.createElement("div");
    temp.innerHTML = html;

    temp.querySelectorAll("img").forEach((img) => {
      const src = (img as HTMLImageElement).src || "";
      const marker = document.createComment(`LPIMG::${src}`);
      img.replaceWith(marker);
    });

    // 2) 마커 기준으로 분해
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
      const key = srcToKey.get(src); // 존재하는 이미지일 때만 IMAGE로
      if (key) {
        chunks.push({ type: "IMAGE", value: key });
      }
      lastIndex = re.lastIndex;
    }

    const tail = serialized.slice(lastIndex);
    if (isMeaningfulHtml(tail)) {
      chunks.push({ type: "TEXT", value: tail });
    }

    return chunks;
  }

  // --- 수정 모드: 기존 이미지 초기화
  useEffect(() => {
    if (mode !== "edit" || !initialData) return;
    const existing: ExistingImage[] = initialData.contents
      .filter((c) => c.contentType === "IMAGE")
      .map((c) => {
        const key = c.content; // 서버가 내려준 이미지 key/URL/파일명
        const url = getImageUrl(key); // 표시용 URL
        return { kind: "existing", key, url, filename: key };
      });
    setImages(existing);
  }, [mode, initialData, getImageUrl]);

  // --- 초기 HTML 구성(수정)
  function buildInitialHtmlFromContents(detail?: BlogDetailResponse) {
    if (!detail) return "";
    const sorted = [...detail.contents].sort((a, b) => a.sequence - b.sequence);
    return sorted
      .map((c) => {
        if (c.contentType === "TEXT") return c.content; // 서버가 HTML을 주는 구조라면 그대로
        const key = c.content;
        const url = getImageUrl(key);
        return `<p><img src="${url}" alt="${key}" /></p>`;
      })
      .join("");
  }

  // --- 에디터 내 <img> 잔존 여부로 images 상태 동기화
  function syncImagesWithEditor(editorInstance: any) {
    const html = editorInstance.getHTML();
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const liveSrcs = new Set(Array.from(temp.querySelectorAll("img")).map((img) => (img as HTMLImageElement).src));

    setImages((prev) =>
      prev.filter((ref) => {
        const src = ref.kind === "new" ? ref.previewUrl : ref.url;
        return liveSrcs.has(src);
      })
    );
  }

  // --- 이미지 추가(신규)
  const addImage = () => {
    const input = document.createElement("input");
    input.accept = "image/*";
    input.type = "file";
    input.multiple = true; // ✅ 여러 장
    input.onchange = () => {
      if (input.files?.length) insertLocalImageFiles(input.files);
    };
    input.click();
  };

  // --- 링크
  const addLink = () => {
    const url = window.prompt("링크 주소를 입력하세요");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  };

  // --- 해시태그
  const [tagInput, setTagInput] = useState("");
  const normalizeTag = (raw: string) => raw.trim().replace(/^#+/, "").replace(/\s+/g, " ").slice(0, MAX_TAG_LEN);
  const tryAddTag = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t || /^[#,]+$/.test(t)) return;
    if (tags.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    if (tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, t]);
  };
  const handleTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput) {
        tryAddTag(tagInput);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };
  const handleTagPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const parts = text.split(/[,\s#]+/).filter(Boolean);
    if (parts.length > 1) {
      e.preventDefault();
      for (const p of parts) {
        if (tags.length >= MAX_TAGS) break;
        tryAddTag(p);
      }
    }
  };
  const removeTag = (t: string) => setTags((prev) => prev.filter((v) => v !== t));

  // --- 검증
  const validate = () => {
    if (!title.trim()) return "제목을 입력해주세요.";
    const html = editor!.getHTML();
    const textOnly = html
      .replace(/<img[^>]*>/g, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!textOnly && images.length === 0) return "본문 텍스트 또는 이미지를 최소 1개 이상 입력해주세요.";
    for (const t of tags) if (t.length > MAX_TAG_LEN) return `태그 '${t}'가 ${MAX_TAG_LEN}자를 초과했습니다.`;
    return null;
  };

  const keepEmptyParagraphs = (html: string) => html.replace(/<p>(?:\s|&nbsp;)*<\/p>/g, "<p>&#8203;</p>");

  // --- 제출
  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      alert(msg);
      return;
    }
    if (saving) return;
    setSaving(true);

    try {
      // (A) 현재 이미지 풀 → src→key 매핑
      const srcToKey = buildSrcToKeyMap(images);

      // (B) 순서 보존 직렬화(alt 폴백 포함)
      const raw = editor!.getHTML();
      const html = keepEmptyParagraphs(raw); // ✅ 빈 <p></p> → <p>&#8203;</p>
      const chunks = buildOrderedChunksFromHtmlWithAlt(html, srcToKey); // ✅ 치환된 html 사용

      // (C) 시퀀스 부여
      let sequence = 1;
      const contents: BlogContentRequest[] = chunks.map((c) => ({
        sequence: sequence++,
        contentType: c.type,
        content: c.value,
      }));

      // (D) 삭제된 기존 이미지 키
      let deletedImageKeys: string[] | undefined;
      if (mode === "edit" && initialData) {
        const initialKeys = new Set(initialData.contents.filter((c) => c.contentType === "IMAGE").map((c) => c.content));
        const currentExistingKeys = new Set(images.filter((i): i is ExistingImage => i.kind === "existing").map((i) => i.key));
        deletedImageKeys = Array.from(initialKeys).filter((k) => !currentExistingKeys.has(k));
      }

      // (E) 신규 파일만 업로드
      const newFiles = images.filter((i): i is NewImage => i.kind === "new").map((i) => i.file);

      // (F) payload (API 스펙에 맞게 private!)
      const payload: BlogCreateRequest & { deletedImageKeys?: string[] } = {
        title,
        private: isPrivate,
        contents,
        hashtags: tags,
        ...(mode === "edit" ? { deletedImageKeys } : {}),
      };

      await onSubmit(payload, newFiles);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      {/* 제목 */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full text-xl font-semibold border-b border-gray-300 p-2 mb-4 focus:outline-none"
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

        <button type="button" onClick={() => setShowPreview((v) => !v)} className="ml-auto p-2 rounded border hover:bg-gray-50 text-sm">
          {showPreview ? "편집으로" : "미리보기"}
        </button>
      </div>

      {/* 본문 */}
      {showPreview ? (
        <article className="border rounded-lg p-3 prose prose-lg max-w-none bg-gray-50" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
      ) : (
        <div
          className={["border rounded-lg p-3 min-h-[600px] prose prose-lg max-w-none transition", dragActive ? "ring-2 ring-red-400 border-red-300 bg-red-50/30" : ""].join(" ")}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault(); // 기본 브라우저 파일 열기 방지
          }}
          onDragLeave={(e) => {
            // 영역 밖으로 나갈 때만 해제
            const related = e.relatedTarget as Node | null;
            if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
              setDragActive(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (!editor) return;

            // 드랍 좌표 기준 커서 이동 → 그 위치에 삽입
            const view = editor.view;
            const posAt = view.posAtCoords({ left: e.clientX, top: e.clientY });
            if (posAt) editor.commands.setTextSelection(posAt.pos);

            if (e.dataTransfer?.files?.length) {
              insertLocalImageFiles(e.dataTransfer.files);
            }
          }}
          onPaste={(e) => {
            // 클립보드에 이미지가 있으면 가로채서 삽입 (텍스트는 기본동작)
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
          {dragActive && (
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-red-300 bg-white/80 px-4 py-2 text-sm text-red-500 shadow">이미지를 여기로 드롭하세요</div>
            </div>
          )}
        </div>
      )}

      {/* 공개 여부 */}
      <div className="flex items-center gap-2 mt-4">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} id="privateCheck" />
        <label htmlFor="privateCheck" className="text-gray-700">
          비공개로 설정
        </label>
      </div>

      {/* 해시태그 */}
      <div className="mt-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Hash size={16} />
          해시태그 (최대 {MAX_TAGS}개)
        </label>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
              #{t}
              <button aria-label={`${t} 삭제`} onClick={() => removeTag(t)} className="hover:text-red-500">
                <X size={14} />
              </button>
            </span>
          ))}
          {tags.length < MAX_TAGS && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onPaste={handleTagPaste}
              placeholder="예) 경주여행, 불국사, 첨성대"
              className="flex-1 min-w-[160px] outline-none p-1 text-sm"
              maxLength={MAX_TAG_LEN + 5}
            />
          )}
        </div>

        <p className="mt-1 text-xs text-gray-500">Enter 또는 쉼표(,)로 추가 · 한 태그 최대 {MAX_TAG_LEN}자 · 중복/공백만 태그는 자동 제외</p>
      </div>

      {/* 저장 */}
      <button onClick={handleSubmit} disabled={saving} className={`mt-6 w-full py-3 rounded-lg font-semibold text-white ${saving ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}>
        {saving ? "저장 중..." : mode === "edit" ? "수정하기" : "저장하기"}
      </button>
    </div>
  );
}
