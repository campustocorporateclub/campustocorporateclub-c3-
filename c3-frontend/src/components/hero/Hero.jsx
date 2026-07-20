import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Starfield from './Starfield';
import Preloader, { RING_CIRCUMFERENCE } from './Preloader';
import Navbar from './Navbar';
import HeroContent from './HeroContent';
import './hero.css';

gsap.registerPlugin(ScrollTrigger);

const BOOT_MESSAGES = ['INITIALIZING C3 CORE...', 'LOADING MODULES...', 'SYSTEMS READY'];

const Hero = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  // Preloader refs
  const ringGroupRef = useRef(null);
  const progressRingRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const hudRefs = useRef([]);
  const bootLineRef = useRef(null);

  // Hero content refs
  const headingWrapRef = useRef(null);
  const headingRef = useRef(null);
  const glitchARef = useRef(null);
  const glitchBRef = useRef(null);
  const subRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const boltRef = useRef(null);
  const mainStrokeRef = useRef(null);
  const branch1Ref = useRef(null);
  const branch2Ref = useRef(null);

  // ============ MASTER TIMELINE: preloader -> panel split -> hero stagger -> lightning ============
  useEffect(() => {
    const master = gsap.timeline({
      onComplete: () => setShowPreloader(false),
    });

    gsap.set([headingRef.current, subRef.current, descRef.current, ctaRef.current], {
      opacity: 0,
      y: 22,
    });
    gsap.set(boltRef.current, { opacity: 0 });
    gsap.set([glitchARef.current, glitchBRef.current], { opacity: 0 });

    gsap.set(progressRingRef.current, {
      strokeDasharray: RING_CIRCUMFERENCE,
      strokeDashoffset: RING_CIRCUMFERENCE,
    });

    // --- 1. Ring fades in ---
    master.fromTo(
      ringGroupRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    );

    // --- 2. HUD corner flicker + boot-sequence log, all keyed off 'ringStart' ---
    master.addLabel('ringStart', '<');

    master.fromTo(
      hudRefs.current,
      { opacity: 0 },
      {
        opacity: 0.7,
        duration: 0.06,
        repeat: 4,
        yoyo: true,
        stagger: { each: 0.07, from: 'random' },
      },
      'ringStart'
    );

    BOOT_MESSAGES.forEach((msg, i) => {
      master.call(
        () => {
          if (bootLineRef.current) bootLineRef.current.textContent = msg;
        },
        null,
        `ringStart+=${i * 0.47}`
      );
    });

    // --- 3. Ring border fills - this IS the loading indicator ---
    master.to(
      progressRingRef.current,
      { strokeDashoffset: 0, duration: 1.4, ease: 'none' },
      'ringStart'
    );

    // --- 4. Preloader group exits, panels split apart ---
    master.to(ringGroupRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
    master.to(hudRefs.current, { opacity: 0, duration: 0.2 }, '<');
    master.to(bootLineRef.current, { opacity: 0, duration: 0.2 }, '<');
    master.to(
      leftPanelRef.current,
      { xPercent: -100, duration: 0.65, ease: 'power3.inOut' },
      '-=0.05'
    );
    master.to(
      rightPanelRef.current,
      { xPercent: 100, duration: 0.65, ease: 'power3.inOut' },
      '<'
    );

    // --- 5. Hero content stagger-in ---
    master
      .to(headingRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(descRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    // --- 6. Lightning strike through the heading ---
    master.add(() => {
      const strikeTl = gsap.timeline();
      const mainLen = mainStrokeRef.current.getTotalLength();
      const b1Len = branch1Ref.current.getTotalLength();
      const b2Len = branch2Ref.current.getTotalLength();

      gsap.set(mainStrokeRef.current, { strokeDasharray: mainLen, strokeDashoffset: mainLen });
      gsap.set(branch1Ref.current, { strokeDasharray: b1Len, strokeDashoffset: b1Len });
      gsap.set(branch2Ref.current, { strokeDasharray: b2Len, strokeDashoffset: b2Len });

      strikeTl
        .set(boltRef.current, { opacity: 1 })
        .to(mainStrokeRef.current, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.in' })
        .to(branch1Ref.current, { strokeDashoffset: 0, duration: 0.22, ease: 'power1.out' }, '-=0.15')
        .to(branch2Ref.current, { strokeDashoffset: 0, duration: 0.22, ease: 'power1.out' }, '-=0.15')
        .to(headingRef.current, { filter: 'brightness(2.4)', duration: 0.1, yoyo: true, repeat: 1 }, '-=0.1')
        // Glitch beat - palette colors now (mint/steel-blue), not red/cyan
        .to(glitchARef.current, { opacity: 0.75, x: -4, duration: 0.06, ease: 'none' }, '<')
        .to(glitchBRef.current, { opacity: 0.75, x: 4, duration: 0.06, ease: 'none' }, '<')
        .to([glitchARef.current, glitchBRef.current], { opacity: 0, x: 0, duration: 0.12, ease: 'power2.out' }, '+=0.05')
        .to(boltRef.current, { opacity: 0.14, duration: 0.5 }, '+=0.3');
    }, '+=0.1');

    return () => master.kill();
  }, []);

  const preloaderRefs = { ringGroupRef, progressRingRef, leftPanelRef, rightPanelRef, hudRefs, bootLineRef };
  const heroContentRefs = {
    headingWrapRef, headingRef, glitchARef, glitchBRef, subRef, descRef, ctaRef,
    boltRef, mainStrokeRef, branch1Ref, branch2Ref,
  };

  return (
    // Background shifted from neutral black to a deep navy - matches the
    // Sailor Blue & Mint heading/lightning palette instead of clashing with it
    <div className="relative min-h-screen bg-[#050b14] overflow-hidden">
      <Starfield />
      <div className="grain-overlay" />

      <Preloader show={showPreloader} refs={preloaderRefs} />

      <Navbar />
      <HeroContent refs={heroContentRefs} />
    </div>
  );
};

export default Hero;
