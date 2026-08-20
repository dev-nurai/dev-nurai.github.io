import React, { useEffect, useRef, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import styled, { createGlobalStyle } from 'styled-components';
import { Helmet } from 'react-helmet';
import { Head } from '@components';
import { email, socialMedia } from '@config';
import { usePrefersReducedMotion } from '@hooks';

const github = socialMedia.find(s => s.name === 'GitHub').url;
const linkedin = socialMedia.find(s => s.name === 'Linkedin').url;

const STACK_GROUPS = [
  { label: 'CORE', items: ['C#', '.NET Core', 'EF Core / Dapper', 'MS SQL Server'] },
  { label: 'INTERFACE', items: ['TypeScript', 'React', 'Angular'] },
  { label: 'PLATFORM & AI', items: ['AWS', 'OpenAI APIs', 'LangChain', 'AI agents'] },
];

const NOW_ITEMS = [
  {
    tag: 'BUILDING',
    text: 'Medical-data services at OSP Labs — interoperability, audit trails, and uptime that clinicians never have to think about.',
  },
  {
    tag: 'LEARNING',
    text: 'Applied LLMs: retrieval and agent patterns that survive contact with regulated data.',
  },
  {
    tag: 'OFF-SCREEN',
    text: 'Cricket, and travel that puts a few time zones between me and a terminal.',
  },
];

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #0a0c0b; --panel: #0f1211; --line: #1e2422; --fg: #e4e8e6; --dim: #9aa5a1; --faint: #5c6663;
    --accent: oklch(0.74 0.11 176); --accent-soft: oklch(0.74 0.11 176 / 0.13);
  }
  :root[data-theme="light"] {
    --bg: #f6f5f2; --panel: #ffffff; --line: #e2e0d9; --fg: #14181a; --dim: #5c6360; --faint: #9aa09d;
    --accent: oklch(0.52 0.10 176); --accent-soft: oklch(0.52 0.10 176 / 0.10);
  }
  #dc-root, #dc-root * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); }
  #dc-root {
    min-height: 100vh; background: var(--bg); color: var(--fg); font-size: 15px; line-height: 1.65;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    -webkit-font-smoothing: antialiased;
    text-wrap: pretty;
  }
  #dc-root a { color: var(--accent); text-decoration: none; }
  #dc-root a:hover { color: var(--fg); text-decoration: underline; text-underline-offset: 3px; }
  #dc-root img, #dc-root svg { max-width: 100%; }
  html { scroll-behavior: smooth; scroll-padding-top: 72px; }
  @keyframes dc-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

  @media (max-width: 860px) {
    #about { grid-template-columns: 1fr !important; gap: 36px !important; }
    #work > div:last-of-type { grid-template-columns: 1fr !important; gap: 24px !important; }
    #work-tabs { flex-direction: row !important; overflow-x: auto; border-left: 0 !important; border-bottom: 1px solid var(--line) !important; scrollbar-width: none; }
    #work-tabs button { border-left: 0 !important; border-bottom: 2px solid transparent; margin-left: 0 !important; white-space: nowrap; }
    #about-media { flex-direction: row !important; flex-wrap: wrap; }
    #about-media > div:first-child { flex: 1 1 200px; aspect-ratio: 1/1 !important; }
    #about-media > div:last-child { flex: 1 1 240px; }
    #work-tabs button[data-active="1"] { border-bottom-color: var(--accent) !important; }
    #dc-root section { padding-top: 58px !important; padding-bottom: 58px !important; }
    #top > section:first-of-type { padding-top: 64px !important; }
  }
  @media (max-width: 680px) {
    #site-nav { display: none !important; }
    #theme-toggle { margin-left: auto; }
    #dc-root section { padding-left: 0; padding-right: 0; }
    #about-media { flex-direction: column !important; }
    #about-media > div:first-child { aspect-ratio: 4/5 !important; }
  }
`;

const Logo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-label="nurai.dev" style={{ flex: 'none', display: 'block' }}>
    <path d="M4 28 L4 12 L20 28 L20 12" stroke="currentColor" strokeWidth="3.8" fill="none" strokeLinecap="square" />
    <path d="M24 20 h3 l3 -7 l3 14 l3 -7 h2" stroke="var(--accent)" strokeWidth="2.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const HeaderBar = styled.header`
  position: sticky; top: 0; z-index: 20; display: flex; align-items: center;
  gap: clamp(10px, 3vw, 24px); padding: 0 clamp(16px, 4vw, 28px); height: 56px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px); border-bottom: 1px solid var(--line);
`;

const LogoLink = styled.a`
  display: flex; align-items: center; gap: 9px; color: var(--fg) !important;
  font-weight: 500; letter-spacing: -0.035em; font-size: 15px;
  &:hover { text-decoration: none !important; }
