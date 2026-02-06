export type * from "./types";
export { demoProfile } from "./demoData";
export { saveFounderProfile, loadFounderProfile, clearFounderProfile } from "./persistence";
export {
  benchmarkFounder,
  buildCohortMap,
  getDistribution,
  type CohortFilter,
} from "./benchmarks";
export {
  momGrowthRates,
  avgRecentGrowth,
  projectMrr,
  generateProjection,
  calcRunwayMonths,
  generateScenarios,
  growthTrend,
  getAnonymizedBatchCurves,
} from "./trajectory";
export {
  calcHealthScore,
  calcFundraisingReadiness,
  generateActionItems,
} from "./scorecard";
export { generateInvestorUpdate } from "./updates";
