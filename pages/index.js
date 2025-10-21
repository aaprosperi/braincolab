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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation */}
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🧠 Brain Co-Lab
                </span>
              </div>
              <a
                href="/multiAI"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Launch App →
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6">
                One Platform,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> All AIs</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Access the world's most powerful AI models through a single, unified interface.
                Compare responses, track costs, and find the perfect AI for your needs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a
                  href="/multiAI"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Start Chatting →
                </a>
                <a
                  href="https://github.com/aaprosperi/braincolab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
                >
                  View on GitHub
                </a>
              </div>

              {/* Model badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {FEATURED_MODELS.map((model) => (
                  <span
                    key={model}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Everything you need in one place
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {LANDING_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto text-center text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold mb-2">17+</div>
                <div className="text-blue-100">AI Models</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Open Source</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">⚡</div>
                <div className="text-blue-100">Edge Powered</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to explore the AI universe?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start chatting with multiple AI models right now. No credit card required.
            </p>
            <a
              href="/multiAI"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Launch Brain Co-Lab →
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-white py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 sm:mb-0">
              © 2025 Brain Co-Lab. Built with ❤️ by the community
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com/aaprosperi/braincolab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Powered by Vercel
              </a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