`;

const SiteNav = styled.nav`
  display: flex; gap: 22px; margin-left: auto; font-size: 12.5px; color: var(--dim);
  a { color: var(--dim); }
`;

const ThemeToggle = styled.button`
  display: flex; align-items: center; gap: 8px; background: transparent;
  border: 1px solid var(--line); color: var(--dim); font-family: inherit;
  font-size: 11.5px; padding: 6px 10px; cursor: pointer; letter-spacing: 0.08em;
  &:hover { border-color: var(--accent); color: var(--fg); }
`;

const ResumeLink = styled.a`
  border: 1px solid var(--accent); color: var(--accent); font-size: 11.5px;
  padding: 6px 12px; letter-spacing: 0.08em;
  &:hover { background: var(--accent-soft); text-decoration: none; }
`;

const Wrap = styled.div`
  max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 28px);
`;

const HeroSection = styled.section`
  padding: 96px 0 84px; border-bottom: 1px solid var(--line);
`;

const HeroTag = styled.div`
  display: flex; align-items: center; gap: 10px; color: var(--accent);
  font-size: 12.5px; letter-spacing: 0.14em;
`;

const Cursor = styled.span`
  display: inline-block; width: 8px; height: 15px; background: var(--accent);
  animation: dc-blink 1.1s steps(1) infinite;
`;

const H1 = styled.h1`
  margin: 26px 0 0; font-size: clamp(40px, 8vw, 86px); line-height: 0.98;
  font-weight: 700; letter-spacing: -0.045em;
`;

const Subtitle = styled.p`
  margin: 18px 0 0; font-size: clamp(18px, 2.6vw, 27px); line-height: 1.35;
  color: var(--dim); max-width: 20ch; font-weight: 300;
`;

const Lead = styled.p`
  margin: 30px 0 0; max-width: 62ch; color: var(--dim); font-size: 14.5px;
`;

const ButtonRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px;
`;

const AccentBtn = styled.a`
  border: 1px solid var(--accent); color: var(--accent); padding: 12px 20px;
  font-size: 13px; letter-spacing: 0.06em;
  &:hover { background: var(--accent-soft); text-decoration: none; }
`;

const GhostBtn = styled.a`
  border: 1px solid var(--line); color: var(--dim); padding: 12px 20px;
  font-size: 13px; letter-spacing: 0.06em;
  &:hover { border-color: var(--fg); color: var(--fg); text-decoration: none; }
`;

const SectionHeadRow = styled.div`
  display: flex; align-items: baseline; gap: 14px; margin-bottom: 28px;
`;

const SectionNum = styled.span`
  color: var(--accent); font-size: 12.5px;
`;

const SectionTitle = styled.h2`
  margin: 0; font-size: 15px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;
`;

const SectionLine = styled.span`
  flex: 1; height: 1px; background: var(--line);
`;

const SectionHead = ({ num, title }) => (
  <SectionHeadRow>
    <SectionNum>{num}</SectionNum>
    <SectionTitle>{title}</SectionTitle>
    <SectionLine />
  </SectionHeadRow>
);

const AboutSection = styled.section`
  display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 56px;
  padding: 80px 0; border-bottom: 1px solid var(--line);
`;

const AboutText = styled.div`
  p { margin: 0 0 18px; color: var(--dim); font-size: 14.5px; }
  p:last-child { margin-bottom: 0; }
`;

const AboutMedia = styled.div`
  display: flex; flex-direction: column; gap: 14px;
`;

const PhotoFrame = styled.div`
  aspect-ratio: 4 / 5; border: 1px solid var(--line); overflow: hidden;
  .gatsby-image-wrapper { width: 100%; height: 100%; }
`;

const InfoCard = styled.div`
  border: 1px solid var(--line); padding: 16px 18px;
`;

const InfoLabel = styled.div`
  font-size: 11px; color: var(--faint); letter-spacing: 0.12em; margin-bottom: 10px;
`;

const InfoDivider = styled.div`
  height: 1px; background: var(--line); margin: 14px 0;
`;

const WorkSection = styled.section`
  padding: 80px 0; border-bottom: 1px solid var(--line);
`;

const WorkGrid = styled.div`
  display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 40px;
`;

const Tabs = styled.div`
  display: flex; flex-direction: column; border-left: 1px solid var(--line);
`;

const TabBtn = styled.button`
  background: transparent; font-family: inherit; text-align: left; cursor: pointer;
  padding: 12px 16px; font-size: 13px; letter-spacing: 0.04em; border: 0;
  margin-left: -1px;
  border-left: 2px solid ${p => (p.$active ? 'var(--accent)' : 'transparent')};
  color: ${p => (p.$active ? 'var(--accent)' : 'var(--dim)')};
`;

const RoleHeading = styled.h3`
  margin: 0; font-size: 20px; font-weight: 500; letter-spacing: -0.01em;
  span { color: var(--accent); }
`;

