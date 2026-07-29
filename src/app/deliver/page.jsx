"use client";

import Image from 'next/image';
import HeroBg from '@/assets/images/delivery.png';
import AppScreenshot from '@/assets/images/delivery-ss.jpeg';
import DeliverHeader from './components/DeliverHeader';
import DeliverFooter from './components/DeliverFooter';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gmkart.door';

const FEATURES = [
  {
    title: 'Maximum Earnings',
    description: 'Competitive per-order pay plus launch bonuses and incentive programs for our first partners.',
    highlight: 'LAUNCH BONUSES ACTIVE',
    accent: '#C9491D'
  },
  {
    title: 'Complete Flexibility',
    description: 'Work full time, part time, or weekends only — log in and out whenever suits your schedule.',
    highlight: '24/7 AVAILABILITY',
    accent: '#12377D'
  },
  {
    title: 'Weekly Payments',
    description: 'Direct bank transfers processed every Monday morning. No delays, no chasing payouts.',
    highlight: 'NO PAYMENT DELAYS',
    accent: '#C9491D'
  },
  {
    title: 'Priority Support',
    description: 'Launch partners get a dedicated support line and direct access to our operations team.',
    highlight: 'FOUNDER-LEVEL SUPPORT',
    accent: '#12377D'
  }
];

const APP_HIGHLIGHTS = [
  {
    title: 'Instant order alerts',
    description: 'Real-time delivery requests based on your location and preferences.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a5 5 0 00-5 5v3.4c0 .8-.3 1.5-.8 2.1L5 15h14l-1.2-1.5c-.5-.6-.8-1.3-.8-2.1V8a5 5 0 00-5-5z" stroke="#12377D" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Smart navigation',
    description: 'Built-in maps with optimized routes to save time and increase deliveries.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" stroke="#12377D" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Earnings tracker',
    description: 'Monitor daily and weekly earnings, incentives, and performance metrics.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="13" width="3.5" height="6" fill="#12377D" />
        <rect x="10.5" y="9" width="3.5" height="10" fill="#12377D" />
        <rect x="16" y="5" width="3.5" height="14" fill="#12377D" />
      </svg>
    )
  }
];

