import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/assets/images/gmkart-captain-logo.png';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gmkart.door';

export default function DeliverFooter() {
  return (
    <footer className="bg-[#14181c] text-white">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-12 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Image src={Logo} alt="GMKart Captain" width={44} height={44} className="h-11 w-auto object-contain" />
            <div>
              <div className="font-bold text-lg leading-tight">GMKart Captain</div>
              <div className="text-xs text-white/50">Delivery Partner Network</div>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <Link href="/deliver/privacy-policy" className="text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
              Support
            </Link>
          </div>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-white text-[#14181c] px-5 py-3 rounded-[3px] font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            Get the App
          </a>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} GMKart Captain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
