import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Reduce operational costs by up to 50%",
  "Increase team productivity with automation",
  "Real-time insights and analytics",
  "Scale seamlessly as you grow",
  "99.9% uptime guarantee",
  "World-class support team"
];

const Benefits = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Built for businesses of all sizes, from startups to enterprises. 
              Our platform grows with you.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary-glow/20 rounded-2xl blur-3xl" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
              alt="Business Analytics"
              className="relative rounded-2xl shadow-2xl border border-border"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
