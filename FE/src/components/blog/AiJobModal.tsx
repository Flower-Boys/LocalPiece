// src/components/blog/AiJobModal.tsx
import { useEffect, useRef, useState } from "react";
import { getJobStatus } from "@/api/blog";
import { JobStatus } from "@/types/blog";

type Props = {
  jobId: string;
  open: boolean;
  onCompleted: (blogId: number) => void;
  onFailed?: (message?: string) => void;
  onClose?: () => void;
  pollIntervalMs?: number;
  maxWaitMs?: number;
};

export default function AiJobModal({ jobId, open, onCompleted, onFailed, onClose, pollIntervalMs = 3000, maxWaitMs = 2 * 60 * 1000 }: Props) {
  const [status, setStatus] = useState<JobStatus>("PENDING");
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTime = useRef<number>(Date.now());

  // ✅ 폴링 로직
  useEffect(() => {
    if (!open) return;

    const poll = async () => {
      try {
        const res = await getJobStatus(jobId);
        setStatus(res.status);

        if (res.status === "COMPLETED") {
          stopPolling();
          setTimeout(() => onCompleted(res.resultBlogId!), 500);
        } else if (res.status === "FAILED") {
          stopPolling();
          setError(res.errorMessage || "AI 블로그 생성에 실패했습니다.");
          onFailed?.(res.errorMessage || undefined);
        } else if (Date.now() - startTime.current > maxWaitMs) {
          stopPolling();
          setError("AI 블로그 생성이 예상보다 오래 걸립니다.");
          onFailed?.("TIMEOUT");
        }
      } catch (e) {
        console.error("Job 상태 조회 실패:", e);
      }
    };

    const startPolling = () => {
      poll(); // 즉시 1회
      timerRef.current = window.setInterval(poll, pollIntervalMs);
    };

    const stopPolling = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };

    startPolling();
    return () => stopPolling();
  }, [open, jobId]);

  if (!open) return null;

  const renderContent = () => {
    const wrapperClass = "flex flex-col items-center justify-center text-center";

    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return (
          <div className={wrapperClass}>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mb-3" />
            <p className="text-gray-600 text-sm">AI가 블로그를 생성 중이에요...</p>
          </div>
        );

      case "COMPLETED":
        return (
          <div className={wrapperClass}>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
              <span className="text-white text-2xl">✓</span>
            </div>
            <p className="text-green-600 font-medium text-sm">생성이 완료되었습니다!</p>
          </div>
        );

      case "FAILED":
        return (
          <div className={wrapperClass}>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-3">
              <span className="text-white text-2xl">✕</span>
            </div>
            <p className="text-red-600 font-medium text-sm">{error || "생성에 실패했습니다."}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white w-[300px] rounded-xl shadow-lg p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">AI 블로그 생성</h2>
        {renderContent()}
        {onClose && (
          <button onClick={onClose} className="mt-5 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm" disabled={status === "COMPLETED"}>
            닫기 (나중에 확인 가능해요)
          </button>
        )}
      </div>
    </div>
  );
}
