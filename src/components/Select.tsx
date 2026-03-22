export default function Select({
  label,
  id,
  options,
  placeholder = "Select...",
  className,
  ...props
}: Readonly<{
  label: string;
  id: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}> & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id" | "children">) {
  return (
    <div className={className ?? ""}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <select
        id={id}
        className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
