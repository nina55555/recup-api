
import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "../css/Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.subject.trim() &&
      formData.message.trim()
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || sending) return;

    setSending(true);
    setFeedback("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    const { error } = await supabase.from("contact_messages").insert([payload]);
    if (error) {
      setFeedback("Envoi impossible pour le moment. Reessayez.");
      setSending(false);
      return;
    }

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setFeedback("Message enregistre avec succes.");
    setSending(false);
  };

  return (
    <section className="contact-page">
      <div className="contact-shell">
        <h2>CONTACT</h2>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-grid">
            <label className="contact-field">
              <span>Nom</span>
              <input
                type="text"
                name="name"
                placeholder="Votre nom"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="contact-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="vous@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="contact-field">
            <span>Sujet</span>
            <input
              type="text"
              name="subject"
              placeholder="Sujet de votre demande"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </label>

          <label className="contact-field">
            <span>Message</span>
            <textarea
              name="message"
              rows="6"
              placeholder="Expliquez votre besoin en quelques lignes..."
              value={formData.message}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="contact-submit" disabled={!canSubmit || sending}>
            {sending ? "Envoi..." : "Envoyer"}
          </button>

          {feedback ? <p className="contact-feedback">{feedback}</p> : null}
        </form>
      </div>
    </section>
  );
}
  
