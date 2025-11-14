import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
const Hero = () => {
  return <section className="relative overflow-hidden bg-gradient-to-b from-background to-accent/10 pt-24 pb-0">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent md:text-6xl">
            One Platform for All Your Business Needs
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Streamline operations with our all-in-one business management suite.                                             
          </p>
          
          
        </div>
      </div>
    </section>;
};
export default Hero;