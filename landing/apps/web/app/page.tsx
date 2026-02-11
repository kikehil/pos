import React from 'react';
import { BarChart3, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-12 pt-6 md:px-6 md:pt-8 lg:px-8">
        <Navbar />
        <main className="mt-10 flex-1 space-y-24 md:mt-16 md:space-y-28">
          <Hero />
          <Features />
          <Pricing />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm">
          POS
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-900 md:text-base">
          POS Pro
        </span>
      </div>

      <nav className="flex items-center gap-6">
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">
            Características
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Precios
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            Iniciar Sesión
          </button>
          <button className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900">
            Comenzar Gratis
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid gap-12 md:grid-cols-2 md:items-center">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          El Sistema Operativo para tu Negocio
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            El Sistema Operativo
            <span className="block text-indigo-600">para tu Negocio</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Controla inventario, ventas y personal desde cualquier lugar. Deja
            de usar libreta y Excel hoy mismo y ten tu negocio bajo control en
            minutos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Crear Cuenta Gratis
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">
            Ver Demo
          </button>
          <span className="text-xs text-slate-500">
            Prueba gratis. Sin tarjeta, sin compromiso.
          </span>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <span className="font-semibold">¿Te roban mercancía?</span>{' '}
          Contrólalo aquí con inventario blindado y reportes en tiempo real.
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-100 via-white to-sky-100 blur-2xl" />
        <div className="h-72 w-full rounded-3xl border border-slate-200 bg-slate-100 shadow-[0_22px_55px_rgba(15,23,42,0.28)] md:h-96">
          <div className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <div className="h-2 w-20 rounded-full bg-slate-300" />
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-rose-400" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Ventas Hoy
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  $18,920
                </p>
                <p className="mt-1 text-[11px] text-emerald-600">
                  +18% vs. ayer
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Stock Crítico
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">7</p>
                <p className="mt-1 text-[11px] text-amber-600">
                  Revisa inventario
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Usuarios Activos
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">12</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Cajas y meseros
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/90 p-4 text-xs text-slate-100">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Reporte en Tiempo Real
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-300">
                    Robo invisible
                  </p>
                  <p className="text-sm font-semibold text-white">
                    0 productos fuera de control
                  </p>
                </div>
                <div className="h-10 w-20 rounded-lg bg-gradient-to-tr from-emerald-400 to-indigo-500 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Características
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Todo lo que necesitas para tener tu negocio bajo control
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
          Un punto de venta moderno, inventario blindado y reportes en tiempo
          real para que sepas exactamente qué pasa en tu tienda en todo
          momento.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard
          icon={<ShoppingCart className="h-5 w-5 text-indigo-600" />}
          title="Punto de Venta Rápido"
          description="Cobra en segundos con una interfaz pensada para cajeros. Tickets claros, descuentos y múltiples formas de pago."
          chips={['Tickets rápidos', 'Múltiples cajas', 'Cortes precisos']}
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5 text-indigo-600" />}
          title="Inventario Blindado"
          description="Detecta faltantes, mermas y robos desde el primer día. Control por sucursal, lotes y alertas de stock."
          chips={['Alertas de stock', 'Kardex automático', 'Mermas controladas']}
        />
        <FeatureCard
          icon={<BarChart3 className="h-5 w-5 text-indigo-600" />}
          title="Reportes en Tiempo Real"
          description="Ventas, utilidades y productos más vendidos al instante. Decide con datos, no con corazonadas."
          chips={['Top productos', 'Margen por sucursal', 'Exporta a Excel']}
        />
      </div>
    </section>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  chips: string[];
};

function FeatureCard({ icon, title, description, chips }: FeatureCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
      <div className="space-y-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
          {icon}
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-900 md:text-base">
            {title}
          </h3>
          <p className="text-xs text-slate-600 md:text-sm">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Precios
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Planes simples que crecen contigo
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
          Empieza gratis y escala cuando tu negocio lo necesite. Sin letras
          chiquitas, sin contratos forzosos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PricingCard
          badge={null}
          name="Emprendedor"
          price="$0"
          subtitle="Siempre Gratis"
          description="Ideal para validar tu negocio o llevar control básico."
          features={[
            '1 punto de venta',
            'Hasta 100 productos',
            'Reportes básicos',
            'Soporte por email',
          ]}
          ctaLabel="Comenzar Gratis"
          highlighted={false}
        />
        <PricingCard
          badge="Más Popular"
          name="Pro"
          price="$799"
          subtitle="al mes"
          description="Para negocios en crecimiento que necesitan control total."
          features={[
            'Hasta 5 puntos de venta',
            'Inventario avanzado y alertas',
            'Reportes en tiempo real',
            'Soporte prioritario por WhatsApp',
          ]}
          ctaLabel="Probar Plan Pro"
          highlighted
        />
        <PricingCard
          badge={null}
          name="Empresarial"
          price="A medida"
          subtitle=""
          description="Para cadenas y franquicias que necesitan integración total."
          features={[
            'Sucursales ilimitadas',
            'Integraciones (ERP, contabilidad)',
            'Onboarding y entrenamiento',
            'Gerente de cuenta dedicado',
          ]}
          ctaLabel="Hablar con Ventas"
          highlighted={false}
        />
      </div>
    </section>
  );
}

type PricingCardProps = {
  badge: string | null;
  name: string;
  price: string;
  subtitle: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
};

function PricingCard({
  badge,
  name,
  price,
  subtitle,
  description,
  features,
  ctaLabel,
  highlighted,
}: PricingCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm shadow-slate-100 ${
        highlighted
          ? 'border-indigo-500 ring-2 ring-indigo-100'
          : 'border-slate-100'
      }`}
    >
      {badge && (
        <span className="mb-3 inline-flex items-center self-start rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          {badge}
        </span>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900 md:text-base">
          {name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {price}
          </span>
          {subtitle && (
            <span className="text-xs font-medium text-slate-500">
              {subtitle}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 md:text-sm">{description}</p>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs text-slate-600 md:text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-5 w-full rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
          highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-500 px-6 py-10 text-center text-white shadow-[0_22px_55px_rgba(15,23,42,0.45)] md:px-10 md:py-12">
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Empieza a controlar tu negocio hoy
        </h2>
        <p className="text-sm text-indigo-100 md:text-base">
          Deja atrás la libreta y el Excel. Configura tu punto de venta en
          minutos y ten claridad total de lo que entra y sale de tu negocio.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-indigo-50">
            Crear Cuenta Gratis
          </button>
          <button className="rounded-full border border-indigo-200/60 bg-indigo-500/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500/70">
            Ver Demo en Vivo
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 md:mt-16 md:flex-row md:text-sm">
      <p>© {new Date().getFullYear()} POS Pro. Todos los derechos reservados.</p>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-slate-700">
          Términos
        </a>
        <a href="#" className="hover:text-slate-700">
          Privacidad
        </a>
        <a href="#" className="hover:text-slate-700">
          Soporte
        </a>
      </div>
    </footer>
  );
}