export default function DeliveryPartnerPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DeliverHeader />

      {/* Hero */}
      <section className="relative min-h-[640px] flex items-stretch">
        <div className="absolute inset-0 z-0">
          <Image src={HeroBg} alt="GMKart delivery partner" fill priority className="object-cover" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(100deg, rgba(10,20,35,0.92) 0%, rgba(10,20,35,0.78) 42%, rgba(10,20,35,0.35) 75%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 sm:px-12 pt-24 sm:pt-[104px] pb-16 sm:pb-[72px] w-full">
          <div className="max-w-[600px]">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-8 h-0.5 bg-[#C9491D]" />
              <span className="text-[13px] font-bold tracking-[0.12em] text-[#ff8a5c] uppercase">India&apos;s Delivery Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white leading-[1.08] tracking-tight mb-[22px]">
              Start earning with<br />GMKart Captain
            </h1>

            <p className="text-base sm:text-[16.5px] text-white/82 leading-[1.65] max-w-[480px] mb-10">
              Join a growing fleet of delivery partners. Competitive per-order pay, weekly settlements, and routes built for consistent daily earnings.
            </p>

            <div className="flex items-center gap-6 sm:gap-8 mb-11 flex-wrap">
              <div>
                <div className="text-2xl sm:text-[30px] font-extrabold text-white">₹1,200–1,800</div>
                <div className="text-xs text-white/60 mt-0.5">Potential daily earnings</div>
              </div>
              <div className="w-px h-[38px] bg-white/25" />
              <div>
                <div className="text-2xl sm:text-[30px] font-extrabold text-white">Weekly</div>
                <div className="text-xs text-white/60 mt-0.5">Settlement cycle</div>
              </div>
              <div className="w-px h-[38px] bg-white/25" />
              <div>
                <div className="text-2xl sm:text-[30px] font-extrabold text-white">Zero</div>
                <div className="text-xs text-white/60 mt-0.5">Upfront costs</div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              <a
                href="/deliver/register"
                className="inline-flex items-center gap-2.5 bg-[#C9491D] text-white font-bold text-[15.5px] px-8 py-4 rounded-[3px] hover:bg-[#b03e18] transition-colors"
              >
                Start Registration →
              </a>
              <span className="text-[13px] text-white/60">Takes 2 minutes · No documents upfront</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why GMKart */}
      <section id="why-gmkart" className="bg-white py-24 sm:py-[104px] px-6 sm:px-12 scroll-mt-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14 border-b border-[#eceae6] pb-9">
            <div>
              <div className="flex items-center gap-2.5 mb-[18px]">
                <span className="w-7 h-0.5 bg-[#12377D]" />
                <span className="text-[13px] font-bold tracking-[0.1em] text-[#12377D] uppercase">Why Choose GMKart</span>
              </div>
              <h2 className="text-[28px] sm:text-[34px] font-extrabold text-[#14181c] max-w-[520px] leading-[1.2]">
                Built for partners who show up every day
              </h2>
            </div>
            <p className="text-[15px] text-[#5a5f66] leading-relaxed max-w-[380px]">
              Be among the first to join and lock in launch-partner terms as we scale our network across the country.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#eceae6] border border-[#eceae6]">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white p-9 py-9 px-7">
                <div className="w-1 h-9 mb-[22px]" style={{ background: feature.accent }} />
                <h3 className="text-lg font-bold text-[#14181c] mb-3">{feature.title}</h3>
                <p className="text-sm text-[#5a5f66] leading-[1.65] mb-5">{feature.description}</p>
                <div className="text-[12.5px] font-bold tracking-wide" style={{ color: feature.accent }}>{feature.highlight}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#12377D] p-9 sm:px-14 sm:py-12 mt-14">
            <div className="flex items-center justify-between flex-wrap gap-8">
              <div className="max-w-[340px]">
                <h3 className="text-2xl font-extrabold text-white mb-2.5">Launch Partner Benefits</h3>
                <p className="text-sm text-white/72 leading-relaxed">Exclusive terms for the first 100 riders who join our network.</p>
              </div>
              <div className="flex flex-wrap gap-0">
                <div className="px-6 sm:px-10 border-l border-white/20">
                  <div className="text-2xl sm:text-[26px] font-extrabold text-white">Higher</div>
                  <div className="text-xs text-white/65 mt-1">Commission rates</div>
                </div>
                <div className="px-6 sm:px-10 border-l border-white/20">
                  <div className="text-2xl sm:text-[26px] font-extrabold text-white">Priority</div>
                  <div className="text-xs text-white/65 mt-1">Delivery zones</div>
                </div>
                <div className="px-6 sm:px-10 border-l border-white/20">
                  <div className="text-2xl sm:text-[26px] font-extrabold text-white">First</div>
                  <div className="text-xs text-white/65 mt-1">100 partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner App */}
      <section id="partner-app" className="bg-[#f7f6f4] py-24 sm:py-[104px] px-6 sm:px-12 scroll-mt-20">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-[22px]">
              <span className="w-7 h-0.5 bg-[#C9491D]" />
              <span className="text-[13px] font-bold tracking-[0.1em] text-[#C9491D] uppercase">Partner App</span>
            </div>
            <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#14181c] mb-9 leading-[1.2]">
              Run your day from the GMKart Captain app
            </h2>

            <div className="space-y-0">
              {APP_HIGHLIGHTS.map((item, i) => (
                <div
                  key={item.title}
                  className={`flex gap-5 py-0 mb-[30px] pb-[30px] ${i < APP_HIGHLIGHTS.length - 1 ? 'border-b border-[#e2e0dc]' : 'mb-9 pb-0'}`}
                >
                  <div className="w-10 h-10 flex-none border-[1.5px] border-[#12377D] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[15.5px] font-bold text-[#14181c] mb-1.5">{item.title}</div>
                    <div className="text-sm text-[#5a5f66] leading-[1.55]">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#14181c] text-white px-6 py-[13px] rounded-[3px] hover:bg-black transition-colors"
            >
              <span className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[9px] border-l-white" />
              <span className="leading-tight">
                <span className="block text-[10px] text-white/65">GET IT ON</span>
                <span className="block text-[15px] font-bold">Google Play</span>
              </span>
            </a>
          </div>

          <div className="relative flex justify-center">
            <div className="w-80 h-[520px] bg-[#14181c] rounded-[48px] p-4 shadow-2xl">
              <div className="relative w-full h-full rounded-[40px] overflow-hidden border-8 border-[#14181c]">
                <Image src={AppScreenshot} alt="GMKart Captain app — live navigation" fill className="object-cover object-top" />
              </div>
            </div>

            <div className="absolute left-0 sm:left-6 bottom-6 bg-[#14181c] px-5 py-4 rounded-lg flex items-center gap-3.5">
              <div className="text-xl font-extrabold text-white">₹1,240</div>
              <div className="w-px h-6 bg-white/25" />
              <div className="text-xs text-white/65 leading-tight">Earned today<br />12 deliveries</div>
            </div>
          </div>
        </div>
      </section>

      <DeliverFooter />
    </div>
  );
}
