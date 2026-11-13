import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Phone, User } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import FormField from "./FormField";

function ContactForm() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.put("/auth/me", form);
      updateUser(res.data.user);
      setSuccess("Your details have been saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#172033]">Contact details</h2>
      <p className="mb-5 text-sm text-slate-500">
        Your phone number is only shared with the other person after a booking
        is confirmed.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {success}
          </div>
        )}

        <FormField
          label="Full name"
          icon={User}
          value={form.name}
          maxLength={50}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <FormField
          label="Mobile number"
          icon={Phone}
          type="tel"
          inputMode="numeric"
          placeholder="9876543210"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <button disabled={saving} className="btn-primary gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save details
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
