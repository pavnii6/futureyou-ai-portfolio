import type { ChatMode } from "../api/client";

export type TimelinePhase = {
  id: string;
  era: string;
  title: string;
  blurb: string;
  highlights: string[];
  accent: string;
};

export type DemoTurn = {
  role: "user" | "assistant";
  content: string;
};

export const coreSuggestionChips = [
  "Tell me about your best project",
  "Why should we hire you?",
  "What makes you different?",
];

export const modeSuggestionChips: Record<ChatMode, string[]> = {
  interview: [
    "What are your strengths in a high-pressure team?",
    "Walk me through a project where your communication mattered.",
    "How do you make AI products feel useful, not gimmicky?",
  ],
  roast: [
    "What is the weakest part of your portfolio story right now?",
    "Where are you still too generic, and how would you fix it fast?",
    "If you were the recruiter, what would make you hesitate?",
  ],
  vision: [
    "How do you see your career compounding by 2030?",
    "What future are you building toward with AI products?",
    "What decision today most changes your 2030 trajectory?",
  ],
};

export const timelinePhases: TimelinePhase[] = [
  {
    id: "past",
    era: "Past",
    title: "Foundations and first signals",
    blurb:
      "This is where the narrative starts: early leadership, first projects, and the point where communication stopped being a soft skill and became an engineering advantage.",
    highlights: [
      "MUN taught me to turn dense ideas into clear arguments people actually remember.",
      "Early projects revealed that product thinking matters as much as model quality.",
      "NETRA became the first serious proof that I wanted to build AI for real-world impact.",
    ],
    accent: "from-cyan-400/40 via-sky-500/20 to-transparent",
  },
  {
    id: "present",
    era: "Present",
    title: "Shipping thoughtful AI experiences",
    blurb:
      "The present phase is about turning raw technical skill into recruiter-ready, user-ready systems: RAG, UX polish, and strong communication under ambiguity.",
    highlights: [
      "I design AI features end-to-end, from retrieval quality to the last interaction detail.",
      "I focus on grounded answers, clear reasoning, and experiences that feel premium.",
      "I am building proof that storytelling and technical depth can coexist in one portfolio.",
    ],
    accent: "from-fuchsia-400/40 via-violet-500/20 to-transparent",
  },
  {
    id: "future",
    era: "Future",
    title: "2030 vision and compounding leverage",
    blurb:
      "The future phase is about scale: building systems, products, and teams that make AI feel inevitable, trustworthy, and deeply human-centered.",
    highlights: [
      "Lead AI product strategy with a strong engineering backbone.",
      "Build healthcare and decision-support experiences that are grounded and scalable.",
      "Become known for making complex AI feel clear, useful, and unforgettable.",
    ],
    accent: "from-emerald-400/30 via-cyan-500/15 to-transparent",
  },
];

export const demoConversations: Array<{
  id: string;
  title: string;
  subtitle: string;
  mode: ChatMode;
  turns: DemoTurn[];
}> = [
  {
    id: "hire-me",
    title: "Why hire me",
    subtitle: "Shows confidence, evidence, and narrative clarity",
    mode: "interview",
    turns: [
      { role: "user", content: "Why should we hire you?" },
      {
        role: "assistant",
        content:
          "Because I do not just build AI features - I shape the story, the UX, and the decision logic around them. Back when I built NETRA, I started seeing AI as a product responsibility, not just a technical experiment. That mindset still drives how I build today: grounded systems, crisp communication, and experiences people trust quickly.",
      },
    ],
  },
  {
    id: "best-project",
    title: "Best project",
    subtitle: "Highlights product judgment and technical maturity",
    mode: "interview",
    turns: [
      { role: "user", content: "Tell me about your best project." },
      {
        role: "assistant",
        content:
          "FutureYou is one of my favorite projects because it proves how I think. It combines RAG, interaction design, persona strategy, and storytelling in one system. The point was never just to say, 'I built ML projects.' The point was to make a recruiter feel like they had already met the future version of me.",
      },
    ],
  },
  {
    id: "different",
    title: "What makes me different",
    subtitle: "Blends personality, communication, and ambition",
    mode: "vision",
    turns: [
      { role: "user", content: "What makes you different?" },
      {
        role: "assistant",
        content:
          "My edge is synthesis. My experience in MUN shaped how I explain complex AI ideas clearly, and my engineering work made sure clarity is backed by substance. I can move between architecture, interface, and narrative without losing rigor - which is exactly what ambitious AI products need.",
      },
    ],
  },
];

