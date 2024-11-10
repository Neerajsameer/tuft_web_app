import Loader from "../ui/loader";

interface LoadingMoreProps {
  loading: boolean;
}

export function LoadingMore({ loading }: LoadingMoreProps) {
  return <div className="h-4 w-full flex justify-center">{loading && <Loader loading={true} />}</div>;
}
