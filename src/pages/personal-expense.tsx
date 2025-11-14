import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PersonalExpense = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Personal Expense Tracker</h1>
        <p className="text-muted-foreground">Track your personal expenses and budgets.</p>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalExpense;
