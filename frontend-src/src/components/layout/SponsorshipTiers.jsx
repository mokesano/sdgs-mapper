import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconStar, IconAcademic, IconBriefcase, IconUsers } from '../shared/icons';

const SponsorshipTiers = ({ onSelectTier, selectedTier }) => {
  const { t } = useTranslation('common_ui');
  // Data tiers
  const tiers = [
    {
      id: 'platinum',
      name: 'Platinum',
      price: 'Custom',
      description: 'Kemitraan strategis dengan visibilitas maksimal dan akses eksklusif.',
      features: [
        'Logo di header platform (semua halaman)',
        'Dashboard analitik premium dengan custom metrics',
        'Co-branding webinar & event (4x/tahun)',
        'Priority feature requests & roadmap input',
        'Dedicated account manager & technical support',
        'Quarterly impact report dengan executive summary',
        'Early access ke fitur beta & research insights'
      ],
      highlight: true,
      icon: 'diamond',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-400',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 'Custom',
      description: 'Visibilitas tinggi dengan manfaat analitik dan kolaborasi konten.',
      features: [
        'Logo di halaman sponsor & footer',
        'Akses dashboard analitik dasar',
        'Mention di newsletter bulanan (2x/tahun)',
        'Quarterly impact report standar',
        'Akses ke publikasi riset eksklusif',
        'Priority email support'
      ],
      highlight: false,
      icon: 'gold',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-400',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      id: 'silver',
      name: 'Silver',
      price: 'Custom',
      description: 'Dukungan berkelanjutan dengan visibilitas yang terukur.',
      features: [
        'Logo di halaman sponsor',
        'Mention di laporan tahunan',
        'Akses ke publikasi riset publik',
        'Sertifikat kemitraan digital',
        'Update newsletter bulanan'
      ],
      highlight: false,
      icon: 'silver',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'Custom',
      description: 'Entry-level sponsorship untuk organisasi yang baru memulai.',
      features: [
        'Logo di halaman sponsor',
        'Sertifikat kemitraan',
        'Update newsletter bulanan',
        'Akses ke resource publik'
      ],
      highlight: false,
      icon: 'bronze',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      buttonColor: 'bg-amber-600 hover:bg-amber-700'
    }
  ];

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('sponsorship.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Pilih tingkat kemitraan yang sesuai dengan visi organisasi Anda. 
          Semua tier mencakup akses ke platform Wizdam dan laporan impact triwulanan.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div 
            key={tier.id} 
            className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg relative flex flex-col ${
              selectedTier === tier.id 
                ? 'border-indigo-600 ring-2 ring-indigo-200' 
                : tier.highlight 
                  ? 'border-indigo-600 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Most Popular Badge */}
            {tier.highlight && selectedTier !== tier.id && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-full shadow">
                {t('sponsorship.popular')}
              </span>
            )}
            
            {/* Selected Badge */}
            {selectedTier === tier.id && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full shadow flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                {t('sponsorship.selected')}
              </span>
            )}
            
            {/* Icon & Header */}
            <div className={`w-14 h-14 ${tier.bgColor} rounded-xl mb-4 flex items-center justify-center text-indigo-600`}>
              {tier.icon === 'diamond' && <IconAcademic  className="w-7 h-7" />}
              {tier.icon === 'gold'    && <IconStar      className="w-7 h-7 text-yellow-600" />}
              {tier.icon === 'silver'  && <IconBriefcase className="w-7 h-7 text-gray-600" />}
              {tier.icon === 'bronze'  && <IconUsers     className="w-7 h-7 text-amber-700" />}
            </div>
            
            <h3 className={`font-bold text-lg mb-1 ${selectedTier === tier.id ? 'text-indigo-600' : 'text-gray-900'}`}>
              {tier.name}
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">{tier.price}</p>
            <p className="text-[15px] text-gray-600 mb-4 flex-grow">{tier.description}</p>
            
            {/* Features List */}
            <ul className="space-y-2 mb-6">
              {tier.features.slice(0, 4).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
              {tier.features.length > 4 && (
                <li className="text-sm text-indigo-600 font-medium">
                  +{tier.features.length - 4} manfaat lainnya
                </li>
              )}
            </ul>
            
            {/* Action Button */}
            <button
              onClick={() => onSelectTier(tier.id)}
              disabled={selectedTier === tier.id}
              className={`w-full py-2.5 rounded-xl font-medium text-[15px] text-white transition-colors flex items-center justify-center gap-2 ${
                selectedTier === tier.id 
                  ? 'bg-green-600 cursor-default' 
                  : tier.buttonColor
              }`}
            >
              {selectedTier === tier.id ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {t('sponsorship.selected')}
                </>
              ) : (
                <>
                  {t('sponsorship.choose')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {/* Helper Text */}
      <p className="text-center text-[15px] text-gray-500 mt-6">
        {t('sponsorship.custom_prefix')}{' '}
        <a href="/contact" className="text-indigo-600 hover:underline font-medium">{t('sponsorship.custom_link')}</a>{' '}
        {t('sponsorship.custom_suffix')}
      </p>
    </section>
  );
};

export default SponsorshipTiers;