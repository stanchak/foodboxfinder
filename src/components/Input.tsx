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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:text-gray-500"
        {...props}
      />
    </div>
  );
}
