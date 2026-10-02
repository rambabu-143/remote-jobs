import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Option = { value: string; label: string };

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function SelectField({
  name,
  options,
  defaultValue,
  onValueChange,
}: {
  name: string;
  options: Option[];
  defaultValue: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select
      name={name}
      items={options}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as string)}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
