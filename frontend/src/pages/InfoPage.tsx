import React from 'react';
import { useParams, Link } from 'react-router-dom';

const INFO_CONTENT: Record<string, { title: string; body: string }> = {
  'help-center': {
    title: 'Help Center',
    body: 'Need help? Browse our FAQs or contact our support team 24/7 via chat, email, or phone. We\'re here to assist you with orders, returns, account issues, and more.',
  },
  'track-order': {
    title: 'Track Your Order',
    body: 'Enter your order number and email address below to get real-time tracking updates. You can also track your orders by signing into your account and visiting the Orders section.',
  },
  'returns': {
    title: 'Returns & Refunds',
    body: 'We offer free 90-day returns on most items. Simply sign into your account, go to your Orders, and select "Return Item". Refunds are processed within 3-5 business days.',
  },
  'contact': {
    title: 'Contact Us',
    body: 'Reach us at support@supermarketstore.com or call 1-800-555-0100 (Mon–Fri, 8 AM – 8 PM EST). Live chat is available 24/7 from our Help Center.',
  },
  'about': {
    title: 'About SuperMarketStore',
    body: 'SuperMarketStore is your one-stop destination for groceries, electronics, clothing, home goods, and more. We\'re committed to offering great prices, fast delivery, and an exceptional shopping experience.',
  },
  'careers': {
    title: 'Careers',
    body: 'Join our growing team! We offer competitive salaries, great benefits, and a collaborative culture. Browse open positions across technology, logistics, marketing, and retail operations.',
  },
  'news': {
    title: 'News & Press',
    body: 'Stay up to date with the latest SuperMarketStore announcements, partnerships, and community initiatives. Our press team is available at press@supermarketstore.com.',
  },
  'investors': {
    title: 'Investor Relations',
    body: 'Access quarterly earnings, annual reports, SEC filings, and investor presentations. Contact our IR team at investors@supermarketstore.com.',
  },
  'privacy': {
    title: 'Privacy Policy',
    body: 'We take your privacy seriously. We collect only the data needed to provide our services and never sell your personal information to third parties. You may request deletion of your data at any time.',
  },
  'terms': {
    title: 'Terms of Use',
    body: 'By using SuperMarketStore, you agree to our Terms of Use. These terms govern your access to and use of our website, mobile app, and services. Please read them carefully.',
  },
  'cookies': {
    title: 'Cookie Policy',
    body: 'We use cookies to enhance your browsing experience, remember preferences, and analyze site traffic. You can manage cookie preferences through your browser settings.',
  },
  'plus': {
    title: 'SuperMarketStore+',
    body: 'Unlock unlimited free delivery, exclusive member prices, and fuel savings with SuperMarketStore+. Starting at just $12.95/month or $98/year. Try free for 30 days.',
  },
};

const InfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? INFO_CONTENT[slug] : null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {content ? (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{content.title}</h1>
          <p className="text-gray-600 leading-relaxed text-lg">{content.body}</p>
          <Link to="/" className="inline-block mt-8 text-emerald-700 hover:underline font-medium">
            ← Back to Home
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <Link to="/" className="text-emerald-700 hover:underline">← Back to Home</Link>
        </>
      )}
    </div>
  );
};

export default InfoPage;
