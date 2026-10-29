import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { User, RotateCw, Mail, Code2 } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import BlurText from '../reactbits/BlurText';
import Marquee from '../reactbits/Marquee';
import FlipCard from '../reactbits/FlipCard';
import PointerHighlight from '../ui/PointerHighlight';

// Real members are marked with `photo` pointing at /assets/team/<file>
// - drop the image there and it displays automatically (falls back to the
// placeholder icon until then). Everyone else here is still mock data
// (name/socials/quote are placeholders) and stays that way until real
// info is provided.
//
// `photoPosition` is a CSS object-position value (e.g. 'center 20%',
// 'center top') used with object-fit: cover so each portrait's crop can
// be tuned per person instead of one setting for everyone. Defaults to
// 'center 20%' (biases toward the head) - nudge individual values once
// you can see how each photo actually crops on the live site.
const LEADERSHIP = [
  {
    name: 'Ashfaq Ahmed. M',
    role: 'President',
    domain: 'Networking & Cybersecurity',
    accent: '#38BDF8',
    quote: null,
    photo: '/assets/team/ashfaq-ahmed-m.png',
    photoPosition: 'center 15%',
    socials: { email: 'mailto:ashfaqashu689@gmail.com', github: null, linkedin: 'https://www.linkedin.com/in/ashfaq-ahmed-m-b3a49a2a5/' }
  },
  {
    name: 'Nabeel',
    role: 'Vice President',
    domain: 'Design & Development',
    accent: '#2DD4BF',
    quote: 'Code . Inspire People . Leave a Legacy .',
    isDeveloper: true, // permanent PointerHighlight on the name + small "</> Developer" pill on the Team card - visual only
    photo: '/assets/team/nabeel.jpeg',
    photoPosition: 'center 10%',
    socials: {
      email: 'mailto:tmdnabeel4656.tmn@gmail.com',
      github: 'https://github.com/MD-NABEEL-T',
      linkedin: 'https://linkedin.com/in/mohammed-nabeel-t'
    }
  },
  {
    name: 'Harini Radhakrishnan',
    role: 'Session Handler',
    domain: 'Soft Skills',
    accent: '#38BDF8',
    photo: '/assets/team/Harini-Radhakrishnan.jpg',
    photoPosition: 'center 15%',
    quote: 'Good sessions come from good questions, not just good slides.',
    socials: { email: 'mailto:hariniradha2727@gmail.com', github: 'https://github.com/hariniradha2727-hue.git', linkedin: 'https://www.linkedin.com/in/r-harini-274fa06h' }
  },
  {
    name: 'Aamir T',
    role: 'Event Manager',
    domain: 'Events & Operations',
    accent: '#E4E4E7',
    quote: 'Bringing vision into reality through high-energy department events and student workshops.',
    photo: '/assets/team/aamir.jpg',
    photoPosition: 'center 28%',
    socials: {
      email: 'mailto:aamirfahad789@gmail.com',
      github: null,
      linkedin: 'https://www.linkedin.com/in/md-aamir-t-543a60383?utm_source=share_via&utm_content=profile&utm_medium=member_android'
    }
  }
];

