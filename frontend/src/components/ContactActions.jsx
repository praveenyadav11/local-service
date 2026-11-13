import { MessageCircle, Phone } from "lucide-react";

function ContactActions({ phone, name }) {
  if (!phone) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
      <span className="text-sm font-semibold text-emerald-900">
        {name}: +91 {phone}
      </span>
      <div className="ml-auto flex gap-2">
        <a href={`tel:+91${phone}`} className="btn-secondary gap-1.5 !py-1.5">
          <Phone className="h-4 w-4" /> Call
        </a>
        <a
          href={`https://wa.me/91${phone}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary gap-1.5 !py-1.5"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

export default ContactActions;
