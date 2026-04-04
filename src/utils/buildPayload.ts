import type { AutoParams, ElectronicsParams, RealEstateParams, UpdateItemPayload } from '../types/api';
import { FormValues } from '../types/form';

export function buildPayload(values: FormValues): UpdateItemPayload {
  let params: AutoParams | RealEstateParams | ElectronicsParams;

  if (values.category === 'auto') {
    const p = values.auto;
    const autoParams: AutoParams = {};
    if (p.brand?.trim()) autoParams.brand = p.brand.trim();
    if (p.model?.trim()) autoParams.model = p.model.trim();
    if (p.yearOfManufacture !== null) autoParams.yearOfManufacture = p.yearOfManufacture;
    if (p.transmission !== null) autoParams.transmission = p.transmission;
    if (p.mileage !== null) autoParams.mileage = p.mileage;
    if (p.enginePower !== null) autoParams.enginePower = p.enginePower;
    params = autoParams;
  } else if (values.category === 'real_estate') {
    const p = values.realEstate;
    const realEstateParams: RealEstateParams = {};
    if (p.type !== null) realEstateParams.type = p.type;
    if (p.address?.trim()) realEstateParams.address = p.address.trim();
    if (p.area !== null) realEstateParams.area = p.area;
    if (p.floor !== null) realEstateParams.floor = p.floor;
    params = realEstateParams;
  } else {
    const p = values.electronics;
    const electronicsParams: ElectronicsParams = {};
    if (p.type !== null) electronicsParams.type = p.type;
    if (p.brand?.trim()) electronicsParams.brand = p.brand.trim();
    if (p.model?.trim()) electronicsParams.model = p.model.trim();
    if (p.color?.trim()) electronicsParams.color = p.color.trim();
    if (p.condition !== null) electronicsParams.condition = p.condition;
    params = electronicsParams;
  }

  return {
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    price: Number(values.price),
    params,
  };
}