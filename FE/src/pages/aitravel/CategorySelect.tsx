// CategorySelect.tsx (페이지 교체본)
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectableCard, { CATEGORY_META } from "@/components/aiTravel/SelectableCard";
import type { CategoryKey, VisitCreateRequest } from "@/types/aiTravel";
import { Sparkles, X } from "lucide-react";
import { travelSigunguCodeLabel } from "@/components/home/constants";

// ✅ 경로 오타 수정 + 직렬 처리 유틸 사용
import { generateAndSaveAll } from "@/api/cours";

type CityMeta = { code: number; name: string };
type Companion = "커플/친구" | "가족" | "혼자";
type Pacing = "여유롭게" | "보통" | "빠르게";

const ALL_COMPANIONS: Companion[] = ["커플/친구", "가족", "혼자"];
const ALL_PACING: Pacing[] = ["여유롭게", "보통", "빠르게"];

const CategorySelect: React.FC = () => {
  const navigate = useNavigate();

  // === 상태 ===
  const [selectedKeywords, setSelectedKeywords] = useState<CategoryKey[]>([]);
  const [cities, setCities] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(""); // "YYYY-MM-DD"
  const [endDate, setEndDate] = useState(""); // "YYYY-MM-DD"
  const [companion, setCompanion] = useState<Companion>("커플/친구");
  const [pacing, setPacing] = useState<Pacing>("보통");
  const [mustVisitRaw, setMustVisitRaw] = useState("");
  const [saving, setSaving] = useState(false); // ✅ 로딩 표시용

  const toggleKeyword = (k: CategoryKey) => {
    setSelectedKeywords((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  const clearKeywords = () => setSelectedKeywords([]);

  const cityOptions = useMemo(
    () =>
      Object.entries(travelSigunguCodeLabel).map(([code, name]) => ({
        code: Number(code),
        name,
      })),
    [] // ❗️원래 [2]였는데 버그. 빈 배열이 맞음.
  );
  // console.log(cities);

  const toggleCity = (code: number) => {
    setCities((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const mustVisitParsed = useMemo(
    () =>
      mustVisitRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n)),
    [mustVisitRaw]
  );

  const canSubmit = cities.length > 0 && !!startDate && !!endDate && new Date(startDate) <= new Date(endDate) && selectedKeywords.length > 0;

  const cityMeta: CityMeta[] = useMemo(() => cities.map((code) => ({ code, name: travelSigunguCodeLabel[String(code)] })), [cities]);
  // ✅ 생성 → 저장 직렬 처리 (모든 코스 저장)
  const handleSubmit = async () => {
    if (!canSubmit || saving) return;

    const payload: VisitCreateRequest = {
      cities,
      start_date: startDate,
      end_date: endDate,
      keywords: selectedKeywords,
      companions: companion,
      pacing,
      must_visit_spots: mustVisitParsed,
    };

    try {
      setSaving(true);

      // A안) 생성된 모든 코스안 저장
      // ✅ cityMeta는 화면 전환용 state로만 전달
      // const cityMeta: CityMeta[] = useMemo(() => cities.map((code) => ({ code, name: travelSigunguCodeLabel[String(code)] })), [cities]);

      // ✅ 여기서는 'cityMeta' (변수) 를 넘겨야 함. 'CityMeta'(타입) 아님!
      const { generated, results } = await generateAndSaveAll(payload, cityMeta);

      navigate("/ai/travel/result", {
        state: {
          payload,
          data: generated,
          saveResults: results,
          // cityMeta, // ✅ 여기로 전달해서 결과 페이지에서 사용
        },
      });

      // (원하면 B안) 하나만 저장:
      // const { generated, data } = await generateAndSaveOne(payload, 0);

      // 결과 페이지로 생성 응답 + 저장 결과 함께 전달
      // navigate("/ai/travel/result", {
      //   state: {
      //     payload,
      //     data: generated, // TripResponse
      //     saveResults: results, // [{ index, themeTitle, ok, data?: {courseId}, error? }]
      //   },
      // });
    } catch (err) {
      console.error(err);
      // TODO: toast.error("코스 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">AI 여행 루트 생성</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">도시/날짜/키워드/동반자/페이싱/필수 방문지를 선택해 주세요.</p>
      </header>

      {/* 도시 선택 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">여행 도시(시군구) 선택</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {cityOptions.map(({ code, name }) => (
            <label
              key={code}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm transition 
                ${cities.includes(code) ? "border-amber-400 bg-amber-50" : "hover:bg-gray-50"}`}
            >
              <input type="checkbox" className="h-4 w-4" checked={cities.includes(code)} onChange={() => toggleCity(code)} />
              <span>{name}</span>
              <span className="ml-auto text-xs text-gray-500">#{code}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 날짜 선택 */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">여행 날짜</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label className="w-20 text-sm text-gray-600">시작일</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-20 text-sm text-gray-600">종료일</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border px-3 py-2" />
          </div>
        </div>
      </section>

      {/* 키워드 선택 */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">여행 키워드 (복수 선택)</h2>
          {selectedKeywords.length > 0 && (
            <button type="button" onClick={clearKeywords} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/10">
              <X className="h-4 w-4" />
              초기화
            </button>
          )}
        </div>
        {selectedKeywords.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedKeywords.map((k) => (
              <span key={k} className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 dark:bg-amber-200">
                {k}
                <button type="button" onClick={() => toggleKeyword(k)} className="rounded-full px-1 text-amber-900/70 hover:bg-amber-200" aria-label={`${k} 해제`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(Object.keys(CATEGORY_META) as CategoryKey[]).map((k) => (
            <SelectableCard key={k} k={k} selected={selectedKeywords.includes(k)} onToggle={toggleKeyword} />
          ))}
        </div>
      </section>

      {/* 동반자 / 페이싱 */}
      <section className="mb-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">동반자</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_COMPANIONS.map((c) => (
              <label
                key={c}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition
                  ${companion === c ? "border-amber-400 bg-amber-50" : "hover:bg-gray-50"}`}
              >
                <input type="radio" name="companion" value={c} checked={companion === c} onChange={() => setCompanion(c)} className="mr-2" />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">여행 속도</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_PACING.map((p) => (
              <label
                key={p}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition
                  ${pacing === p ? "border-amber-400 bg-amber-50" : "hover:bg-gray-50"}`}
              >
                <input type="radio" name="pacing" value={p} checked={pacing === p} onChange={() => setPacing(p)} className="mr-2" />
                {p}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 꼭 가야 할 장소 */}
      {/* <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">꼭 가야 할 장소 (선택)</h2>
        <p className="mb-2 text-sm text-gray-500">장소 ID를 쉼표로 구분해 입력 (예: 127985, 317503)</p>
        <input
          type="text"
          value={mustVisitRaw}
          onChange={(e) => setMustVisitRaw(e.target.value)}
          placeholder="예) 127985, 317503"
          className="w-full rounded-md border px-3 py-2"
        />
        {mustVisitParsed.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mustVisitParsed.map((id) => (
              <span key={id} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                #{id}
              </span>
            ))}
          </div>
        )}
      </section> */}

      {/* 제출 */}
      <div className="sticky bottom-6 mt-8 flex items-center justify-end">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 font-semibold text-white shadow-sm ring-1 ring-black/5 transition enabled:hover:translate-y-[1px] enabled:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          <Sparkles className="h-5 w-5" /> {canSubmit ? "루트 생성" : "값을 모두 선택해 주세요"}
        </button>
      </div>
    </main>
  );
};

export default CategorySelect;
