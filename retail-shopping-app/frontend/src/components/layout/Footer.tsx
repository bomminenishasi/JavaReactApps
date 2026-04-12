import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-emerald-900 text-white mt-10">
    <div className="container mx-auto px-4 max-w-7xl py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-orange-400 mb-3">We're Here to Help</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/info/help-center" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/info/track-order" className="hover:text-white">Track Order</Link></li>
            <li><Link to="/info/returns" className="hover:text-white">Returns &amp; Refunds</Link></li>
            <li><Link to="/info/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-orange-400 mb-3">About SuperMarketStore</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/info/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/info/careers" className="hover:text-white">Careers</Link></li>
            <li><Link to="/info/news" className="hover:text-white">News</Link></li>
            <li><Link to="/info/investors" className="hover:text-white">Investors</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-orange-400 mb-3">Our Policies</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/info/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/info/terms" className="hover:text-white">Terms of Use</Link></li>
            <li><Link to="/info/cookies" className="hover:text-white">Cookie Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-orange-400 mb-3">SuperMarketStore+</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/info/plus" className="hover:text-white">Free Delivery</Link></li>
            <li><Link to="/info/plus" className="hover:text-white">Member Prices</Link></li>
            <li><Link to="/info/plus" className="hover:text-white">Fuel Savings</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-emerald-700 pt-4 text-center text-sm text-gray-400">
        © 2024 SuperMarketStore. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
