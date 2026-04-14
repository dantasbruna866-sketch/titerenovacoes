import { tagColors } from '@/data/mockData';

export function TagChip({ tag }: { tag: string }) {
  const colors = tagColors[tag] || { bg: 'bg-muted', text: 'text-muted-foreground' };
  return (
    <span className={`tag-chip ${colors.bg} ${colors.text}`}>
      {tag}
    </span>
  );
}
