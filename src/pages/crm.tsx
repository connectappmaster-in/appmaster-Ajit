import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CRM = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">CRM</h1>
        <p className="text-muted-foreground">Manage customer relationships and sales pipeline.</p>
      </main>
      <Footer />
    </div>
  );
};

export default CRM;
