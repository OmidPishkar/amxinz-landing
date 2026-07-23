// components/Skeleton.tsx
type SkeletonProps = {
    width?: number | string;   // مثل '160px' یا '100%'
    height?: number | string;  // مثل '20px' یا '2rem'
    className?: string;        // برای سفارشی‌سازی بیشتر یا واکنش‌گرایی
};

export default function Skeleton({ width = '100%', height = '20px', className = '' }: SkeletonProps) {
    return (
        <span
            className={`inline-block bg-slate-100 dark:bg-muted rounded animate-pulse ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    );
}