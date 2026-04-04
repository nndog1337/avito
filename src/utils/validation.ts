import { FormValues } from "../types/form";

export const validateForm = (values: FormValues): Record<string, string | null> => {
    const errors: Record<string, string | null> = {};

    if (!values.title.trim()) {
      errors.title = 'Укажите название';
    }

    if (values.price === undefined || values.price === null) {
      errors.price = 'Укажите цену';
    } else if (values.price <= 0) {
      errors.price = 'Цена должна быть больше 0';
    }

    if (values.category === 'real_estate') {
      if (!values.realEstate.type) {
        errors['realEstate.type'] = 'Выберите тип недвижимости';
      }
    } else if (values.category === 'electronics') {
      if (!values.electronics.type) {
        errors['electronics.type'] = 'Выберите тип устройства';
      }
    }

    return errors;
  };