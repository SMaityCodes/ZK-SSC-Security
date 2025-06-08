import { Input } from "@/components/ui/input";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1A1D26] text-white px-10 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        
        {/* Column 1: Logo + Social */}
        <div>
          <h2 className="text-xl font-bold mb-6">team</h2>
          <div className="flex flex-col gap-2 text-gray-300">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <a href="#" className="flex items-center gap-2 hover:text-white">
                  <FaInstagram /> instagram
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-white">
                  <FaFacebook /> Facebook
                </a>
                <a href="#" className="flex items-center gap-2 hover:text-white">
                  <FaTwitter /> Twitter
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Use Cases */}
        <div>
          <h4 className="font-medium mb-4">Use Cases</h4>
          <ul className="text-gray-300 space-y-2">
            {["UI Design", "UX Design", "Prototyping", "UI Design", "UX Design", "Prototyping"].map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Column 3: Explore */}
        <div>
          <h4 className="font-medium mb-4">Explore</h4>
          <ul className="text-gray-300 space-y-2">
            {["Figma", "Customers", "Why I Love Figma", "Figma", "Customers", "Why I Love Figma"].map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Column 4: Resources */}
        <div>
          <h4 className="font-medium mb-4">Resources</h4>
          <ul className="text-gray-300 space-y-2">
            {["Community Resources Hub", "Support", "Education", "Community Resources Hub", "Support", "Education"].map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Column 5: Newsletter */}
        <div>
          <h4 className="font-medium mb-4">Subscribe to our newsletter</h4>
          <div className="flex items-center border border-gray-400 rounded-md overflow-hidden bg-[#A8B2C1] text-[#1A1D26]">
            <Input
              type="email"
              placeholder="Email"
              className="bg-[#A8B2C1] text-[#1A1D26] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <button className="text-xl px-3 text-[#4A5EFF] hover:text-blue-600 transition">
              →
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
