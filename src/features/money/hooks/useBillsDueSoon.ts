import { useMemo } from 'react';

import { BILLS_DUE_WINDOW_DAYS } from '@/features/money/constants';
import { useBills } from '@/features/money/hooks/useBills';
import { filterBillsDueSoon } from '@/features/money/utils/billsDue';

export function useBillsDueSoon() {
  const { bills, isLoading, error, retry } = useBills();
  const dueSoon = useMemo(
    () => filterBillsDueSoon(bills, BILLS_DUE_WINDOW_DAYS),
    [bills],
  );

  return { bills: dueSoon, isLoading, error, retry };
}
