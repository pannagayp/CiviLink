
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 max-w-2xl animate-fade-in">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-civilink-lightBlue text-civilink-blue text-sm font-medium animate-pulse-light">
              <span>Transform Your Community, One Action at a Time</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-civilink-text">
              Building connected, 
              <br className="hidden md:block" />
              sustainable, and
              <br className="hidden md:block" />
              responsive <span className="text-civilink-blue">communities.</span>
            </h1>
            
            <p className="text-lg text-civilink-text-secondary max-w-xl">
              CiviLink empowers citizens to report local issues, collaborate with
              governance, and drive real change — together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate('/report')}
                className="bg-civilink-blue hover:bg-civilink-darkBlue text-white shadow-button transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-12 px-6 text-base"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="border-civilink-blue text-civilink-blue hover:bg-civilink-lightBlue h-12 px-6 text-base transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[500px] w-full relative animate-fade-up delay-300">
            <div className="absolute top-0 right-0 w-full max-w-lg rounded-2xl bg-white shadow-card overflow-hidden animate-float">
              <div className="p-8">
                <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-civilink-blue text-white">
                  <ArrowRight className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold mb-4">CiviLink Platform</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-civilink-text-secondary">Issues Reported:</span>
                    <span className="font-medium">345</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-civilink-text-secondary">In Progress:</span>
                    <span className="font-medium">78</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-civilink-text-secondary">Resolved:</span>
                    <span className="font-medium">267</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-32 left-0 w-64 h-64 bg-civilink-blue/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-civilink-blue/5 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default Hero;
