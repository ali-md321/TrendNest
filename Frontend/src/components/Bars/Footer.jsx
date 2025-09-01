// Footer.js
import React from 'react';
import { Facebook, Instagram, LinkedIn, Twitter } from '@mui/icons-material';

const FooterSection = ({ title, items, isAddress = false }) => {
  return (
    <div className="group min-w-[200px]">
      <div className="text-gray-300 text-sm leading-relaxed">
        <h3 className="font-bold text-lg text-white mb-6 flex items-center justify-center md:justify-start gap-3">
          <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {title}
          </span>
        </h3>
        
        <div className="text-center md:text-left">
          {isAddress ? (
            <div className="space-y-2">
              {items.map((line, index) =>
                line.includes('@') ? (
                  <a
                    key={index}
                    href={`mailto:${line}`}
                    className="block hover:text-blue-400 transition-all duration-300 hover:scale-105 transform"
                  >
                    {line}
                  </a>
                ) : (
                  <p key={index} className="hover:text-white transition-all duration-300 hover:scale-105 transform">
                    {line}
                  </p>
                )
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li key={index} className="transform hover:scale-105 transition-all duration-300">
                  {typeof item === 'object' ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm cursor-pointer inline-block relative group/link"
                    >
                      <span className="relative">
                        {item.name}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-500 group-hover/link:w-full transition-all duration-300"></span>
                      </span>
                    </a>
                  ) : (
                    <span className="text-gray-300 hover:text-white transition-all duration-300 text-sm cursor-pointer inline-block relative group/link">
                      <span className="relative">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-pink-500 group-hover/link:w-full transition-all duration-300"></span>
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialIcons = () => {
  const socialLinks = [
    { icon: Facebook, color: "hover:text-blue-500", name: "Facebook", link: "https://www.facebook.com" },
    { icon: Twitter, color: "hover:text-sky-400", name: "Twitter", link: "https://x.com/Md_Ali_Rocky" },
    { icon: Instagram, color: "hover:text-pink-500", name: "Instagram", link: "https://www.instagram.com/ali_md321/" },
    { icon: LinkedIn, color: "hover:text-indigo-500", name: "LinkedIn", link: "https://www.linkedin.com/in/iluru-mohammad-ali/" },
  ];

  return (
    <div className="flex justify-center space-x-4">
      {socialLinks.map(({ icon: Icon, color, name, link }) => (
        <a href={link} target="_blank" rel="noopener noreferrer" key={name} className="group relative">
          <div className="p-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-110 hover:rotate-6 shadow-lg hover:shadow-xl border border-gray-700 hover:border-gray-600">
            <Icon className={`text-gray-300 ${color} transition-all duration-300`} fontSize="small" />
          </div>
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-700">
            {name}
          </div>
        </a>
      ))}
    </div>
  );
};

const FooterBottom = () => {
  return (
    <div className="border-t border-gray-700/50 pt-8 mt-12 relative">
      {/* Gradient line effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="flex flex-col items-center gap-6">
        {/* Copyright and Help Center - Always Centered */}
        <div className="text-gray-400 text-sm text-center">
          <span className="text-white font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text ">
            &copy; 2025 TrendNest
          </span>
          <span className="mx-3 text-gray-600">•</span>
          <a
            href="/chat"
            className="text-amber-200 hover:text-amber-300 transition-all duration-300 relative group inline-block"
          >
            Help Center
            <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-amber-400 to-amber-500 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>
        
        {/* Social Icons - Always Centered */}
        <SocialIcons />
      </div>
    </div>
  );
};

const Footer = () => {
  const footerSections = [
    { title: 'ABOUT', items: [{name :'About Us',href:"/about"}] },
    {
      title: 'RELATED WEBSITES',
      items: [{ name: 'Momentum', href: 'https://momentum-app-1jtb.onrender.com/' }, { name: 'WanderLust', href: 'https://wanderlust-mwb2.onrender.com/' }],
    },
    {
      title: 'Mail Us:',
      items: [
        'TrendNest Pvt Ltd,',
        'RK Valley, Idupulapaya,',
        'Kadapa, Andhra Pradesh, India - 516001',
        'trendnest@support.com',
      ],
      isAddress: true,
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full blur-3xl transform -translate-x-48 -translate-y-48 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-3xl transform translate-x-48 translate-y-48 animate-pulse"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Main Top Grid - Centered on <md, Left-aligned on >md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mb-12 place-items-center md:place-items-start">
          {footerSections.map((section) => (
            <FooterSection
              key={section.title}
              title={section.title}
              items={section.items}
              isAddress={section.isAddress}
            />
          ))}
        </div>

        {/* Bottom Bar - Always Centered */}
        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;