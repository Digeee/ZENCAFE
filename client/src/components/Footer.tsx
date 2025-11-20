// Footer component with four-column layout
import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium">About ZEN CAFE</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bringing you the finest Ceylon coffee and tea, sourced directly from Sri Lanka's pristine highlands.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/menu" data-testid="footer-link-menu">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Menu
                </span>
              </Link>
              <Link href="/about" data-testid="footer-link-about">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  About Us
                </span>
              </Link>
              <Link href="/contact" data-testid="footer-link-contact">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Contact
                </span>
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>123 Tea Garden Road</p>
              <p>Colombo, Sri Lanka</p>
              <p className="mt-4">Mon - Sat: 8am - 8pm</p>
              <p>Sunday: 9am - 6pm</p>
              <p className="mt-4">
                <a href="tel:+94112345678" className="hover:text-foreground transition-colors">
                  +94 11 234 5678
                </a>
              </p>
              <p>
                <a href="mailto:hello@zencafe.lk" className="hover:text-foreground transition-colors">
                  hello@zencafe.lk
                </a>
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe for exclusive offers and updates
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="text-sm"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" size="sm" data-testid="button-newsletter-subscribe">
                Join
              </Button>
            </form>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-social-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-social-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-social-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ZEN CAFE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