// 10 core members, split into two rows for the marquee
const CORE_MEMBERS = [
  {
    name: 'Shareen Begum.Z',
    tier: 'Core Member',
    domain: 'AI/ML',
    accent: '#818CF8',
    quote: 'Stand firm. Think bigger. Deliver better.',
    photo: '/assets/team/shareen-begum-z.png',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:zshareenbegum@gmail.com', github: 'https://github.com/shareenbegum', linkedin: 'https://www.linkedin.com/in/shareen-begum-z-649266379' }
  },
  {
    name: 'Sahira Fathima N',
    tier: 'Core Member',
    domain: 'AI/ML',
    accent: '#818CF8',
    quote: 'Curiosity fuels progress, action creates results.',
    photo: '/assets/team/sahira-fathima.png',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:sahirafathima0809@gmail.com', github: null, linkedin: 'https://www.linkedin.com/in/sahira-fathima-n-b6a72439b' }
  },
  {
    name: 'Bargavi R',
    tier: 'Core Member',
    domain: 'AI/ML',
    accent: '#818CF8',
    quote: null,
    photo: '/assets/team/bargavi-r.jpeg',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:bargavi042@gmail.com', github: null, linkedin: 'http://www.linkedin.com/in/bargavi-rajesh-5977783b3' }
  },
  {
    name: 'DHIVYA THARINI KB',
    tier: 'Core Member',
    domain: 'Design & Development',
    accent: '#2DD4BF',
    photo: '/assets/team/DHIVYA-THARINI-KB.jpg',
    photoPosition: 'center 20%',
    quote: 'Code the vision. Create the impact.',
    socials: { email: 'dhivyatharini369@gmail.com', github: 'dhivya-tharini18 (Dhivya Tharini) https://share.google/Sp0ygy4xvjzA2SBaM', linkedin: 'https://www.linkedin.com/in/dhivyatharini-balakumar-ab07043b0?utm_source=share_via&utm_content=profile&utm_medium=member_android' }
  },
  {
    name: 'Deepadharshini Sankar',
    tier: 'Core Member',
    domain: 'Data Analytics',
    accent: '#F59E0B',
    quote: 'while(alive): learn(); build(); innovate();',
    photo: '/assets/team/Deepadharshini-Sankar.jpg',
    photoPosition: 'center 20%',
    socials: { email: 'deepadharshini.sankar@gmail.com', github: 'deepa-dharshini10 (Deepadharshini Sankar) https://share.google/Fqxs5jbsWCRmjP1al', linkedin: 'https://www.linkedin.com/in/deepadharshini-sankar-115266379?utm_source=share_via&utm_content=profile&utm_medium=member_android' }
  },
  {
    name: 'S Mohammad Saifullah Roomy',
    tier: 'Core Member',
    domain: 'Data Analytics',
    accent: '#F59E0B',
    quote: null,
    photo: '/assets/team/s-mohammad-saifullah-roomy.jpg',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:saifullahroomy129@gmail.com', github: 'https://github.com/roomy129', linkedin: 'https://www.linkedin.com/in/md-saifullah-roomy-s-14a9493a0/' }
  },
  {
    name: 'Mohamed Riyaz M',
    tier: 'Core Member',
    domain: 'Networking & Cybersecurity',
    accent: '#38BDF8',
    quote: 'Learning today. Leading tomorrow.',
    photo: '/assets/team/mohamed-riyaz-m.jpeg',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:riyazzen.46@gmail.com', github: 'https://github.com/riyaz062', linkedin: 'https://www.linkedin.com/in/mohamed-riyaz-m-42bab7385' }
  },
  {
    name: 'Mohamed Zaid',
    tier: 'Core Member',
    domain: 'Networking & Cybersecurity',
    accent: '#38BDF8',
    quote: 'Driven by curiosity, powered by consistency.',
    photo: '/assets/team/mohamed-zaid.jpeg',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:zaid.offl.007@gmail.com', github: 'https://github.com/Minni-Zaid', linkedin: 'https://www.linkedin.com/in/immohamedzaid' }
  },
  {
    name: 'Mohammed Owais Ansari',
    tier: 'Core Member',
    domain: 'Networking & Cybersecurity',
    accent: '#38BDF8',
    quote: null,
    photo: '/assets/team/mohammed-owais-ansari.png',
    photoPosition: 'center 20%',
    socials: { email: 'mailto:owaisansari1626@gmail.com', github: 'https://github.com/owaisansari1626', linkedin: 'https://www.linkedin.com/in/owaisansari1626' }
  },
  {
    name: 'Akramullah',
    tier: 'Core Member',
    domain: 'Data Analytics',
    accent: '#F59E0B',
    quote: null,
    photo: '/assets/team/Akramullah.jpg',
    photoPosition: 'center 20%',
    socials: {
      email: 'mailto:akramullahtech@gmail.com',
      github: 'https://github.com/Akramullah7',
      linkedin: 'https://www.linkedin.com/in/akramullah-'
    }
  },
  {
    name: 'Jayasuriyan K',
    tier: 'Core Member',
    domain: 'Public Speaking & Corporate Communication',
    accent: '#FB7185',
    quote: null,
    photo: '/assets/team/JAYASURIYAN.jpg',
    photoPosition: 'center 20%',
    socials: {
      email: 'mailto:jayasuriyan2209@gmail.com',
      github: 'https://github.com/jayasuriyan2209',
      linkedin: 'https://www.linkedin.com/in/jayasuriyan-k-596265779'
    }
  }
];
const half = Math.ceil(CORE_MEMBERS.length / 2);
const CORE_ROW_1 = CORE_MEMBERS.slice(0, half);
const CORE_ROW_2 = CORE_MEMBERS.slice(half);

