import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Subscriptions = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Subscriptions</h1>
        <p className="text-muted-foreground">Manage software subscriptions and licenses.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Subscriptions;
