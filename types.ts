
export type TableData = string[][];

export interface Scan {
  id: string;
  timestamp: number;
  imageUrl: string;
  tableData: TableData;
}
