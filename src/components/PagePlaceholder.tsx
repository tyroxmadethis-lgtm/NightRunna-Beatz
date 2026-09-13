import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {Icon && (
        <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
          <Icon className="h-8 w-8 text-zinc-400" />
        </div>
      )}
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">{title}</h1>
      <p className="text-zinc-400 max-w-md">
        {description || `The ${title.toLowerCase()} page is currently under construction.`}
      </p>
    </div>
  );
}
