// A date always offers the same base schedule; Google Calendar removes busy slots.
export function meetingSlots(dateKey: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return [];
  const parsed = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dateKey) return [];
  if (parsed.getUTCDay() === 0 || parsed.getUTCDay() === 6) return [];
  let seed = 2166136261;
  for (const char of dateKey) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  if (seed % 7 === 0 || seed % 11 === 0) return [];
  const morning = (seed >>> 3) % 2 ? ['09:00', '11:00'] : ['10:00', '12:00'];
  const afternoon = (seed >>> 7) % 2 ? ['15:00', '17:00'] : ['16:00', '18:00'];
  return [...morning, ...afternoon];
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
