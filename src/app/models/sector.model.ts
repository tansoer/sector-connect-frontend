export interface Sector {
  id: number;
  name: string;
  selectable: boolean;
  parentId?: number;
  subSectors?: Sector[];
  expanded?: boolean;
  selected?: boolean;
}
