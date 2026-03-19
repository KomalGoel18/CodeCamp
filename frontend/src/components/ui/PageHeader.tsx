import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}

export default function PageHeader({ title, subtitle, rightContent }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
