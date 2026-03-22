export default function Input({
  label,
  id,
  className,
  ...props
}: Readonly<{
  label: string;
  id: string;
  className?: string;
}> & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <div className={className ?? ""}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
        {...props}
      />
    </div>
  );
}
