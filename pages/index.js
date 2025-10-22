import Head from 'next/head';
import { LANDING_FEATURES, FEATURED_MODELS } from '../utils/constants';

export default function Home() {
  return (
    <>
      <Head>
        <title>Brain Co-Lab - Multi-AI Chat Platform</title>
        <meta name="description" content="Connect with multiple AI models through a single interface. Access GPT-4, Claude, Gemini, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Navigation */}
        <nav className="glass sticky top-0 z-50 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center animate-fade-in">
                <span className="text-2xl font-bold">
                  <span className="text-3xl">🧠</span>
                  <span className="ml-2 gradient-text">Brain Co-Lab</span>
                </span>
              </div>
              <a
                href="/multiAI"
                className="btn-primary animate-fade-in delay-200"
              >
                Launch App →
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
                One Platform,
                <br />
                <span className="gradient-text animate-gradient">All AIs</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Access the world's most powerful AI models through a single, unified interface.
                <br />
                <span className="text-lg text-gray-500 mt-2 inline-block">Compare responses, track costs, and find the perfect AI for your needs.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <a
                  href="/multiAI"
                  className="btn-primary text-lg px-10 py-4 animate-scale-in"
                >
                  Start Chatting →
                </a>
                <a
                  href="https://github.com/aaprosperi/braincolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-lg px-10 py-4 animate-scale-in delay-100"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                  </span>
                </a>
              </div>

              {/* Model badges with stagger animation */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {FEATURED_MODELS.map((model, i) => (
                  <span
                    key={model}
                    className="card px-4 py-2 text-sm font-semibold text-gray-700 animate-scale-in hover:scale-110 cursor-default"
                    style={{ animationDelay: `${i * 50 + 300}ms` }}
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Everything you need in <span className="gradient-text">one place</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed for the modern AI workflow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LANDING_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="card p-8 group hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 animate-gradient bg-[length:200%_200%]"></div>

          <div className="relative max-w-7xl mx-auto text-center text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="animate-fade-in-up delay-100">
                <div className="text-6xl sm:text-7xl font-bold mb-3 gradient-text-accent drop-shadow-lg">
                  17+
                </div>
                <div className="text-xl text-purple-100 font-medium">AI Models</div>
                <div className="text-sm text-purple-200 mt-2">From leading providers</div>
              </div>
              <div className="animate-fade-in-up delay-300">
                <div className="text-6xl sm:text-7xl font-bold mb-3 gradient-text-accent drop-shadow-lg">
                  100%
                </div>
                <div className="text-xl text-purple-100 font-medium">Open Source</div>
                <div className="text-sm text-purple-200 mt-2">Community driven</div>
              </div>
              <div className="animate-fade-in-up delay-500">
                <div className="text-6xl sm:text-7xl font-bold mb-3">⚡</div>
                <div className="text-xl text-purple-100 font-medium">Edge Powered</div>
                <div className="text-sm text-purple-200 mt-2">Lightning fast responses</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial / Social Proof Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-5xl mx-auto text-center">
            <div className="card p-12 animate-fade-in-up">
              <div className="text-4xl mb-6">💬</div>
              <blockquote className="text-2xl sm:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
                "The easiest way to compare and interact with multiple AI models in one place"
              </blockquote>
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Ready to explore the <span className="gradient-text">AI universe</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Start chatting with multiple AI models right now.<br />
                <span className="text-base text-gray-500">No credit card required. Free to start.</span>
              </p>
              <a
                href="/multiAI"
                className="btn-primary text-lg px-12 py-5 inline-block animate-glow"
              >
                Launch Brain Co-Lab →
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600 text-center sm:text-left">
                © 2025 Brain Co-Lab. Built with <span className="text-red-500">❤️</span> by the community
              </div>
              <div className="flex gap-6">
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
          </div>
        </footer>
      </div>
    </>
  );
}
