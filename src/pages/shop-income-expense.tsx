import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ShopIncomeExpense = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Income & Expenditure Tracker</h1>
        <p className="text-muted-foreground">Track shop income and expenses efficiently.</p>
      </main>
      <Footer />
    </div>
  );
};

export default ShopIncomeExpense;
