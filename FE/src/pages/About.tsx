// src/pages/About.tsx
import { MapPin, Wand2, NotebookPen, Compass, HeartHandshake, ShieldCheck, Sparkles, Mail, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const About = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // 공통 모션 프리셋(절제된 가속/감속 커브)
  const ease = [0.22, 1, 0.36, 1] as const;
  const fadeUp = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease, delay },
        };

  const reveal = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <motion.section className="bg-white border-b" {...fadeUp(0)}>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <motion.p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-blue-600 uppercase" {...fadeUp(0.06)}>
            <Compass className="w-4 h-4" />
            About LocalPiece
          </motion.p>

          <motion.h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900" {...fadeUp(0.14)}>
            퍼즐처럼 완성하는 <span className="text-blue-600">AI 하루 코스</span>
          </motion.h1>

          <motion.p className="mt-4 text-gray-600 leading-relaxed" {...fadeUp(0.22)}>
            한 곳을 출발점으로 정하면,
            <br className="hidden sm:block" />
            관광지·맛집·카페를 AI가 하루치 동선에 맞춰 자연스럽게 이어드립니다.
          </motion.p>

          <motion.div className="mt-8 flex justify-center gap-3" {...fadeUp(0.3)}>
            <button
              onClick={() => navigate("/ai/travel")}
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-medium shadow hover:bg-blue-700 transition active:scale-[0.98]"
            >
              AI 추천 시작하기
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link to="/blog" className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-gray-800 font-medium hover:bg-gray-200 transition">
              여행 기록 보기
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Value / Mission */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <motion.h2 className="text-2xl font-bold text-gray-900" {...fadeUp(0)}>
          LocalPiece가 약속하는 것
        </motion.h2>
        <motion.p className="mt-2 text-gray-600" {...fadeUp(0.06)}>
          사용자 시간을 아끼고, 더 즐거운 여정을 만듭니다.
        </motion.p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.div
            variants={reveal}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            className="rounded-2xl bg-white p-6 shadow-sm border"
          >
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h3 className="mt-3 font-semibold">맞춤형 하루 코스</h3>
            <p className="mt-2 text-sm text-gray-600">선호 카테고리와 분위기, 이동 동선을 함께 고려해 매끄럽게 이어지는 코스를 제안합니다.</p>
          </motion.div>

          <motion.div
            variants={reveal}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            className="rounded-2xl bg-white p-6 shadow-sm border"
          >
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h3 className="mt-3 font-semibold">신뢰할 수 있는 정보</h3>
            <p className="mt-2 text-sm text-gray-600">공공데이터와 사용자 피드백을 함께 반영해 품질을 높입니다.</p>
          </motion.div>

          <motion.div
            variants={reveal}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            className="rounded-2xl bg-white p-6 shadow-sm border"
          >
            <HeartHandshake className="w-6 h-6 text-blue-600" />
            <h3 className="mt-3 font-semibold">추억을 남기는 경험</h3>
            <p className="mt-2 text-sm text-gray-600">여행을 다녀오면 사진을 바탕으로 자동 여행 기록(블로그)이 생성됩니다.</p>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <motion.section className="mx-auto max-w-5xl px-6 pb-4" {...fadeUp(0)}>
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-8 border">
          <h2 className="text-2xl font-bold text-gray-900">브랜드 스토리</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            LocalPiece는 <span className="font-semibold">여행의 조각들</span>을 퍼즐처럼 잇는다는 뜻입니다. 검색·동선·기록의 번거로움을 줄이고,
            <span className="font-semibold"> “준비는 가볍게, 경험은 풍성하게”</span>를 지향합니다.
          </p>
        </div>
      </motion.section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <motion.h2 className="text-2xl font-bold text-gray-900" {...fadeUp(0)}>
          어떻게 작동하나요?
        </motion.h2>
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* STEP 1 */}
          <motion.li
            variants={reveal}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            className="rounded-2xl bg-white p-6 shadow-sm border"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-semibold text-blue-600">STEP 1</div>
            </div>
            <div className="mt-1 font-semibold">출발점 · 취향 선택</div>
            <p className="mt-2 text-sm text-gray-600">가고 싶은 한 곳을 고르고, 카테고리/분위기를 선택하세요.</p>
          </motion.li>

          {/* STEP 2 */}
          <motion.li
            variants={reveal}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            className="rounded-2xl bg-white p-6 shadow-sm border"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-semibold text-blue-600">STEP 2</div>
            </div>
            <div className="mt-1 font-semibold">AI 코스 생성</div>
            <p className="mt-2 text-sm text-gray-600">
              AI가 관광지·맛집·카페를 <span className="font-medium">하루 동선과 시간표</span>에 맞춰 자연스럽게 이어줍니다.
            </p>
          </motion.li>

          {/* STEP 3 */}
          <motion.li
            variants={reveal}
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            className="rounded-2xl bg-white p-6 shadow-sm border"
          >
            <div className="flex items-center gap-2">
              <NotebookPen className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-semibold text-blue-600">STEP 3</div>
            </div>
            <div className="mt-1 font-semibold">확인 · 출발 · 기록</div>
            <p className="mt-2 text-sm text-gray-600">
              코스를 확인·수정하고 여행을 떠나세요. 다녀오면
              <span className="font-medium"> 자동으로 여행 기록(블로그)</span>이 생성됩니다.
            </p>
          </motion.li>
        </ol>
      </section>

      {/* Contact / Policy */}
      <motion.section className="mx-auto max-w-5xl px-6 pb-16" {...fadeUp(0)}>
        <div className="rounded-2xl bg-white p-8 shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-900">문의 & 지원</h2>
          <p className="mt-2 text-gray-600">서비스 관련 문의는 아래로 보내주세요.</p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href="mailto:ktfigs@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-3 font-medium hover:bg-black transition"
              aria-label="이메일로 문의하기"
              rel="noopener noreferrer"
            >
              <Mail className="w-4 h-4" />
              ktfigs@gmail.com
            </a>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="hover:underline"> 이용약관</div>
              <span className="text-gray-300">|</span>
              <div className="hover:underline"> 개인정보처리방침</div>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            현재는 <span className="font-medium">경상북도</span> 관광 데이터를 우선 반영하고 있습니다.
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