// Shows the real photo when `photo` is set and loads successfully;
// otherwise falls back to the original icon placeholder unchanged.
const Photo = ({ photo, accent, position = 'center', className = '' }) => {
  const [errored, setErrored] = useState(false);

  if (photo && !errored) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl border ${className}`} style={{ borderColor: `${accent}33` }}>
        <img
          src={photo}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: position }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border ${className}`}
      style={{ backgroundColor: `${accent}0d`, borderColor: `${accent}33` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <User className="w-7 h-7" style={{ color: `${accent}55` }} />
      </div>
    </div>
  );
};

const FlipHint = ({ accent }) => (
  <span
    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm border"
    style={{ borderColor: `${accent}44` }}
  >
    <RotateCw className="w-3 h-3 text-white/70" />
  </span>
);

const DeveloperBadge = ({ accent }) => (
  <span
    className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono font-semibold uppercase tracking-wider bg-black/50 backdrop-blur-sm border"
    style={{ borderColor: `${accent}55`, color: accent }}
  >
    <Code2 className="w-2.5 h-2.5" />
    Developer
  </span>
);

const SocialRow = ({ socials, accent, size = 'sm' }) => {
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4';
  const btnClass = size === 'sm' ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8';

  const links = [
    { key: 'email', href: socials.email, Icon: Mail },
    { key: 'github', href: socials.github, Icon: FaGithub },
    { key: 'linkedin', href: socials.linkedin, Icon: FaLinkedin }
  ].filter(link => link.href);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {links.map(({ key, href, Icon }) => (
        <a
          key={key}
          href={href}
          target={key === 'email' ? undefined : '_blank'}
          rel={key === 'email' ? undefined : 'noreferrer'}
          onClick={e => e.stopPropagation()}
          className={`${btnClass} rounded-full flex items-center justify-center border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors`}
          style={{ '--tw-ring-color': accent }}
        >
          <Icon className={iconClass} />
        </a>
      ))}
    </div>
  );
};

const LeadershipCard = ({ leader, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    className="h-[275px] sm:h-[350px] lg:h-[380px] w-full"
  >
    <FlipCard
      className="w-full h-full"
      front={
        <div className="relative w-full h-full rounded-2xl border border-white/10 bg-zinc-950/90 p-2.5 sm:p-4 lg:p-5 flex flex-col justify-between overflow-hidden hover:border-white/20 transition-colors">
          <div>
            <div className="relative">
              {leader.isDeveloper && (
                <span
                  className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] sm:text-[9px] font-mono font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-sm border"
                  style={{ borderColor: `${leader.accent}55`, color: leader.accent }}
                >
                  <Code2 className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                  Dev
                </span>
              )}
              <span
                className="absolute top-1.5 right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm border z-10"
                style={{ borderColor: `${leader.accent}44` }}
              >
                <RotateCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/70" />
              </span>
              <Photo
                photo={leader.photo}
                accent={leader.accent}
                position={leader.photoPosition}
                className="h-32 sm:h-44 lg:h-52 w-full mb-2 sm:mb-3 rounded-xl object-cover"
              />
            </div>
            <p
              className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate mb-0.5"
              style={{ color: leader.accent }}
            >
              {leader.role}
            </p>
            {leader.isDeveloper ? (
              <PointerHighlight
                containerClassName="inline-block max-w-full"
                rectangleClassName="border-[#38BDF8]/50"
                pointerClassName="text-[#38BDF8] h-3.5 w-3.5 sm:h-4 sm:w-4"
              >
                <h4 className="relative z-10 font-display text-xs sm:text-base lg:text-lg font-bold text-white truncate px-0.5">
                  {leader.name}
                </h4>
              </PointerHighlight>
            ) : (
              <h4 className="font-display text-xs sm:text-base lg:text-lg font-bold text-white truncate">{leader.name}</h4>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 truncate pt-1">{leader.domain}</p>
        </div>
      }
      back={
        <div className="relative w-full h-full rounded-2xl border border-white/10 bg-zinc-950 p-3 sm:p-5 lg:p-6 flex flex-col justify-between overflow-hidden">
          <div>
            <p
              className="text-[9px] sm:text-xs font-semibold uppercase tracking-wide mb-0.5"
              style={{ color: leader.accent }}
            >
              {leader.role}
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-400 mb-2 sm:mb-3 truncate">{leader.domain}</p>
            {leader.quote && (
              <p className="text-[10px] sm:text-xs lg:text-sm text-zinc-300 italic leading-snug sm:leading-relaxed line-clamp-4 sm:line-clamp-5">
                "{leader.quote}"
              </p>
            )}
          </div>
          <SocialRow socials={leader.socials} accent={leader.accent} size="sm" />
        </div>
      }
    />
  </motion.div>
);

const CoreMemberCard = ({ member }) => (
  <FlipCard
    className="w-[145px] h-[195px] sm:w-[160px] sm:h-[215px] shrink-0"
    front={
      <div className="relative w-full h-full rounded-xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-3 flex flex-col">
        <FlipHint accent={member.accent} />
        <Photo photo={member.photo} accent={member.accent} position={member.photoPosition} className="aspect-square mb-2" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: member.accent }} />
          <p className="text-[11px] sm:text-xs font-medium text-white truncate">{member.name}</p>
        </div>
        <p className="text-[9px] sm:text-[10px] text-[#71717A] pl-3 truncate">{member.tier}</p>
      </div>
    }
    back={
      <div className="relative w-full h-full rounded-xl border border-white/10 bg-[#0a0a0a] p-2.5 sm:p-3 flex flex-col justify-between">
        <div>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wide mb-1" style={{ color: member.accent }}>
            {member.tier}
          </p>
          <p className="text-[9px] sm:text-[10px] text-[#71717A] mb-1.5 truncate">{member.domain}</p>
          {member.quote && (
            <p className="text-[10px] sm:text-[11px] text-[#D4D4D8] italic leading-snug line-clamp-3">"{member.quote}"</p>
          )}
        </div>
        <SocialRow socials={member.socials} accent={member.accent} size="sm" />
      </div>
    }
  />
);