const Period = styled.div`
  margin: 10px 0 24px; font-size: 12px; color: var(--faint); letter-spacing: 0.1em;
`;

const JobBullets = styled.div`
  ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px; }
  li { display: grid; grid-template-columns: 22px 1fr; color: var(--dim); font-size: 14.5px; }
  li::before { content: '▸'; color: var(--accent); }
`;

const StackSection = styled.section`
  padding: 80px 0; border-bottom: 1px solid var(--line);
`;

const StackGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1px;
  background: var(--line); border: 1px solid var(--line);
`;

const StackGroupBox = styled.div`
  background: var(--bg); padding: 22px 20px;
`;

const StackLabel = styled.div`
  font-size: 11px; color: var(--faint); letter-spacing: 0.14em; margin-bottom: 14px;
`;

const StackChips = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;

const Chip = styled.span`
  border: 1px solid var(--line); padding: 5px 10px; font-size: 12.5px; color: var(--dim);
`;

const NowSection = styled.section`
  padding: 80px 0; border-bottom: 1px solid var(--line);
`;

const NowGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px;
`;

const NowCard = styled.div`
  border-top: 1px solid var(--line); padding-top: 16px;
`;

const NowTag = styled.div`
  font-size: 12px; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 10px;
`;

const NowText = styled.div`
  font-size: 14.5px; color: var(--dim);
`;

const ContactSection = styled.section`
  padding: 104px 0 96px; text-align: center;
`;

const ContactEyebrow = styled.div`
  font-size: 12.5px; color: var(--accent); letter-spacing: 0.14em;
`;

const ContactH2 = styled.h2`
  margin: 22px 0 0; font-size: clamp(32px, 6vw, 58px); font-weight: 700; letter-spacing: -0.04em;
`;

const ContactP = styled.p`
  margin: 18px auto 0; max-width: 52ch; color: var(--dim); font-size: 14.5px;
`;

const SayHelloBtn = styled.a`
  display: inline-block; margin-top: 34px; border: 1px solid var(--accent);
  color: var(--accent); padding: 16px 34px; font-size: 14px; letter-spacing: 0.08em;
  &:hover { background: var(--accent-soft); text-decoration: none; }
`;

const FooterBar = styled.footer`
  border-top: 1px solid var(--line); padding: 22px 28px; display: flex; flex-wrap: wrap;
  gap: 16px; justify-content: space-between; font-size: 11.5px; color: var(--faint); letter-spacing: 0.08em;
`;

const FooterBrand = styled.span`
  display: flex; align-items: center; gap: 9px;
`;

const NAV_ITEMS = [
  { href: '#about', label: '01 about' },
  { href: '#work', label: '02 work' },
  { href: '#stack', label: '03 stack' },
  { href: '#now', label: '04 now' },
  { href: '#contact', label: '05 contact' },
];

