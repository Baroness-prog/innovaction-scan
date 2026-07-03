// ui.jsx — atomes UI partagés. Styles inline volontaires (autonomie, cf. CLAUDE.md).
import React from "react";
import { C } from "../lib/socle.js";

export function Btn({ children, onClick, variant = "primary", disabled, style, type = "button", full }) {
  const base = {
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 600,
    padding: "11px 20px",
    borderRadius: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "background .15s, transform .05s, box-shadow .15s",
    opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : undefined,
  };
  const variants = {
    primary: { background: C.terre, color: C.blanc, boxShadow: "0 1px 2px rgba(0,0,0,.12)" },
    secondary: { background: C.blanc, color: C.terreFonce, border: `1px solid ${C.sable}` },
    ghost: { background: "transparent", color: C.terreFonce, border: `1px solid transparent` },
    fonce: { background: C.terreFonce, color: C.blanc },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function MiniBtn({ children, onClick, active, title, style }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 600,
        padding: "5px 11px",
        borderRadius: 8,
        cursor: "pointer",
        border: `1px solid ${active ? C.terre : C.sable}`,
        background: active ? C.terre : C.blanc,
        color: active ? C.blanc : C.gris,
        transition: "all .12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style, pad = 22 }) {
  return (
    <div
      style={{
        background: C.blanc,
        border: `1px solid ${C.sable}`,
        borderRadius: 16,
        padding: pad,
        boxShadow: "0 1px 3px rgba(58,46,40,.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, couleur = C.terre }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".09em",
        textTransform: "uppercase",
        color: couleur,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

// Barre de progression / jauge (valeur sur `max`).
export function Bar({ value, max = 5, couleur = C.terre, height = 9, fond = C.cremeFonce }) {
  const pct = Math.max(0, Math.min(1, (value ?? 0) / max)) * 100;
  return (
    <div style={{ background: fond, borderRadius: 999, height, overflow: "hidden", width: "100%" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: couleur,
          borderRadius: 999,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

// Puce d'étiquette
export function Tag({ children, couleur = C.terre, style }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        background: hexA(couleur, 0.12),
        color: couleur,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.encre, marginBottom: 6 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 12.5, color: C.gris, marginTop: 5 }}>{hint}</div>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "inherit",
        fontSize: 15,
        padding: "10px 12px",
        borderRadius: 9,
        border: `1px solid ${C.sable}`,
        background: C.blanc,
        color: C.encre,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

// Sélecteur 1–5 (échelle de collecte).
export function Echelle5({ value, onChange, couleur = C.terre }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 700,
              padding: "10px 0",
              borderRadius: 9,
              cursor: "pointer",
              border: `1px solid ${on ? couleur : C.sable}`,
              background: on ? couleur : C.blanc,
              color: on ? C.blanc : C.gris,
              transition: "all .12s",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({ etapes, courant, onGo }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {etapes.map((e, i) => {
        const on = i === courant;
        const done = i < courant;
        return (
          <React.Fragment key={e.id}>
            <button
              type="button"
              onClick={() => onGo && onGo(i)}
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: on ? 700 : 600,
                padding: "6px 12px",
                borderRadius: 999,
                cursor: onGo ? "pointer" : "default",
                border: `1px solid ${on ? C.terre : done ? C.terreClair : C.sable}`,
                background: on ? C.terre : done ? hexA(C.terre, 0.1) : C.blanc,
                color: on ? C.blanc : done ? C.terreFonce : C.gris,
                whiteSpace: "nowrap",
              }}
            >
              {i + 1}. {e.nom}
            </button>
            {i < etapes.length - 1 && <span style={{ color: C.sable }}>·</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Couleur selon la note 1–5.
export function couleurNote(v) {
  if (v == null) return C.gris;
  if (v >= 4) return C.vert;
  if (v >= 3) return C.ambre;
  return C.brique;
}

// hex + alpha → rgba
export function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function fmtEuro(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
