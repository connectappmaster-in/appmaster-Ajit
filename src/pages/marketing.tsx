import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Marketing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Marketing</h1>
        <p className="text-muted-foreground">Marketing tools and campaign management.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Marketing;
