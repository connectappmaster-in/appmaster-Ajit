import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-muted-foreground">Get in touch with us for custom solutions.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
