/**
 * AssessmentNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const AssessmentNodes = {
  NeedNode: {
    title: "Need Node",
    type: "assessment-node",
    category: "Assessment",
    icon: "fa-clipboard-check",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "score_out", name: "Score", type: "int", dir: "out" },
      { id: "passed_out", name: "Passed", type: "bool", dir: "out" },
    ],
  },
};
