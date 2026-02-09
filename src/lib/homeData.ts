import { Tool } from "../types";

export const PRE_DEAL_TOOLS: Tool[] = [
  {
    id: "01",
    name: "Diligence Agent",
    desc: "Automated due diligence reports generated from URL inputs.",
  },
];

export const POST_DEAL_TOOLS: Tool[] = [
  {
    id: "02",
    name: "Portfolio Dashboard",
    desc: "Track portfolio KPIs, benchmark against cohorts, and flag companies needing attention.",
  },
  {
    id: "04",
    name: "Cap Table",
    desc: "Manage ownership, model funding rounds, and simulate exit waterfalls across the portfolio.",
  },
];

export const FOUNDER_TOOLS: Tool[] = [
  {
    id: "03",
    name: "Founder Portal",
    desc: "Input your metrics, benchmark against startup batches, and track fundraising readiness.",
  },
];
