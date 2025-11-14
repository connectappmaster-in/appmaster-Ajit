import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Inventory = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Inventory</h1>
        <p className="text-muted-foreground">Real-time inventory tracking and warehouse management.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Inventory;
