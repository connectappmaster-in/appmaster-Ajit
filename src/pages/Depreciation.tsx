import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Depreciation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Depreciation</h1>
        <p className="text-muted-foreground">Manage asset depreciation and financial reporting.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Depreciation;
