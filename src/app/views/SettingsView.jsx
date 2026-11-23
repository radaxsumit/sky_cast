import { GlassCard } from '../../components/ui/GlassCard.jsx';
import { SearchBox } from '../../components/search/SearchBox.jsx';

export function SettingsView(props) {
  return (
    <GlassCard className="p-8">
      <h1 className="font-display text-3xl">SettingsView</h1>
      {props.onSearch && <SearchBox onSelect={props.onSearch} saved={props.saved} className="mt-4 max-w-md" />}
      {props.data && <p className="mt-4">{props.data.location.name}: {props.data.current.text}</p>}
      {props.onExit && <button onClick={props.onExit}>exit</button>}
    </GlassCard>
  );
}
