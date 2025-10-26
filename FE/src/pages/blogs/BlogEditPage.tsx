import SearchBar from "@/components/home/SearchBar";
import AuthButtons from "@/components/share/auth/AuthButtons";
import BlogEditor from "@/components/blog/BlogEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBlogDetail, updateBlog } from "@/api/blog";
import type { BlogDetailResponse } from "@/types/blog";

export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BlogDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const detail = await getBlogDetail(String(id));
      setData(detail);
      setLoading(false);
    })();
  }, [id]);

  // src/pages/blog/BlogEditPage.tsx

  const onSubmit: Parameters<typeof BlogEditor>[0]["onSubmit"] = async (payload, newImages) => {
    // 🔹 서버는 isPrivate을 원하므로 key rename
    const { private: _private, ...rest } = payload;
    const adaptedPayload = { ...rest, isPrivate: _private };

    await updateBlog(Number(id), adaptedPayload as any, newImages);

    alert("블로그가 수정되었습니다!");
    navigate(`/blog/${id}`);
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

  if (loading) return <div className="max-w-3xl mx-auto p-6">로딩 중...</div>;

  // 필요 시 파일키→URL 변환 규칙 주입
  const getImageUrl = (key: string) => {
    // 예: 백엔드가 파일키만 주면 여기서 변환
    // return `${import.meta.env.VITE_CDN}/blog/${key}`;
    return key; // 이미 절대URL이면 그대로
  };

  return (
    <div>
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

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold px-6 pt-6">🛠 블로그 수정</h1>
      </div>

      <BlogEditor mode="edit" initialData={data!} onSubmit={onSubmit} getImageUrl={getImageUrl} />
    </div>
  );
}
