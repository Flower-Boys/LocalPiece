import { useState } from "react";
import { ImagePlus, Type, X } from "lucide-react";

type Block = {
  id: string;
  type: "text" | "image";
  content: string;
};

const BlogWrite = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  // 블록 추가
  const addBlock = (type: "text" | "image") => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setBlocks([...blocks, newBlock]);
  };

  // 블록 내용 수정
  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  // 블록 삭제
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  // 이미지 업로드 처리
  const handleImageUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    updateBlock(id, url);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">블로그 작성하기</h1>

      {/* 블록들 */}
      <div className="space-y-4 mb-6">
        {blocks.map((block) => (
          <div key={block.id} className="relative border rounded-lg p-3">
            {/* 삭제 버튼 */}
            <button onClick={() => removeBlock(block.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
              <X size={16} />
            </button>

            {block.type === "text" ? (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full h-24 p-2 border rounded focus:outline-none resize-none"
              />
            ) : (
              <div>
                {block.content ? (
                  <img src={block.content} alt="uploaded" className="w-full rounded-lg" />
                ) : (
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(block.id, e.target.files[0])} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 블록 추가 버튼 */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => addBlock("text")} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
          <Type size={16} /> 텍스트 추가
        </button>
        <button onClick={() => addBlock("image")} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
          <ImagePlus size={16} /> 이미지 추가
        </button>
      </div>

      {/* 저장 버튼 */}
      <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">저장하기</button>
    </div>
  );
};

export default BlogWrite;
