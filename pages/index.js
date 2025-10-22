import Head from 'next/head';
import { useEffect, useState } from 'react';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'Múltiples Modelos de IA',
      description: 'Más de 17 modelos de IA de OpenAI, Anthropic, Google, Meta y más proveedores líderes',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚡',
      title: 'Velocidad Ultrarrápida',
      description: 'Respuestas instantáneas gracias a Vercel Edge Functions y streaming en tiempo real',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '💰',
      title: 'Control de Costos',
      description: 'Monitoreo en tiempo real del uso y análisis de costos detallado por cada modelo',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🔐',
      title: 'Seguridad Total',
      description: 'Tus claves API están gestionadas de forma segura a través de la infraestructura de Vercel',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const models = [
    { name: 'GPT-4o', provider: 'OpenAI' },
    { name: 'Claude 4.5', provider: 'Anthropic' },
    { name: 'Gemini Pro', provider: 'Google' },
    { name: 'Llama 3.3', provider: 'Meta' },
    { name: 'Mistral Large', provider: 'Mistral' },
    { name: 'Grok 2', provider: 'xAI' },
    { name: 'DeepSeek', provider: 'DeepSeek' },
    { name: 'Perplexity', provider: 'Perplexity' }
  ];

  const stats = [
    { value: '17+', label: 'Modelos de IA', icon: '🤖' },
    { value: '8', label: 'Proveedores', icon: '🏢' },
    { value: '100%', label: 'Open Source', icon: '💻' },
    { value: '⚡', label: 'Edge Powered', icon: null }
  ];

  return (
    <>
      <Head>
        <title>BrainColab - Plataforma Multi-IA de Nueva Generación</title>
        <meta name="description" content="Conecta con múltiples modelos de IA a través de una única interfaz. Accede a GPT-4, Claude, Gemini y más. Comparación en tiempo real y control de costos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        <Navigation />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <Container>
            <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Badge variant="primary" size="lg" className="mb-6 animate-fade-in">
                ✨ Más de 17 modelos de IA disponibles
              </Badge>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Una Plataforma,
                <br />
                <span className="text-gradient">Todas las IAs</span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Accede a los modelos de IA más poderosos del mundo a través de una única interfaz unificada.
                Compara respuestas, monitorea costos y encuentra la IA perfecta para tus necesidades.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/multiAI">
                  <Button variant="primary" size="lg" className="text-lg">
                    Comenzar a Chatear
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <a href="https://github.com/aaprosperi/braincolab" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" className="text-lg">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Ver en GitHub
                  </Button>
                </a>
              </div>

              {/* Floating Model Badges */}
              <div className="flex flex-wrap justify-center gap-3">
                {models.map((model, i) => (
                  <div
                    key={model.name}
                    className={`transition-all duration-500 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <Card padding="sm" className="inline-flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{model.name}</span>
                      <span className="text-xs text-gray-500">by {model.provider}</span>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-gray-50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Diseñado para desarrolladores, investigadores y entusiastas de la IA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <Card padding="lg" className="h-full">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
          <Container>
            <div className="text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-12">
                BrainColab en Números
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="transition-all duration-500 hover:scale-105">
                    <div className="text-5xl sm:text-6xl font-bold mb-2">
                      {stat.icon || stat.value}
                    </div>
                    <div className="text-lg text-blue-100">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* How it Works */}
        <section className="py-20 px-4 bg-white">
          <Container size="default">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                ¿Cómo Funciona?
              </h2>
              <p className="text-xl text-gray-600">
                Tres pasos simples para comenzar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Elige tu Modelo', desc: 'Selecciona entre más de 17 modelos de IA de los proveedores líderes' },
                { step: '2', title: 'Escribe tu Pregunta', desc: 'Escribe tu consulta o usa entrada de voz para interactuar naturalmente' },
                { step: '3', title: 'Obtén Respuestas', desc: 'Recibe respuestas en streaming en tiempo real con seguimiento de costos detallado' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gray-50">
          <Container size="sm">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                ¿Listo para explorar el universo de la IA?
              </h2>
              <p className="text-xl text-gray-600 mb-10">
                Comienza a chatear con múltiples modelos de IA ahora mismo. Sin necesidad de tarjeta de crédito.
              </p>
              <Link href="/multiAI">
                <Button variant="primary" size="lg" className="text-xl px-12 py-5">
                  Iniciar BrainColab
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-12 px-4">
          <Container>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-600 text-center md:text-left">
                © 2025 BrainColab. Construido con dedicación por la comunidad
              </div>
              <div className="flex gap-8">
                <a
                  href="https://github.com/aaprosperi/braincolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  GitHub
                </a>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Powered by Vercel
                </a>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </>
  );
}