"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "../../lib/toast";

export default function RegisterPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          fullName,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data?.message ||
          "No pudimos completar tu registro. Intenta de nuevo.";
        setErrorMessage(Array.isArray(message) ? message[0] : message);
        toast.error(
          Array.isArray(message) ? (message[0] as string) : (message as string)
        );
        return;
      }

      const data = await res.json();
      const token = data?.accessToken || data?.token;

      if (token && typeof window !== "undefined") {
        localStorage.setItem("accessToken", token);
      }

      toast.success("¡Bienvenido a bordo! Tu negocio ya está en marcha.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      const message =
        "Hubo un problema al registrar tu negocio. Intenta nuevamente en unos minutos.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Lado Izquierdo: Testimonial / Arte */}
      <div className="relative hidden w-0 flex-1 items-center justify-center overflow-hidden bg-slate-950 px-10 py-10 text-slate-100 md:flex">
        <div className="pointer-events-none absolute -inset-40 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.55),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.45),_transparent_55%)] opacity-60" />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center rounded-full bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-slate-700/80">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            POS Pro · Historias reales de dueños de negocio
          </div>
          <blockquote className="space-y-4">
            <p className="text-2xl font-semibold leading-snug tracking-tight text-slate-50">
              “Tomé el control de mi tienda en 5 minutos.”
            </p>
            <p className="text-sm text-slate-300">
              Antes llevaba todo en una libreta y en hojas de Excel. Ahora sé
              exactamente qué entra, qué sale y quién vende. Es como tener un
              gerente 24/7 vigilando mi negocio.
            </p>
          </blockquote>
          <div className="space-y-1 text-sm text-slate-300">
            <p className="font-medium text-slate-100">María López</p>
            <p className="text-slate-400">Dueña de Abarrotes La Esquina</p>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white px-6 py-8 shadow-sm shadow-slate-200 sm:px-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm">
              POS
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Crea tu cuenta gratis
            </h1>
            <p className="text-xs text-slate-500">
              No requerimos tarjeta de crédito.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="businessName"
                className="text-xs font-medium text-slate-700"
              >
                Nombre de tu Negocio
              </label>
              <input
                id="businessName"
                type="text"
                required
                placeholder="Ej: Abarrotes Don Pepe"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="text-xs font-medium text-slate-700"
              >
                Tu Nombre Completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                placeholder="Ej: José García"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-700"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="tu@negocio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-800/70"
            >
              {loading ? "Registrando..." : "Registrar mi Negocio"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Inicia Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


