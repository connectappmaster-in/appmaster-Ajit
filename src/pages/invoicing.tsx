import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Invoicing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Invoicing</h1>
        <p className="text-muted-foreground">Create and manage invoices efficiently.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Invoicing;
