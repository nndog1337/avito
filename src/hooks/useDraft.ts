import { useEffect, useRef } from 'react';
import { useForm } from '@mantine/form';
import { loadDraftFromLocalStorage, saveDraftToLocalStorage } from '../services/draftService';
import type { FormValues } from '../types/form';

export function useDraft(id: string | undefined, form: ReturnType<typeof useForm<FormValues>>, item: any) {
  const isInitialLoad = useRef(true);
  const initialValues = useRef<FormValues | null>(null);

  // Сохраняем начальные значения (из API или из черновика)
  useEffect(() => {
    if (!item || !isInitialLoad.current) return;
    
    const draft = loadDraftFromLocalStorage(id!);
    if (draft && Object.keys(draft).length > 0) {
      // Если есть черновик — загружаем его
      form.setValues(draft);
      initialValues.current = draft;
    } else {
      // Если черновика нет — загружаем из API
      const apiValues = {
        category: item.category,
        title: item.title,
        description: item.description ?? '',
        price: item.price,
        auto: item.category === 'auto' && item.params ? { ...(item.params as any) } : {
          brand: '',
          model: '',
          yearOfManufacture: undefined,
          transmission: undefined,
          mileage: undefined,
          enginePower: undefined,
        },
        realEstate: item.category === 'real_estate' && item.params ? { ...(item.params as any) } : {
          type: undefined,
          address: '',
          area: undefined,
          floor: undefined,
        },
        electronics: item.category === 'electronics' && item.params ? { ...(item.params as any) } : {
          type: undefined,
          brand: '',
          model: '',
          color: '',
          condition: undefined,
        },
      };
      form.setValues(apiValues);
      initialValues.current = apiValues;
    }
    isInitialLoad.current = false;
  }, [item, id, form]);

  // Автосохранение ЛЮБЫХ изменений (включая очистку полей)
  useEffect(() => {
    if (!id) return;
    if (isInitialLoad.current) return;
    
    // Сохраняем при ЛЮБОМ изменении формы
    const timeoutId = setTimeout(() => {
      const currentValues = form.getValues();
      saveDraftToLocalStorage(currentValues, id);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.values, id]);
}