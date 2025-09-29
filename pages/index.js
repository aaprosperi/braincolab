export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-light text-black mb-8">Brain co-lab</h1>
        <a 
          href="/multiAI" 
          className="inline-block px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Brain co-lab
        </a>
      </div>
    </div>
  )
}