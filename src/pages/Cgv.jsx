import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Cgv = () => {
  const [accepted, setAccepted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const raw = params.get("returnTo") || "/";
    try {
      if (raw.startsWith("/")) return raw;
    } catch (_) {
      // no-op
    }
    return "/";
  }, [location.search]);

  return (
    <main style={{ width: "100%", minHeight: "100vh", padding: "120px 24px 90px" }}>
      <section style={{ maxWidth: "980px", margin: "0 auto", color: "#111", lineHeight: 1.7 }}>
        <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>Conditions Generales de Vente (CGV)</h1>
        <p style={{ marginBottom: "12px" }}>
          Version: [a completer] - Derniere mise a jour: [a completer]
        </p>

        <h2 style={{ marginTop: "24px" }}>1. Objet</h2>
        <p>
          Les presentes CGV regissent les ventes realisees sur la plateforme via un mecanisme d&apos;encheres en ligne.
        </p>

        <h2 style={{ marginTop: "24px" }}>2. Fonctionnement des encheres</h2>
        <p>
          Le montant minimum de depart est fixe par la plateforme. L&apos;enchere la plus elevee valide a la fin du compte a
          rebours designe le gagnant.
        </p>

        <h2 style={{ marginTop: "24px" }}>3. Paiement et engagement</h2>
        <p>
          En encherissant, l&apos;utilisateur accepte qu&apos;en cas de victoire, un debit automatique de 50% du montant final soit
          effectue via Stripe. Les 50% restants sont regles lors du rendez-vous d&apos;essayage.
        </p>

        <h2 style={{ marginTop: "24px" }}>4. Echec de paiement</h2>
        <p>
          En cas d&apos;echec de paiement, la plateforme peut relancer le debit, annuler la victoire et appliquer les regles
          prevues dans les presentes CGV.
        </p>

        <h2 style={{ marginTop: "24px" }}>5. Donnees personnelles</h2>
        <p>
          Les donnees sont traitees pour la gestion du compte, des encheres et des paiements, conformement a la
          reglementation applicable.
        </p>

        <h2 style={{ marginTop: "24px" }}>6. Litiges et mediation</h2>
        <p>
          En cas de litige, le client peut d&apos;abord contacter le support. A defaut de resolution amiable, il peut saisir le
          mediateur de la consommation designe par le vendeur.
        </p>

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <label
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              style={{ marginTop: "2px" }}
            />
            <span>J&apos;ai lu et j&apos;accepte les CGV.</span>
          </label>

          <button
            type="button"
            disabled={!accepted}
            onClick={() => navigate(returnTo)}
            style={{
              marginTop: "14px",
              padding: "10px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(95,81,49,0.45)",
              background: accepted ? "linear-gradient(135deg, #f4ecdc 0%, #d8bc82 100%)" : "#eee",
              color: "#2f281d",
              cursor: accepted ? "pointer" : "not-allowed",
            }}
          >
            Retourner a la page precedente
          </button>
        </div>
      </section>
    </main>
  );
};

export default Cgv;
