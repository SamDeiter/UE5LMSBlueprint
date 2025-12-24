/**
 * AssessmentTasks.js
 * Comprehensive learning tasks organized by difficulty level.
 * Refactored to import from granular level files.
 */

import { LEVEL_1_TASKS } from "./assessment/Level1.js";
import { LEVEL_2_TASKS } from "./assessment/Level2.js";
import { LEVEL_3_TASKS } from "./assessment/Level3.js";
import { LEVEL_4_TASKS } from "./assessment/Level4.js";
import { LEVEL_5_TASKS } from "./assessment/Level5.js";
import { LEVEL_6_TASKS } from "./assessment/Level6.js";
import { VALIDATION_TASKS } from "./assessment/ValidationTasks.js";

export const ASSESSMENT_TASKS = [
  ...LEVEL_1_TASKS,
  ...LEVEL_2_TASKS,
  ...LEVEL_3_TASKS,
  ...LEVEL_4_TASKS,
  ...LEVEL_5_TASKS,
  ...VALIDATION_TASKS,
  ...LEVEL_6_TASKS,
];
