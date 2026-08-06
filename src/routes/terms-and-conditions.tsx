import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Trayi Jewellery" },
      { name: "description", content: "Read the Terms & Conditions for Trayi Jewellery. Understand our policies on purchases, returns, and customer obligations." },
      { property: "og:title", content: "Terms & Conditions — Trayi Jewellery" },
      { property: "og:description", content: "Terms and conditions for Trayi Jewellery services and purchases." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Effective Date: January 1, 2024</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-display text-foreground mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing and using this website (trayi.com), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">2. Use License</h2>
            <p className="mb-2">
              Permission is granted to temporarily download one copy of the materials (information or software) on Trayi Jewellery's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">3. Disclaimer</h2>
            <p>
              The materials on Trayi Jewellery's website are provided on an 'as is' basis. Trayi Jewellery makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">4. Limitations</h2>
            <p>
              In no event shall Trayi Jewellery or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Trayi Jewellery's website, even if Trayi Jewellery or a Trayi Jewellery authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Trayi Jewellery's website could include technical, typographical, or photographic errors. Trayi Jewellery does not warrant that any of the materials on its website are accurate, complete, or current. Trayi Jewellery may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">6. Materials and Links</h2>
            <p>
              Trayi Jewellery has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Trayi Jewellery of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">7. Modifications</h2>
            <p>
              Trayi Jewellery may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Mangalore, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">9. Product Information</h2>
            <p className="mb-2">
              All product descriptions, pricing, and availability information provided on our website are subject to change without notice. We strive to provide accurate information, but we do not warrant that product descriptions, pricing, or other content of any product displayed on the website is accurate, complete, reliable, current, or error-free.
            </p>
            <p>
              All lab-grown diamonds sold by Trayi Jewellery are certified by independent gemological institutes and come with proper documentation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">10. Orders and Payments</h2>
            <p className="mb-2">
              By placing an order on our website, you are offering to purchase a product or service. All orders are subject to acceptance and confirmation. Trayi Jewellery reserves the right to refuse any order. Payment must be received before the order is processed and shipped.
            </p>
            <p>
              We accept various payment methods as displayed on our website. All transactions are secure and encrypted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">11. Shipping and Delivery</h2>
            <p className="mb-2">
              We ship orders within 5-7 business days. Delivery times depend on the delivery location and courier service. Trayi Jewellery is not responsible for any delays caused by the courier or external factors.
            </p>
            <p>
              Please refer to our Shipping & Returns policy for detailed information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">12. Returns and Exchanges</h2>
            <p className="mb-2">
              We accept returns and exchanges within 7 days of purchase for products in their original condition and packaging. Please refer to our detailed returns policy for complete information and procedures.
            </p>
            <p>
              Custom or personalized items cannot be returned or exchanged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">13. Intellectual Property Rights</h2>
            <p>
              All content on this website, including text, graphics, logos, images, and software, is the property of Trayi Jewellery or its content suppliers and is protected by international copyright laws. Unauthorized reproduction or distribution is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">14. User Responsibilities</h2>
            <p className="mb-2">
              Users agree that they will not use the website for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Transmitting any unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable material</li>
              <li>Disrupting the normal flow of dialogue within our website</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Collecting or tracking personal information of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display text-foreground mb-3">15. Contact Information</h2>
            <p className="mb-2">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <ul className="space-y-1 ml-2">
              <li>Email: <a href="mailto:hello@trayijewellers.in" className="text-accent hover:underline">hello@trayijewellers.in</a></li>
              <li>Phone: Available on request</li>
              <li>Location: Mangalore, Karnataka, India</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            For more information about our policies, visit our:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="text-accent hover:underline">Contact Us</Link>
            <Link to="/about" className="text-accent hover:underline">Our Story</Link>
            <Link to="/education" className="text-accent hover:underline">Lab-Grown Diamonds 101</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
