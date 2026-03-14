import type { SkillIO } from '@/lib/types';

export function IOTable({
  items,
  title,
}: {
  items: SkillIO[];
  title: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
        {title}
      </h3>
      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2 font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-2 font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground">Req</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2.5 font-mono text-foreground whitespace-nowrap">
                  {item.name}
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-accent text-[12px]">{item.type}</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground max-w-md">
                  {item.description}
                </td>
                <td className="px-4 py-2.5 text-center font-mono text-[12px]">
                  {item.required ? (
                    <span className="text-foreground">yes</span>
                  ) : (
                    <span className="text-muted">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
