// @env: mixed
export interface Category {
  id: string;
  label: string;
  url: string;
  urlPath?: string;
  type?: string;
  position?: number;
  includeInMenu?: boolean;
  description?: string;
  image?: string;
  children?: Category[];
}

export default Category;
