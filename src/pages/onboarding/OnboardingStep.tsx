import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  recordOnboardingComplete,
  recordOnboardingSkip,
  recordOnboardingStepAdvance,
  recordOnboardingStepView,
} from "../../utils/onboardingAnalytics";

interface FeaturePoint {
  title: string;
  description: string;
}

interface StepLink {
  to: string;
  label: string;
  onClick?: () => void;
}

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  description: string;
  featurePoints: FeaturePoint[];
  image: string;
  imageAlt: string;
  next: StepLink;
  back?: StepLink;
}

export default function OnboardingStep({
  step,
  totalSteps,
  eyebrow,
  title,
  description,
  featurePoints,
  image,
  imageAlt,
  next,
  back,
}: OnboardingStepProps) {
  const progressSegments = Array.from({ length: totalSteps }, (_, idx) => idx + 1);

  const markCompleted = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("ecosera:onboardingCompleted", "true");
  };

  useEffect(() => {
    recordOnboardingStepView(step);
  }, [step]);

  const handleSkipClick = () => {
    recordOnboardingSkip(step);
    markCompleted();
  };

  const handleNextClick = () => {
    recordOnboardingStepAdvance(step);
    if (step === totalSteps) {
      recordOnboardingComplete(step);
      markCompleted();
    }
    next.onClick?.();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#1F4FD7] transition-all"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            <span>{step}/{totalSteps}</span>
          </div>
          <Link
            to="/"
            onClick={handleSkipClick}
            className="ml-3 rounded-full border border-transparent px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-[#1F4FD7] transition hover:border-[#1F4FD7]/20 hover:bg-white"
          >
            Lewati
          </Link>
        </header>

        <section className="flex flex-1 flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-slate-100">
              <img src={image} alt={imageAlt} className="h-48 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                  {eyebrow}
                </span>
                <p className="mt-2 text-lg font-semibold text-white">{title}</p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              {description}
            </p>
          </div>

          <div className="grid gap-3">
            {featurePoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-800">{point.title}</p>
                <p className="mt-1 text-sm text-slate-500">{point.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-3 sm:flex-row">
          {back && (
            <Link
              to={back.to}
              onClick={back.onClick}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {back.label}
            </Link>
          )}

          <Link
            to={next.to}
            onClick={handleNextClick}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1F4FD7] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1B44BD]"
          >
            {next.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
