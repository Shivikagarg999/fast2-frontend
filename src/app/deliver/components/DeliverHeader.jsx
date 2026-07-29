import Image from 'next/image';
import Logo from '@/assets/images/gmkart-captain-logo.png';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gmkart.door';

export default function DeliverHeader() {
  return (
    <header className="border-b border-[#eceae6] sticky top-0 z-50 bg-white">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        <a href="/deliver" className="flex items-center">
          <Image src={Logo} alt="GMKart Captain" width={160} height={64} priority className="h-16 w-auto object-contain" />
        </a>
        <nav className="hidden md:flex items-center gap-9">
          <a href="/deliver#why-gmkart" className="text-sm font-semibold text-[#14181c] hover:text-[#C9491D] transition-colors">Why GMKart</a>
          <a href="/deliver#partner-app" className="text-sm font-semibold text-[#14181c] hover:text-[#C9491D] transition-colors">Partner App</a>
          <a href="/deliver/register" className="text-sm font-semibold text-[#14181c] hover:text-[#C9491D] transition-colors">Register</a>
          <a href="/contact" className="text-sm font-semibold text-[#14181c] hover:text-[#C9491D] transition-colors">Support</a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C9491D] text-white px-[22px] py-[11px] rounded-[3px] font-bold text-sm hover:bg-[#b03e18] transition-colors"
          >
            Download App
          </a>
        </nav>
      </div>
    </header>
  );
}
