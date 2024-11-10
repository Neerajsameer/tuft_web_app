import { useEffect, useRef, useCallback } from "react";
import { LoadingMore } from "./LoadingMore";

interface InfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
}

export function InfiniteScroll({ loading, hasMore, onLoadMore, children }: InfiniteScrollProps) {
  const observerTarget = useRef(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !loading && hasMore) {
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <>
      {children}
      <div ref={observerTarget}>
        <LoadingMore loading={loading} />
      </div>
    </>
  );
}
