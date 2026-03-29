import { useEffect, useMemo, useState } from "react";
import { getLatestOrder, getStatusSteps } from "../services/orderService";

export function useOrderTracking() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      setIsLoading(true);
      try {
        const latest = await getLatestOrder();
        if (!mounted) return;
        setOrder(latest);
      } catch {
        if (!mounted) return;
        setError("We couldn't load your latest order right now.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, []);

  const steps = useMemo(() => getStatusSteps(order?.orderType), [order?.orderType]);
  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    return steps.findIndex((step) => step.toLowerCase() === order.status.toLowerCase());
  }, [order, steps]);

  return {
    order,
    isLoading,
    error,
    steps,
    currentStepIndex
  };
}
