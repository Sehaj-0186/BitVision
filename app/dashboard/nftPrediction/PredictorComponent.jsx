'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ParticlesNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, 255, 0.5)`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };
    
    let particles = [];
    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 15000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }
    };
    
    const connect = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.5;
            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            );
            gradient.addColorStop(0, `rgba(29, 78, 216, ${opacity})`);
            gradient.addColorStop(1, `rgba(219, 39, 119, ${opacity})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      connect();
      requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
};

const GradientBackground = () => (
  <>
    <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
  </>
);

const PredictorComponent = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(true);
    setError(null);

    try {
      const response = await axios.get('/api/predictiondata', {
        params: {
          blockchain: 'ethereum',
          contract_address: contractAddress,
          time_range: '24h'
        }
      });
      
      setAnalyticsData(response.data);
      setShowAnalytics(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics data');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsAnimating(false);
    }
  };

  const PreviousDiv = () => {
    setShowAnalytics(false);
  };

  const GradientBackground = () => (
    <>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />
    </>
  );

  return (
    <div className="w-full md:w-3/4 lg:w-1/2 h-screen md:h-[80vh] bg-zinc-950 mx-auto my-5 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticlesNetwork />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/50 via-transparent to-transparent" />
      
      <div className="w-full md:w-4/5 h-4/5 bg-zinc-900/80 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center relative overflow-hidden border border-zinc-800/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <GradientBackground />

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {!showAnalytics ? (
          <div className="relative z-10 w-full max-w-md space-y-16">
            <div className="text-center">
              <h1 className="text-4xl font-thin text-white mb-2">NFT Collection Analytics</h1>
              <p className="text-md italic bg-gradient-to-r from-blue-600 to-pink-600 text-transparent bg-clip-text">
                Powered by AI
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-12 space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-pink-500/20 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="relative w-full px-4 py-3 bg-zinc-800/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-400 transition-all border border-zinc-700/30"
                  placeholder="Enter Contract Address"
                  required
                />
              </div>

              <div className="relative">
                <button
                  type="submit"
                  disabled={isAnimating}
                  className={`
                    group
                    w-full px-6 py-3 
                    text-white font-medium 
                    rounded-lg
                    relative
                    overflow-hidden
                    transition-all duration-300
                    bg-gradient-to-r from-zinc-900 to-zinc-900
                    hover:from-zinc-900 hover:to-zinc-900
                    disabled:opacity-50
                    before:absolute before:inset-0
                    before:bg-gradient-to-r before:from-transparent before:via-blue-500/10 before:to-transparent
                    before:translate-x-[-200%]
                    before:animate-[${isAnimating ? 'shimmer_1.5s_ease-in-out' : 'none'}]
                    after:absolute after:inset-0
                    after:bg-gradient-to-r after:from-transparent after:via-pink-500/10 after:to-transparent
                    after:translate-x-[-200%]
                    after:animate-[${isAnimating ? 'shimmer_1.5s_ease-in-out_0.2s' : 'none'}]
                  `}
                >
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className={`transition-transform duration-500 ${isAnimating ? 'scale-95' : ''}`}>
                      Analyze Collection
                    </span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="relative z-10 w-full max-w-md space-y-8 overflow-y-auto h-full font-light">
            <div className="text-center">
              <h1 className="text-4xl font-thin text-white mb-2">NFT Collection Analytics</h1>
              <p className="text-md italic bg-gradient-to-r from-blue-600 to-pink-600 text-transparent bg-clip-text">
                Powered by AI
              </p>
            </div>

            <div className="bg-transparent p-4 rounded-lg shadow-md border border-zinc-900">
              <h2 className="text-xl font-semibold text-white">Collection Analytics</h2>
              <ul className="mt-2 text-gray-300">
                <li>Assets: {analyticsData?.assets || 0}</li>
                <li>Floor Price: {(analyticsData?.floor_price || 0).toFixed(4)} USD</li>
                <li>Sales: {analyticsData?.sales || 0}</li>
                <li>Transactions: {analyticsData?.transactions || 0}</li>
                <li>Volume: {(analyticsData?.volume || 0).toFixed(4)} USD</li>
              </ul>
            </div>

            <div className="bg-transparent p-4 rounded-lg shadow-md border border-zinc-900">
              <h2 className="text-xl font-semibold text-white">Collection Scores</h2>
              <ul className="mt-2 text-gray-300">
                <li>Royalty Price: {analyticsData?.royalty_price || 0}%</li>
                <li>Minting Revenue: {analyticsData?.minting_revenue || 0} USD</li>
              </ul>
            </div>

            <div className="bg-transparent p-4 rounded-lg shadow-md border border-zinc-900">
              <h2 className="text-xl font-semibold text-white">Collection Traders</h2>
              <p className="mt-2 text-gray-300">Number of Traders: {analyticsData?.traders_count || 0}</p>
            </div>

            <div className="bg-transparent p-4 rounded-lg shadow-md border border-zinc-900">
              <h2 className="text-xl font-semibold text-white">Washtrade</h2>
              <p className="mt-2 text-gray-300">Washtrade Volume: {(analyticsData?.washtrade_volume || 0).toFixed(4)} USD</p>
            </div>

            <div className="relative">
              <button
                onClick={PreviousDiv}
                disabled={isAnimating}
                className={`
                  group
                  w-full px-6 py-3 
                  text-white font-medium 
                  rounded-lg
                  relative
                  overflow-hidden
                  transition-all duration-300
                  bg-gradient-to-r from-zinc-900 to-zinc-900
                  hover:from-zinc-900 hover:to-zinc-900
                  disabled:opacity-50
                  before:absolute before:inset-0
                  before:bg-gradient-to-r before:from-transparent before:via-blue-500/10 before:to-transparent
                  before:translate-x-[-200%]
                  before:animate-[${isAnimating ? 'shimmer_1.5s_ease-in-out' : 'none'}]
                  after:absolute after:inset-0
                  after:bg-gradient-to-r after:from-transparent after:via-pink-500/10 after:to-transparent
                  after:translate-x-[-200%]
                  after:animate-[${isAnimating ? 'shimmer_1.5s_ease-in-out_0.2s' : 'none'}]
                `}
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className={`transition-transform duration-500 ${isAnimating ? 'scale-95' : ''}`}>
                    Go Back
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictorComponent;