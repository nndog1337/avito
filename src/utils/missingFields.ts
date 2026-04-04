import type { AutoParams, ElectronicsParams, Item, RealEstateParams } from '../types/api';

export function getMissingFields(item: Item): string[] {
  const missing: string[] = [];

  if (!item.description) {
    missing.push('Описание');
  }

  if (item.category === 'electronics') {
    const params = item.params as ElectronicsParams;
    if (!params.type) missing.push('Тип устройства');
    if (!params.brand) missing.push('Бренд');
    if (!params.model) missing.push('Модель');
    if (!params.color) missing.push('Цвет');
    if (!params.condition) missing.push('Состояние');
  } else if (item.category === 'auto') {
    const params = item.params as AutoParams;
    if (!params.brand) missing.push('Марка');
    if (!params.model) missing.push('Модель');
    if (!params.yearOfManufacture) missing.push('Год выпуска');
    if (!params.transmission) missing.push('Тип КПП');
    if (!params.mileage && params.mileage !== 0) missing.push('Пробег');
    if (!params.enginePower) missing.push('Мощность');
  } else if (item.category === 'real_estate') {
    const params = item.params as RealEstateParams;
    if (!params.type) missing.push('Тип недвижимости');
    if (!params.address) missing.push('Адрес');
    if (!params.area) missing.push('Площадь');
    if (!params.floor && params.floor !== 0) missing.push('Этаж');
  }

  return missing;
}