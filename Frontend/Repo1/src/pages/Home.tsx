import landingPageImage from '../assets/landing-page.webp'; // Assuming it's in public folder

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${landingPageImage})` }}
      ></div>

      {/* Optional overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/30 backdrop-blur-xs z-0"></div>

      {/* Content */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Instant collaborations for <br /> remote teams
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          All in one for your remote team chats, <br /> collaboration and track projects
        </p>
        <div className="flex space-x-4 justify-center">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Start free Trial
          </button>
          <button className="border border-gray-700 text-gray-800 py-2 px-4 rounded flex items-center">
            View pricing plans <span className="ml-2">▶</span>
          </button>
        </div>
      </section>
    </div>
  );
}
