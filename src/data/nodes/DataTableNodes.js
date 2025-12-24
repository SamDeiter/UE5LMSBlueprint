/**
 * DataTableNodes - Node definitions for DataTable related functions
 */
export const DataTableNodes = {
  GetDataTableRow: {
    title: "Get Data Table Row",
    type: "function-node",
    category: "Utilities|DataTable",
    icon: "fa-table",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "data_table", name: "Data Table", type: "object", dir: "in" },
      { id: "row_name", name: "Row Name", type: "name", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "row_found", name: "Row Found", type: "exec", dir: "out" },
      { id: "row_not_found", name: "Row Not Found", type: "exec", dir: "out" },
      { id: "out_row", name: "Out Row", type: "wildcard", dir: "out" },
    ],
  },
};
