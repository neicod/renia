// @env: mixed
export interface Category {
  id: string;
  label: string;
  url: string;
  urlPath?: string;
  type?: string;
  position?: number;
  includeInMenu?: boolean;
  children?: Category[];
}

export default Category;
