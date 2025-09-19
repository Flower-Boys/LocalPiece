// src/pages/About.tsx
import { Compass, HeartHandshake, ShieldCheck, Sparkles, Mail, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-blue-600 uppercase">
            <Compass className="w-4 h-4" />
            About LocalPiece
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            퍼즐처럼 완성하는 <span className="text-blue-600">AI 여행 코스</span>
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            LocalPiece는 사용자가 고른 한 곳에서 출발해, 관광지·맛집·카페를
            <br className="hidden sm:block" />
            AI가 자연스럽게 이어주는 하루 여행 코스를 제안합니다.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={() => navigate("/ai/travel")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-medium shadow hover:bg-blue-700 transition">
              AI 추천 시작하기 <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/blog" className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-gray-800 font-medium hover:bg-gray-200 transition">
              여행 기록 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Value / Mission */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-900">우리의 가치</h2>
        <p className="mt-2 text-gray-600">사용자 시간을 아끼고, 더 즐거운 이동을 만듭니다.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h3 className="mt-3 font-semibold">맞춤형 여정</h3>
            <p className="mt-2 text-sm text-gray-600">선호 카테고리·분위기·이동 동선을 고려해 자연스럽게 이어지는 코스를 제안합니다.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h3 className="mt-3 font-semibold">신뢰 가능한 정보</h3>
            <p className="mt-2 text-sm text-gray-600">공공 관광 데이터와 실제 사용자 피드백을 함께 반영해 품질을 높입니다.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <HeartHandshake className="w-6 h-6 text-blue-600" />
            <h3 className="mt-3 font-semibold">기억을 남기는 경험</h3>
            <p className="mt-2 text-sm text-gray-600">코스를 다녀오면 자동으로 블로그 형식의 여행 기록이 생성됩니다.</p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="mx-auto max-w-5xl px-6 pb-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-8 border">
          <h2 className="text-2xl font-bold text-gray-900">브랜드 스토리</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            LocalPiece는 <span className="font-semibold">여행의 조각들</span>을 퍼즐처럼 이어 붙인다는 의미입니다. 흩어진 장소 검색, 동선 고민, 기록의 번거로움을 줄이고,
            <span className="font-semibold"> “준비는 가볍게, 경험은 풍성하게”</span>라는 철학을 담았습니다.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900">어떻게 작동하나요?</h2>
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <li className="rounded-2xl bg-white p-6 shadow-sm border">
            <div className="text-sm font-semibold text-blue-600">STEP 1</div>
            <div className="mt-1 font-semibold">출발점 선택</div>
            <p className="mt-2 text-sm text-gray-600">검색을 통해 가고 싶은 한 곳을 골라보세요.</p>
          </li>
          <li className="rounded-2xl bg-white p-6 shadow-sm border">
            <div className="text-sm font-semibold text-blue-600">STEP 2</div>
            <div className="mt-1 font-semibold">평가확인</div>
            <p className="mt-2 text-sm text-gray-600">블로그와 여행지 상세정보를 보고 여행지를 골라보세요.</p>
          </li>
          <li className="rounded-2xl bg-white p-6 shadow-sm border">
            <div className="text-sm font-semibold text-blue-600">STEP 3</div>
            <div className="mt-1 font-semibold">기록 생성</div>
            <p className="mt-2 text-sm text-gray-600">여행 후 자동으로 블로그 형식의 기록을 만들어줘요.</p>
          </li>
        </ol>
      </section>

      {/* Contact / Policy */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl bg-white p-8 shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900">문의 & 지원</h2>
          <p className="mt-2 text-gray-600">서비스 관련 문의는 아래로 보내주세요.</p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <a href="mailto:contact@localpiece.app" className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-3 font-medium hover:bg-black transition">
              <Mail className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              이용약관
              <span className="text-gray-300">|</span>
              개인정보처리방침
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-500">※ 지역 특화: 경상북도 중심의 관광 데이터를 우선 반영하고 있습니다.</p>
        </div>
      </section>
    </div>
  );
};

export default About;
