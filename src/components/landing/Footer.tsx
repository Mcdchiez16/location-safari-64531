import { useNavigate } from "react-router-dom";
import logo from "@/assets/ticlapay-logo.png";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img src={logo} alt="TiclaPay Logo" className="h-8 object-contain rounded-lg" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fast and secure international money transfers. Your trusted partner for seamless cross-border payments worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li
                onClick={() => navigate("/about-us")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                About Us
              </li>
              <li
                onClick={() => navigate("/how-it-works")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                How It Works
              </li>
              <li
                onClick={() => navigate("/pricing")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Pricing
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li
                onClick={() => navigate("/help-center")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Help Center
              </li>
              <li
                onClick={() => navigate("/contact-us")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Contact Us
              </li>
              <li
                onClick={() => navigate("/faqs")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                FAQs
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li
                onClick={() => navigate("/privacy-policy")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Privacy Policy
              </li>
              <li
                onClick={() => navigate("/terms-of-service")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Terms of Service
              </li>
              <li
                onClick={() => navigate("/security")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Security
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TiclaPay. All rights reserved. Secure cross-border payments made easy.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
