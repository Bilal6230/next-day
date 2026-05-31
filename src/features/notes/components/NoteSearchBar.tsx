import { Input } from '@/shared/components';

type NoteSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteSearchBar({ value, onChange }: NoteSearchBarProps) {
  return (
    <Input
      label="Search"
      value={value}
      onChangeText={onChange}
      placeholder="Search title, body, or tags"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}
