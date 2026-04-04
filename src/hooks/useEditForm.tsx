import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { useUpdateItemMutation } from '../api/itemsApi';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { buildPayload } from '../utils/buildPayload';
import { clearDraftFromLocalStorage } from '../services/draftService';
import { validateForm } from '../utils/validation';
import type { FormValues } from '../types/form';
import type { Item } from '../types/api';
import { useEffect } from 'react';

interface UseEditFormProps {
  id: string | undefined;
  item: Item | undefined;
}

export function useEditForm({ id, item }: UseEditFormProps) {
  const navigate = useNavigate();
  const [updateItem, { isLoading: saving, isError: saveError, error: saveErr }] = useUpdateItemMutation();

  const form = useForm<FormValues>({
    initialValues: {
      category: 'auto',
      title: '',
      description: '',
      price: 0,
      auto: { brand: '', model: '', yearOfManufacture: null, transmission: null, mileage: null, enginePower: null },
      realEstate: { type: null, address: '', area: null, floor: null },
      electronics: { type: null, brand: '', model: '', color: '', condition: null },
    },
  });

  useEffect(() => {
    if (!item) return;
  
    const p = item.params as any;
  
    const newValues: FormValues = {
      category: item.category,
      title: item.title,
      description: item.description ?? '',
      price: item.price,
      auto: item.category === 'auto'
        ? {
            brand: p.brand ?? '',
            model: p.model ?? '',
            yearOfManufacture: p.yearOfManufacture != null ? Number(p.yearOfManufacture) : null,
            transmission: p.transmission ?? null,
            mileage: p.mileage ?? null,
            enginePower: p.enginePower ?? null,
          }
        : { brand: '', model: '', yearOfManufacture: null, transmission: null, mileage: null, enginePower: null },
      realEstate: item.category === 'real_estate'
        ? {
            type: p.type ?? null,
            address: p.address ?? '',
            area: p.area ?? null,
            floor: p.floor ?? null,
          }
        : { type: null, address: '', area: null, floor: null },
      electronics: item.category === 'electronics'
        ? {
            type: p.type ?? null,
            brand: p.brand ?? '',
            model: p.model ?? '',
            color: p.color ?? '',
            condition: p.condition ?? null,
          }
        : { type: null, brand: '', model: '', color: '', condition: null },
    };
  
    form.setValues(newValues);
  }, [item]);

  const handleSubmit = form.onSubmit((values) => {
    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        if (error) {
          form.setFieldError(field as keyof FormValues, error);
        }
      });
      return;
    }

    const body = buildPayload(values);
    updateItem({ id: id!, body })
      .unwrap()
      .then(() => {
        clearDraftFromLocalStorage();
        notifications.show({
          title: 'Успешно!',
          message: 'Изменения сохранены',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
          position: 'top-right',
        });
        navigate(`/ads/${id}`);
      })
      .catch((error) => {
        console.error(error);
        notifications.show({
          title: 'Ошибка сохранения',
          message: 'При попытке сохранить изменения произошла ошибка. Попробуйте ещё раз или зайдите позже.',
          color: 'red',
          autoClose: 5000,
          position: 'top-right',
        });
      });
  });

  const handleCancel = () => {
    clearDraftFromLocalStorage();
    navigate(`/ads/${id}`);
  };

  return { form, saving, saveError, saveErr, handleSubmit, handleCancel };
}