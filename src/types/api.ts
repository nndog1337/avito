export type Category = 'auto' | 'electronics' | 'real_estate';

export interface AutoParams {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
}

export interface RealEstateParams {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
}

export interface ElectronicsParams {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
}

export interface Item {
  id: string;
  category: Category;
  title: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  params: AutoParams | RealEstateParams | ElectronicsParams;
  needsRevision: boolean;
}

export interface ListItem {
  category: Category;
  title: string;
  price: number;
  needsRevision: boolean;
}

export interface ItemsResponse {
  items: ListItem[];
  total: number;
}

export interface GetItemsParams {
  q?: string;
  limit?: number;
  skip?: number;
  categories?: Category | string;
  needsRevision?: boolean;
  sortColumn?: 'title' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

export interface UpdateItemPayload {
  category: Category;
  title: string;
  description?: string;
  price: number;
  params: AutoParams | RealEstateParams | ElectronicsParams;
}
