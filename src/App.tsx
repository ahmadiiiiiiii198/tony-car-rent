import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Fleet } from './components/Fleet';
import { Services } from './components/Services';
import { Footer } from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Hero />
          <Fleet />
          <Services />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