const CoreMemberRow = ({ members, direction, delayStart }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: delayStart }}
      className="mb-3.5 last:mb-0 select-none"
    >
      <Marquee direction={direction} speed={24} pauseOnHover>
        <div className="flex gap-3.5 pr-3.5">
          {members.map(member => (
            <CoreMemberCard key={member.name} member={member} />
          ))}
        </div>
      </Marquee>
    </motion.div>
  );
};

export const TeamSection = () => {
  const introRef = useRef(null);
  const introInView = useInView(introRef, { once: true, amount: 0.4 });
  const [showIntroParagraph, setShowIntroParagraph] = useState(false);
  const coreHeadingRef = useRef(null);
  const coreHeadingInView = useInView(coreHeadingRef, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!introInView) return;
    const timer = setTimeout(() => setShowIntroParagraph(true), 350);
    return () => clearTimeout(timer);
  }, [introInView]);

  return (
    <section id="team" className="relative w-full bg-black overflow-hidden pt-16 pb-14 sm:pt-24 sm:pb-20 scroll-mt-24 sm:scroll-mt-28">
      {/* Section introduction */}
      <div ref={introRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-14">
        {introInView && (
          <BlurText
            text="Meet the Team"
            direction="top"
            delay={60}
            stepDuration={0.4}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
          />
        )}

        {showIntroParagraph && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed max-w-xl"
          >
            Behind every session, event, workshop and achievement is a passionate team working together to build the C3 community.
          </motion.p>
        )}
      </div>

      {/* Leadership - 4 members: balanced 2x2 grid on mobile, 4 columns on laptop/desktop */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {LEADERSHIP.map((leader, i) => (
            <LeadershipCard key={leader.role} leader={leader} index={i} />
          ))}
        </div>
      </div>

      {/* Core members - two fast marquee rows with horizontal scroll & swipe support */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={coreHeadingRef} className="flex items-center justify-between mb-4 sm:mb-6">
          {coreHeadingInView && (
            <BlurText
              text="Core Members"
              direction="top"
              delay={30}
              stepDuration={0.3}
              className="text-xs uppercase tracking-widest text-[#71717A]"
            />
          )}
          <span className="text-[10px] sm:text-[11px] text-[#71717A] inline-block font-mono">
            ← Drag or swipe horizontally to browse →
          </span>
        </div>
        <CoreMemberRow members={CORE_ROW_1} direction="left" delayStart={0} />
        <CoreMemberRow members={CORE_ROW_2} direction="right" delayStart={0.15} />
      </div>
    </section>
  );
};

export default TeamSection;