import { Shield } from "lucide-react";
import type { UserRole } from "../../types";

export type NoteSettings = {
  showLegacy: boolean;
};

export const DEFAULT_SETTINGS: NoteSettings = {
  showLegacy: false,
};

export function loadSettings(): NoteSettings {
  try {
    const raw = localStorage.getItem("geonotes_settings");
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<NoteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: NoteSettings) {
  localStorage.setItem("geonotes_settings", JSON.stringify(s));
}

// component

interface Props {
  settings: NoteSettings;
  userRole: UserRole;
  onChange: (s: NoteSettings) => void;
}

export function SettingsPanel({ settings, userRole, onChange }: Props) {
  const toggle = (key: keyof NoteSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    onChange(next);
    saveSettings(next);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4 px-6 overflow-y-auto">
      <h3 className="text-text mb-6">Settings</h3>

      {/* legacy notes */}
      <p className="text-muted text-xs font-medium uppercase tracking-wider mb-3">Notes</p>
      <div className="space-y-2 mb-6">
        <ToggleRow
          label="Legacy notes"
          description="Old Firestore notes (read-only archive)"
          checked={settings.showLegacy}
          onToggle={() => toggle("showLegacy")}
        />
      </div>

      {/* appearance */}
      <p className="text-muted text-xs font-medium uppercase tracking-wider mb-3">Appearance</p>
      <div className="bg-surface-2 rounded-2xl px-4 py-3 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-text">Note colours</p>
            <p className="text-xs text-muted/60 mt-0.5">Custom pin colours per note or group</p>
          </div>
          <span className="text-xs text-muted/40 bg-surface px-2 py-1 rounded-full">soon</span>
        </div>
      </div>

      {/* account */}
      {userRole === "ADMIN" && (
        <>
          <p className="text-muted text-xs font-medium uppercase tracking-wider mb-3">Account</p>
          <div className="bg-surface-2 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Shield size={15} className="text-brand shrink-0" />
            <div>
              <p className="text-sm text-text font-medium">Admin</p>
              <p className="text-xs text-muted/60 mt-0.5">You have administrator access</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// toggle row

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm text-text leading-snug">{label}</p>
        <p className="text-xs text-muted/60 mt-0.5 leading-snug">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
          checked ? "bg-brand" : "bg-border/40"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