const useRevealOnScroll = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return undefined;

    nodes.forEach(n => {
      n.style.opacity = '0';
      n.style.transform = 'translateY(16px)';
      n.style.transition = 'opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1)';
    });

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '-8% 0px -8% 0px' },
    );
    nodes.forEach(n => io.observe(n));

    return () => io.disconnect();
  }, [prefersReducedMotion]);
};

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              company
              range
            }
            html
          }
        }
      }
    }
  `);
  const jobs = data.jobs.edges;

  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('dark');
  const mounted = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('nurai-theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    setTheme(saved);
    mounted.current = true;
  }, []);

  useRevealOnScroll();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('nurai-theme', next);
    setTheme(next);
  };

  const activeJob = jobs[activeTab]?.node;

  return (
    <>
      <Head />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <GlobalStyle />

      <div id="dc-root">
        <HeaderBar>
          <LogoLink href="#top">
            <Logo />
            <span>
              nurai<span style={{ color: 'var(--faint)' }}>.dev</span>
            </span>
          </LogoLink>
          <SiteNav id="site-nav">
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </SiteNav>
          <ThemeToggle id="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '◐ LIGHT' : '◑ DARK'}
          </ThemeToggle>
          <ResumeLink href="/Nurai_Resume_v3.pdf" target="_blank" rel="noopener noreferrer">
            RESUME ↓
          </ResumeLink>
        </HeaderBar>

        <Wrap id="top">
          <HeroSection>
            <HeroTag>
              <span>$ whoami</span>
              <Cursor />
            </HeroTag>
            <H1>Nurai Khan</H1>
            <Subtitle>Software engineer for health tech that can&apos;t afford to fail.</Subtitle>
            <Lead>
              I build the backend of US healthcare software at{' '}
              <a href="https://www.osplabs.com/">OSP Labs</a> — RESTful services moving medical
              data under HIPAA, with interoperability and audit trails as design constraints, not
              afterthoughts. Lately I&apos;m wiring LLMs into those workflows without loosening
              any of it.
            </Lead>
            <ButtonRow>
              <AccentBtn href={`mailto:${email}`}>{email}</AccentBtn>
              <GhostBtn href={github}>GitHub</GhostBtn>
              <GhostBtn href={linkedin}>LinkedIn</GhostBtn>
            </ButtonRow>
          </HeroSection>

          <AboutSection id="about" data-reveal="1">
            <div>
              <SectionHead num="01" title="About" />
              <AboutText>
                <p>
                  I&apos;m a curious problem-solver with hands-on experience engineering backend
                  systems, integrating third-party APIs, and shipping full-stack features that
                  hold up under pressure.
                </p>
                <p>
                  At OSP Labs I work on mission-critical health tech — designing for HIPAA
                  compliance, interoperability, and reliable data workflows that clinicians and
                  patients depend on. Before that, at{' '}
                  <a href="https://binateit.com/">Binate IT Services</a>, I built and shipped
                  Razorpay payment integration, email/SMS automation, and modular codebases for
                  products like Saawree and Real Bet.
                </p>
                <p>
                  Right now I&apos;m exploring AI in software development — OpenAI APIs,
                  LangChain, agents — to build context-aware systems that streamline workflows and
                  surface insight inside healthcare and transactional platforms.
                </p>
                <p>Off-screen: cricket and travel. Both send me back to the keyboard with a clearer head.</p>
              </AboutText>
            </div>
            <AboutMedia id="about-media">
              <PhotoFrame>
                <StaticImage
                  src="../images/selfie.jpeg"
                  alt="Nurai Khan"
                  layout="fullWidth"
                  aspectRatio={4 / 5}
                  objectFit="cover"
                />
              </PhotoFrame>
              <InfoCard>
                <InfoLabel>BASED IN</InfoLabel>
                <div style={{ fontSize: '14px' }}>India · remote-friendly</div>
                <InfoDivider />
                <InfoLabel>FOCUS</InfoLabel>
                <div style={{ fontSize: '14px', color: 'var(--dim)' }}>
                  Healthcare platforms, .NET services, applied LLMs
                </div>
              </InfoCard>
            </AboutMedia>
          </AboutSection>

          <WorkSection id="work" data-reveal="1">
            <SectionHead num="02" title="Where I've worked" />
            <WorkGrid>
              <Tabs id="work-tabs">
                {jobs.map(({ node }, i) => (
                  <TabBtn
                    key={node.frontmatter.company}
                    $active={i === activeTab}
                    data-active={i === activeTab ? '1' : '0'}
                    onClick={() => setActiveTab(i)}>
                    {node.frontmatter.company}
                  </TabBtn>
                ))}
              </Tabs>
              {activeJob && (
                <div>
                  <RoleHeading>
                    {activeJob.frontmatter.title} <span>@ {activeJob.frontmatter.company}</span>
                  </RoleHeading>
                  <Period>{activeJob.frontmatter.range.toUpperCase()}</Period>
                  <JobBullets dangerouslySetInnerHTML={{ __html: activeJob.html }} />
                </div>
              )}
            </WorkGrid>
          </WorkSection>

          <StackSection id="stack" data-reveal="1">
            <SectionHead num="03" title="Stack" />
            <StackGrid>
              {STACK_GROUPS.map(g => (
                <StackGroupBox key={g.label}>
                  <StackLabel>{g.label}</StackLabel>
                  <StackChips>
                    {g.items.map(it => (
                      <Chip key={it}>{it}</Chip>
                    ))}
                  </StackChips>
                </StackGroupBox>
              ))}
            </StackGrid>
          </StackSection>

          <NowSection id="now" data-reveal="1">
            <SectionHead num="04" title="Now" />
            <NowGrid>
              {NOW_ITEMS.map(n => (
                <NowCard key={n.tag}>
                  <NowTag>{n.tag}</NowTag>
                  <NowText>{n.text}</NowText>
                </NowCard>
              ))}
            </NowGrid>
          </NowSection>

          <ContactSection id="contact" data-reveal="1">
            <ContactEyebrow>05 — WHAT&apos;S NEXT</ContactEyebrow>
            <ContactH2>Get in touch</ContactH2>
            <ContactP>
              I&apos;m not actively looking, but my inbox is always open — a question, a
              healthcare-AI problem, or just hi. I&apos;ll get back to you.
            </ContactP>
            <SayHelloBtn href={`mailto:${email}`}>$ say hello</SayHelloBtn>
          </ContactSection>
        </Wrap>

        <FooterBar>
          <FooterBrand>
            <Logo size={15} />
            nurai.dev — designed &amp; built by Nurai Khan
          </FooterBrand>
          <span>{email}</span>
        </FooterBar>
      </div>
    </>
  );
};

export default IndexPage;
