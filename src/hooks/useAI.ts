import { useState, useRef } from 'react';
import { callAI, generateDescriptionPrompt, generatePricePrompt } from '../services/aiService';
import type { FormValues } from '../types/form';

export function useAI() {
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [priceResult, setPriceResult] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [descriptionResult, setDescriptionResult] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const priceAbortRef = useRef<AbortController | null>(null);
  const descriptionAbortRef = useRef<AbortController | null>(null);

  const generatePrice = async (values: FormValues) => {
    priceAbortRef.current?.abort();
    priceAbortRef.current = new AbortController();
    setIsPriceLoading(true);
    setPriceError(null);
    setPriceResult(null);

    try {
      const prompt = generatePricePrompt(values);
      const result = await callAI(prompt, priceAbortRef.current.signal);
      setPriceResult(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setPriceError('Произошла ошибка при запросе к AI');
    } finally {
      setIsPriceLoading(false);
      priceAbortRef.current = null;
    }
  };

  const generateDescription = async (values: FormValues) => {
    descriptionAbortRef.current?.abort();
    descriptionAbortRef.current = new AbortController();
    setIsDescriptionLoading(true);
    setDescriptionError(null);
    setDescriptionResult(null);

    try {
      const prompt = generateDescriptionPrompt(values);
      const result = await callAI(prompt, descriptionAbortRef.current.signal);
      setDescriptionResult(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setDescriptionError('Произошла ошибка при запросе к AI');
    } finally {
      setIsDescriptionLoading(false);
      descriptionAbortRef.current = null;
    }
  };

  const resetPrice = () => {
    setPriceResult(null);
    setPriceError(null);
  };

  const resetDescription = () => {
    setDescriptionResult(null);
    setDescriptionError(null);
  };

  const extractPriceFromResult = (result: string): number | null => {
    const priceMatch = result.match(/\d{2,6}[0-9\s]*[0-9]/);
    if (priceMatch) {
      const price = parseInt(priceMatch[0].replace(/\s/g, ''), 10);
      return isNaN(price) ? null : price;
    }
    return null;
  };

  return {
    isPriceLoading,
    isDescriptionLoading,
    priceResult,
    priceError,
    descriptionResult,
    descriptionError,
    generatePrice,
    generateDescription,
    resetPrice,
    resetDescription,
    extractPriceFromResult,
  };
}