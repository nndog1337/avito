import type { FormValues } from '../types/form';

const AI_API_URL = 'http://localhost:11434/api/generate';
const AI_MODEL = 'llama3.2';

export async function callAI(prompt: string, signal?: AbortSignal): Promise<string> {
    const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: AI_MODEL, prompt, stream: false }),
        signal,
    });
    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const data = await response.json();
    return data.response || '';
}

export function generateDescriptionPrompt(values: FormValues): string {
    let paramsText = '';

    if (values.category === 'auto') {
        const p = values.auto;
        paramsText = `
  - Марка: ${p.brand || 'не указана'}
  - Модель: ${p.model || 'не указана'}
  - Год выпуска: ${p.yearOfManufacture || 'не указан'}
  - КПП: ${p.transmission === 'automatic' ? 'Автомат' : p.transmission === 'manual' ? 'Механика' : 'не указана'}
  - Пробег: ${p.mileage ? `${p.mileage.toLocaleString()} км` : 'не указан'}
  - Мощность: ${p.enginePower ? `${p.enginePower} л.с.` : 'не указана'}`;
    } else if (values.category === 'real_estate') {
        const p = values.realEstate;
        const typeLabel = p.type === 'flat' ? 'Квартира' : p.type === 'house' ? 'Дом' : p.type === 'room' ? 'Комната' : 'не указан';
        paramsText = `
  - Тип: ${typeLabel}
  - Адрес: ${p.address || 'не указан'}
  - Площадь: ${p.area ? `${p.area} м²` : 'не указана'}
  - Этаж: ${p.floor || 'не указан'}`;
    } else {
        const p = values.electronics;
        const typeLabel = p.type === 'phone' ? 'Телефон' : p.type === 'laptop' ? 'Ноутбук' : p.type === 'misc' ? 'Другое' : 'не указан';
        paramsText = `
  - Тип: ${typeLabel}
  - Бренд: ${p.brand || 'не указан'}
  - Модель: ${p.model || 'не указана'}
  - Цвет: ${p.color || 'не указан'}
  - Состояние: ${p.condition === 'new' ? 'Новое' : p.condition === 'used' ? 'Б/у' : 'не указано'}`;
    }

    const currentDescription = values.description?.trim();
    if (currentDescription) {
        return `Улучши существующее описание для объявления о продаже "${values.title}" (категория: ${values.category}).
  Характеристики:${paramsText}
  Цена: ${values.price.toLocaleString()} ₽
  
  Текущее описание: "${currentDescription}"
  
  Напиши улучшенную версию на русском языке, длиной 3-5 предложений. Сохрани ключевую информацию, сделай текст более привлекательным и убедительным. Не используй маркированные списки, пиши сплошным текстом.`;
    } else {
        return `Напиши привлекательное и подробное описание для объявления о продаже "${values.title}" (категория: ${values.category}).
  Характеристики:${paramsText}
  Цена: ${values.price.toLocaleString()} ₽
  
  Напиши описание на русском языке, длиной 3-5 предложений. Будь информативным и убедительным. Не используй маркированные списки, пиши сплошным текстом.`;
    }
}

export function generatePricePrompt(values: FormValues): string {
    let paramsText = '';

    if (values.category === 'auto') {
        const p = values.auto;
        paramsText = `
  Марка: ${p.brand || 'не указана'}
  Модель: ${p.model || 'не указана'}
  Год выпуска: ${p.yearOfManufacture || 'не указан'}
  Пробег: ${p.mileage ? `${p.mileage.toLocaleString()} км` : 'не указан'}`;
    } else if (values.category === 'real_estate') {
        const p = values.realEstate;
        paramsText = `
  Тип: ${p.type === 'flat' ? 'Квартира' : p.type === 'house' ? 'Дом' : p.type === 'room' ? 'Комната' : 'не указан'}
  Площадь: ${p.area ? `${p.area} м²` : 'не указана'}
  Этаж: ${p.floor || 'не указан'}`;
    } else {
        const p = values.electronics;
        paramsText = `
  Тип: ${p.type === 'phone' ? 'Телефон' : p.type === 'laptop' ? 'Ноутбук' : p.type === 'misc' ? 'Другое' : 'не указан'}
  Бренд: ${p.brand || 'не указан'}
  Модель: ${p.model || 'не указана'}
  Состояние: ${p.condition === 'new' ? 'Новое' : p.condition === 'used' ? 'Б/у' : 'не указано'}`;
    }

    return `Определи рыночную цену для "${values.title}" (категория: ${values.category}).
  
  Характеристики:
  ${paramsText}
  
  Ответь в формате:
  Средняя цена: [сумма] ₽ — [диапазон] ₽ — [диапазон] ₽
  
  Пример ответа:
  Средняя цена на MacBook Pro 16" M1 Pro (16/512GB):
  115 000 – 135 000 ₽ — отличное состояние.
  От 140 000 ₽ — идеал, малый износ АКБ.
  90 000 – 110 000 ₽ — срочно или с дефектами.
  
  Напиши ответ на русском языке.`;
}