export const workspaceGroups = [
  {
    label: "Working Session",
    items: [
      {
        href: "/workspace/working-sessions",
        label: "New chat",
        kicker: "Start with BBW",
      },
      {
        href: "/workspace/working-sessions/history",
        label: "History",
        kicker: "Prior topics",
      },
      {
        href: "/workspace/working-sessions/plan-execution",
        label: "Plan execution",
        kicker: "Project progress",
      },
    ],
  },
  {
    label: "Company Info",
    items: [
      {
        href: "/workspace",
        label: "Dashboard",
        kicker: "Milestones and stage",
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        href: "/workspace/community",
        label: "My communities",
        kicker: "Joined groups",
      },
      {
        href: "/workspace/community/explore",
        label: "Explore communities",
        kicker: "Hot founder rooms",
      },
      {
        href: "/workspace/community/request",
        label: "Request community",
        kicker: "Start a new group",
      },
    ],
  },
];

export const companyMetrics = [
  ["Runway", "14.8 mo", "2.1 mo gained from vendor renegotiation"],
  ["Lead asset", "BX-214", "Preclinical efficacy package due in 37 days"],
  ["Capital need", "$8.5M", "Seed extension or strategic option"],
  ["Readiness", "78%", "Investor package is moving toward Series A quality"],
];

export const stageMap = [
  ["Company setup", "Complete", "Entity, cap table, core IP, and founders aligned"],
  ["Seed validation", "Current", "Preclinical package, regulatory plan, and seed extension"],
  ["IND readiness", "Next", "CMC vendor lock, tox plan, pre-IND package"],
  ["Clinical proof", "Future", "First-in-human execution and early signal"],
  ["Growth outcome", "Future", "Series B, partnership, acquisition, or launch path"],
];

export const milestoneRows = [
  ["Preclinical efficacy package", "37 days", "In progress", "Science"],
  ["Seed extension investor memo", "2 weeks", "In review", "Finance"],
  ["CMC vendor shortlist", "18 days", "At risk", "Operations"],
  ["Pre-IND question list", "24 days", "Initialized", "Regulatory"],
];

export const nextStepChecklist = [
  "Finalize one-page milestone narrative for seed extension investors",
  "Convert reproducibility data into diligence-ready claims",
  "Prepare top ten investor objections and evidence-backed answers",
  "Confirm CMC vendor timing, budget, and documentation risk",
  "Schedule advisor review for indication and market-access assumptions",
];
