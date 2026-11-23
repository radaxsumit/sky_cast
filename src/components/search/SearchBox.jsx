import { AnimatePresence, motion } from 'motion/react';
import { Loader2, MapPin, Search, Star } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { locationQuery } from '../../lib/locationQuery.js';
import { searchPlaces } from '../../services/weatherApi.js';

/**
 * Accessible city search (ARIA combobox). Selecting a suggestion queries by its exact WeatherAPI id,
 * so "San Jose" the Costa Rican capital never turns into San Jose, California.
 * @param {{ onSelect: (query: string, place?: object) => void, saved?: object, placeholder?: string, className?: string }} props
 */
export function SearchBox({ onSelect, saved, placeholder = 'Search a city', className = '' }) {
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [searched, setSearched] = useState('');
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  // Debounced suggestions (300 ms, from 2 characters). Stale responses are ignored.
  useEffect(() => {
    const q = text.trim();
    if (q.length < 2) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await searchPlaces(q);
        if (cancelled) return;
        setResults(list);
        setSearched(q);
        setActive(list.length ? 0 : -1);
        setOpen(true);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const reset = () => {
    setText('');
    setResults([]);
    setOpen(false);
    setActive(-1);
    setSearched('');
  };

  const choose = (place) => {
    onSelect(locationQuery(place), place);
    reset();
    inputRef.current?.blur();
  };

  const onChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setSearched('');
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && results[active]) choose(results[active]);
      else if (results[0] && searched === text.trim()) choose(results[0]);
      else if (text.trim()) {
        onSelect(text.trim());
        reset();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const toggleSave = (e, place) => {
    e.stopPropagation();
    e.preventDefault();
    if (saved.has(place.id)) saved.remove(place.id);
    else saved.add(place);
  };

  const showEmpty = open && !loading && searched && results.length === 0;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="glass flex items-center gap-2 rounded-2xl px-3.5">
        <Search className="text-ink-muted h-4 w-4 shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search for a city"
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="text-ink placeholder:text-ink-muted h-11 w-full min-w-0 bg-transparent text-[15px] outline-none"
        />
        {loading && <Loader2 className="text-ink-muted h-4 w-4 shrink-0 animate-spin" aria-label="Searching" />}
      </div>

      <AnimatePresence>
        {(open && results.length > 0) || showEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="glass absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-2xl !bg-[var(--glass-bg-strong)] p-1.5"
          >
            {showEmpty ? (
              <p className="text-ink-muted px-3 py-3 text-sm">No places match “{searched}”. Try a nearby city or check the spelling.</p>
            ) : (
              <ul id={listId} role="listbox" aria-label="Matching places">
                {results.map((place, i) => {
                  const isSaved = saved?.has(place.id);
                  return (
                    <li
                      key={place.id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onPointerEnter={() => setActive(i)}
                      onClick={() => choose(place)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? 'bg-ink-faint' : ''}`}
                    >
                      <MapPin className="text-ink-muted h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block truncate text-sm font-semibold">{place.name}</span>
                        <span className="text-ink-muted block truncate text-xs">
                          {[place.region, place.country].filter(Boolean).join(', ')}
                        </span>
                      </span>
                      {saved && (
                        <button
                          type="button"
                          onClick={(e) => toggleSave(e, place)}
                          aria-label={isSaved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
                          aria-pressed={isSaved}
                          className="rounded-lg p-1.5 hover:bg-[var(--ink-faint)]"
                        >
                          <Star
                            className={`h-4 w-4 ${isSaved ? 'fill-[var(--color-sun)] text-[var(--color-sun)]' : 'text-ink-muted'}`}
                          />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
