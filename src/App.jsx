// App.jsx — orchestration des 5 étapes + Atelier du référentiel.
import React, { useEffect, useState } from "react";
import { C } from "./lib/socle.js";
import catalogueBrut from "./data/catalogue.json";
import { catalogueAjuste } from "./lib/methode.js";
import { loadFeedback, saveFeedback, iaDisponible } from "./lib/api.js";
import { Stepper, Btn, Tag, hexA } from "./components/ui.jsx";
import Cadrage from "./components/Cadrage.jsx";
import Generation from "./components/Generation.jsx";
import Collecte from "./components/Collecte.jsx";
import Restitution from "./components/Restitution.jsx";
import Apprentissage from "./components/Apprentissage.jsx";
import Atelier from "./components/Atelier.jsx";

const ETAPES = [
  { id: "cadrage", nom: "Cadrage" },
  { id: "generation", nom: "Génération" },
  { id: "collecte", nom: "Collecte" },
  { id: "restitution", nom: "Restitution" },
  { id: "apprentissage", nom: "Apprentissage" },
];

export default function App() {
  const [etape, setEtape] = useState(0);
  const [atelierOuvert, setAtelierOuvert] = useState(false);
  const [ia, setIa] = useState(null); // null=inconnu, true/false

  // Feedback d'apprentissage (persisté localStorage).
  const [feedback, setFeedbackState] = useState(() => loadFeedback());
  const setFeedback = (fb) => {
    setFeedbackState(fb);
    saveFeedback(fb);
  };

  // Catalogue ajusté par les votes accumulés.
  const catalogue = catalogueAjuste(catalogueBrut, feedback);

  // État de la mission courante.
  const [cadre, setCadre] = useState({ entreprise: "", secteur: "", taille: "", phase: "" });
  const [selection, setSelection] = useState(null);
  const [collecte, setCollecte] = useState({});
  const [fin, setFin] = useState({ ca: "", ebe: "", resultat: "" });

  useEffect(() => {
    iaDisponible().then(setIa);
  }, []);

  const go = (i) => setEtape(Math.max(0, Math.min(ETAPES.length - 1, i)));

  const nouvelleMission = () => {
    setCadre({ entreprise: "", secteur: "", taille: "", phase: "" });
    setSelection(null);
    setCollecte({});
    setFin({ ca: "", ebe: "", resultat: "" });
    setEtape(0);
    setAtelierOuvert(false);
  };

  return (
    <div style={{ minHeight: "100%", background: C.creme }}>
      {/* En-tête */}
      <header
        style={{
          borderBottom: `1px solid ${C.sable}`,
          background: C.blanc,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: C.terre,
                color: C.blanc,
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              AR
            </span>
            <div>
              <div style={{ fontWeight: 800, color: C.encre, fontSize: 15.5, lineHeight: 1 }}>AR FOR PULSE</div>
              <div style={{ fontSize: 12, color: C.gris }}>Diagnostic du capital immatériel</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {ia === false && <Tag couleur={C.gris} style={{ fontSize: 11 }}>mode fallback (sans IA)</Tag>}
            {ia === true && <Tag couleur={C.vert} style={{ fontSize: 11 }}>IA active</Tag>}
            <Btn variant={atelierOuvert ? "primary" : "secondary"} onClick={() => setAtelierOuvert((o) => !o)} style={{ padding: "8px 14px", fontSize: 13.5 }}>
              🛠 Atelier
            </Btn>
            <Btn variant="ghost" onClick={nouvelleMission} style={{ padding: "8px 12px", fontSize: 13.5 }}>
              Nouvelle mission
            </Btn>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "22px 20px 60px" }}>
        {atelierOuvert ? (
          <Atelier catalogue={catalogueBrut} feedback={feedback} setFeedback={setFeedback} onFermer={() => setAtelierOuvert(false)} />
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <Stepper etapes={ETAPES} courant={etape} onGo={(i) => i <= etape && go(i)} />
            </div>

            {etape === 0 && <Cadrage cadre={cadre} setCadre={setCadre} onNext={() => go(1)} />}
            {etape === 1 && (
              <Generation
                cadre={cadre}
                catalogue={catalogue}
                selection={selection}
                setSelection={setSelection}
                onNext={() => go(2)}
                onBack={() => go(0)}
              />
            )}
            {etape === 2 && (
              <Collecte selection={selection} collecte={collecte} setCollecte={setCollecte} onNext={() => go(3)} onBack={() => go(1)} />
            )}
            {etape === 3 && (
              <Restitution
                cadre={cadre}
                catalogue={catalogue}
                collecte={collecte}
                fin={fin}
                setFin={setFin}
                onNext={() => go(4)}
                onBack={() => go(2)}
              />
            )}
            {etape === 4 && (
              <Apprentissage
                cadre={cadre}
                selection={selection}
                feedback={feedback}
                setFeedback={setFeedback}
                onFinish={() => setAtelierOuvert(true)}
                onBack={() => go(3)}
              />
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${C.sable}`, background: C.blanc }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "16px 20px", fontSize: 12.5, color: C.gris, textAlign: "center" }}>
          AR FOR PULSE — méthode propriétaire · référentiel adaptatif · modèle GRP (Verstraete, Bordeaux) ·
          valorisation indicative non opposable.
        </div>
      </footer>
    </div>
  );
}
