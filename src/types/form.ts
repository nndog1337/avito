import {Category} from "./api";

export interface AutoFormParams {
    brand: string;
    model: string;
    yearOfManufacture: number | null;
    transmission: 'automatic' | 'manual' | null;
    mileage: number | null;
    enginePower: number | null;
  }
  
  export interface RealEstateFormParams {
    type: 'flat' | 'house' | 'room' | null;
    address: string;
    area: number | null;
    floor: number | null;
  }
  
  export interface ElectronicsFormParams {
    type: 'phone' | 'laptop' | 'misc' | null;
    brand: string;
    model: string;
    color: string;
    condition: 'new' | 'used' | null;
  }
  
  export type FormValues = {
    category: Category;
    title: string;
    description: string;
    price: number;
    auto: AutoFormParams;
    realEstate: RealEstateFormParams;
    electronics: ElectronicsFormParams;
  };