import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Attendance = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Attendance</h1>
        <p className="text-muted-foreground">Track and manage employee attendance records.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Attendance;
