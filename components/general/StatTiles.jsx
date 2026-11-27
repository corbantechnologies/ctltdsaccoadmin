/**
 * A compact row of figures for the top of a list page.
 * tiles: [{ label, value, hint?, tone?: "default" | "good" | "bad" | "accent" }]
 */
const TONES = {
    default: "text-slate-900",
    good: "text-emerald-700",
    bad: "text-red-600",
    accent: "text-[var(--accent)]",
};

export default function StatTiles({ tiles = [] }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
            {tiles.map((t) => (
                <div key={t.label} className="bg-white px-3.5 py-2.5 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">{t.label}</p>
                    <p className={`text-sm sm:text-base font-semibold tabular-nums truncate ${TONES[t.tone || "default"]}`}>
                        {t.value}
                    </p>
                    {t.hint && <p className="text-[10px] text-slate-400 truncate">{t.hint}</p>}
                </div>
            ))}
        </div>
    );
}
