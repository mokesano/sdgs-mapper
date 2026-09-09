/* jshint esversion: 6 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Namespace 'translation' — kamus umum (backward-compatible dengan kode lama)
import idCommon from './locales/id.json';
import enCommon from './locales/en.json';

// Namespace per halaman / komponen
import idNavbar   from './locales/id/navbar.json';
import enNavbar   from './locales/en/navbar.json';
import idFooter   from './locales/id/footer.json';
import enFooter   from './locales/en/footer.json';
import idHomepage  from './locales/id/homepage.json';
import enHomepage  from './locales/en/homepage.json';
import idDashboard    from './locales/id/dashboard.json';
import enDashboard    from './locales/en/dashboard.json';
import idResearcher   from './locales/id/researcher.json';
import enResearcher   from './locales/en/researcher.json';
import idResearchers  from './locales/id/researchers.json';
import enResearchers  from './locales/en/researchers.json';
import idArticles     from './locales/id/articles.json';
import enArticles     from './locales/en/articles.json';
import idJournals     from './locales/id/journals.json';
import enJournals     from './locales/en/journals.json';
import idInstitutions from './locales/id/institutions.json';
import enInstitutions from './locales/en/institutions.json';
import idArticleProfile     from './locales/id/article_profile.json';
import enArticleProfile     from './locales/en/article_profile.json';
import idJournalProfile     from './locales/id/journal_profile.json';
import enJournalProfile     from './locales/en/journal_profile.json';
import idInstitutionProfile from './locales/id/institution_profile.json';
import enInstitutionProfile from './locales/en/institution_profile.json';
import idMyCollections      from './locales/id/my_collections.json';
import enMyCollections      from './locales/en/my_collections.json';
import idSdgsCluster        from './locales/id/sdgs_cluster.json';
import enSdgsCluster        from './locales/en/sdgs_cluster.json';
import idAnalytics          from './locales/id/analytics.json';
import enAnalytics          from './locales/en/analytics.json';
import idTrendsAnalysis     from './locales/id/trends_analysis.json';
import enTrendsAnalysis     from './locales/en/trends_analysis.json';
import idArticleImpact      from './locales/id/article_impact.json';
import enArticleImpact      from './locales/en/article_impact.json';
import idTopResearchers     from './locales/id/top_researchers.json';
import enTopResearchers     from './locales/en/top_researchers.json';
import idResearcherDist     from './locales/id/researcher_distribution.json';
import enResearcherDist     from './locales/en/researcher_distribution.json';
import idLeaderboard        from './locales/id/leaderboard.json';
import enLeaderboard        from './locales/en/leaderboard.json';
import idBecomeSponsor      from './locales/id/become_sponsor.json';
import enBecomeSponsor      from './locales/en/become_sponsor.json';
import idSponsors           from './locales/id/sponsors.json';
import enSponsors           from './locales/en/sponsors.json';
import idPartners           from './locales/id/partners.json';
import enPartners           from './locales/en/partners.json';
import idAdminPanel         from './locales/id/admin_panel.json';
import enAdminPanel         from './locales/en/admin_panel.json';
import idChatbot            from './locales/id/chatbot.json';
import enChatbot            from './locales/en/chatbot.json';
import idCommonUi           from './locales/id/common_ui.json';
import enCommonUi           from './locales/en/common_ui.json';
import idCollaborationHub   from './locales/id/collaboration_hub.json';
import enCollaborationHub   from './locales/en/collaboration_hub.json';
import idInnovationMarket   from './locales/id/innovation_marketplace.json';
import enInnovationMarket   from './locales/en/innovation_marketplace.json';
import idProjectManagement  from './locales/id/project_management.json';
import enProjectManagement  from './locales/en/project_management.json';
import idResearchMatching   from './locales/id/research_matching.json';
import enResearchMatching   from './locales/en/research_matching.json';
import idAbout              from './locales/id/about.json';
import enAbout              from './locales/en/about.json';
import idHistory            from './locales/id/history.json';
import enHistory            from './locales/en/history.json';
import idTeams              from './locales/id/teams.json';
import enTeams              from './locales/en/teams.json';
import idTeamMember         from './locales/id/team_member.json';
import enTeamMember         from './locales/en/team_member.json';
import idAdminTeams         from './locales/id/admin_teams.json';
import enAdminTeams         from './locales/en/admin_teams.json';
import idInsightsPage       from './locales/id/insights_page.json';
import enInsightsPage       from './locales/en/insights_page.json';
import idChangePassword     from './locales/id/change_password.json';
import enChangePassword     from './locales/en/change_password.json';
import idSettings           from './locales/id/settings.json';
import enSettings           from './locales/en/settings.json';
import idAuth               from './locales/id/auth.json';
import enAuth               from './locales/en/auth.json';
import idMyActivity         from './locales/id/my_activity.json';
import enMyActivity         from './locales/en/my_activity.json';
import idNotifications      from './locales/id/notifications.json';
import enNotifications      from './locales/en/notifications.json';
import idMyStatistics       from './locales/id/my_statistics.json';
import enMyStatistics       from './locales/en/my_statistics.json';
import idMessages           from './locales/id/messages.json';
import enMessages           from './locales/en/messages.json';
import idMyArticles         from './locales/id/my_articles.json';
import enMyArticles         from './locales/en/my_articles.json';
import idDashboardPage      from './locales/id/dashboard_page.json';
import enDashboardPage      from './locales/en/dashboard_page.json';
import idMyProfile          from './locales/id/my_profile.json';
import enMyProfile          from './locales/en/my_profile.json';
import idFeeds              from './locales/id/feeds.json';
import enFeeds              from './locales/en/feeds.json';
import idTerms              from './locales/id/terms.json';
import enTerms              from './locales/en/terms.json';
import idPrivacy            from './locales/id/privacy.json';
import enPrivacy            from './locales/en/privacy.json';
import idFaq                from './locales/id/faq.json';
import enFaq                from './locales/en/faq.json';
import idHelp               from './locales/id/help.json';
import enHelp               from './locales/en/help.json';
import idSitemap            from './locales/id/sitemap.json';
import enSitemap            from './locales/en/sitemap.json';
import idSystemStatus       from './locales/id/system_status.json';
import enSystemStatus       from './locales/en/system_status.json';
import idTutorialOrcid      from './locales/id/tutorial_orcid.json';
import enTutorialOrcid      from './locales/en/tutorial_orcid.json';
import idDocsPage           from './locales/id/docs_page.json';
import enDocsPage           from './locales/en/docs_page.json';
import idLogHistory         from './locales/id/log_history.json';
import enLogHistory         from './locales/en/log_history.json';
import idTutorialDoi        from './locales/id/tutorial_doi.json';
import enTutorialDoi        from './locales/en/tutorial_doi.json';
import idTutorialResults    from './locales/id/tutorial_results.json';
import enTutorialResults    from './locales/en/tutorial_results.json';
import idTutorialExport     from './locales/id/tutorial_export.json';
import enTutorialExport     from './locales/en/tutorial_export.json';
import idSciecoDashboard    from './locales/id/scieco_dashboard.json';
import enSciecoDashboard    from './locales/en/scieco_dashboard.json';
import idCollectionDetail   from './locales/id/collection_detail.json';
import enCollectionDetail   from './locales/en/collection_detail.json';
import idContact            from './locales/id/contact.json';
import enContact            from './locales/en/contact.json';
import idAdmin              from './locales/id/admin.json';
import enAdmin              from './locales/en/admin.json';
import idMonitoring         from './locales/id/monitoring.json';
import enMonitoring         from './locales/en/monitoring.json';
import idDoc                from './locales/id/doc.json';
import enDoc                from './locales/en/doc.json';
import idApi                from './locales/id/api.json';
import enApi                from './locales/en/api.json';

// ─── Deteksi bahasa awal ─────────────────────────────────────────────
// Prioritas: (1) preferensi tersimpan user → (2) bahasa browser →
// (3) default 'id'. Bahasa harus salah satu dari ['id', 'en'].
const SUPPORTED = ['id', 'en'];

const detectLang = () => {
  const saved = localStorage.getItem('sciecola_lang');
  if (saved && SUPPORTED.includes(saved)) return saved;

  const browser = (navigator.language || navigator.userLanguage || '')
    .split('-')[0]
    .toLowerCase();
  return SUPPORTED.includes(browser) ? browser : 'id';
};

// ─── Inisialisasi i18next ─────────────────────────────────────────────
i18n
  .use(initReactI18next)
  .init({
    resources: {
      id: {
        translation: idCommon,   // namespace default — kode lama tetap bekerja
        navbar:      idNavbar,
        footer:      idFooter,
        homepage:    idHomepage,
        dashboard:   idDashboard,
        researcher:  idResearcher,
        researchers: idResearchers,
        articles:    idArticles,
        journals:    idJournals,
        admin_panel:            idAdminPanel,
        chatbot:                idChatbot,
        common_ui:              idCommonUi,
        research_matching:   idResearchMatching,
        collaboration_hub:      idCollaborationHub,
        innovation_marketplace: idInnovationMarket,
        project_management:     idProjectManagement,
        institutions: idInstitutions,
        article_profile:     idArticleProfile,
        journal_profile:     idJournalProfile,
        institution_profile: idInstitutionProfile,
        my_collections:      idMyCollections,
        sdgs_cluster:        idSdgsCluster,
        analytics:           idAnalytics,
        trends_analysis:     idTrendsAnalysis,
        article_impact:      idArticleImpact,
        top_researchers:         idTopResearchers,
        researcher_distribution: idResearcherDist,
        leaderboard:             idLeaderboard,
        become_sponsor:          idBecomeSponsor,
        sponsors:                idSponsors,
        partners:                idPartners,
        about:                   idAbout,
        history:                 idHistory,
        teams:                   idTeams,
        team_member:             idTeamMember,
        admin_teams:             idAdminTeams,
        insights_page:           idInsightsPage,
        change_password:         idChangePassword,
        settings:                idSettings,
        auth:                    idAuth,
        my_activity:             idMyActivity,
        notifications:           idNotifications,
        my_statistics:           idMyStatistics,
        messages:                idMessages,
        my_articles:             idMyArticles,
        dashboard_page:          idDashboardPage,
        my_profile:              idMyProfile,
        feeds:                   idFeeds,
        terms:                   idTerms,
        privacy:                 idPrivacy,
        faq:                     idFaq,
        help:                    idHelp,
        sitemap:                 idSitemap,
        system_status:           idSystemStatus,
        tutorial_orcid:          idTutorialOrcid,
        docs_page:               idDocsPage,
        log_history:             idLogHistory,
        tutorial_doi:            idTutorialDoi,
        tutorial_results:        idTutorialResults,
        tutorial_export:         idTutorialExport,
        scieco_dashboard:        idSciecoDashboard,
        collection_detail:       idCollectionDetail,
        contact:                 idContact,
        admin:                   idAdmin,
        monitoring:              idMonitoring,
        doc:                     idDoc,
        api:                     idApi,
      },
      en: {
        translation: enCommon,
        navbar:      enNavbar,
        footer:      enFooter,
        homepage:    enHomepage,
        dashboard:   enDashboard,
        researcher:  enResearcher,
        researchers: enResearchers,
        articles:    enArticles,
        journals:    enJournals,
        admin_panel:            enAdminPanel,
        chatbot:                enChatbot,
        common_ui:              enCommonUi,
        research_matching:   enResearchMatching,
        collaboration_hub:      enCollaborationHub,
        innovation_marketplace: enInnovationMarket,
        project_management:     enProjectManagement,
        institutions: enInstitutions,
        article_profile:     enArticleProfile,
        journal_profile:     enJournalProfile,
        institution_profile: enInstitutionProfile,
        my_collections:      enMyCollections,
        sdgs_cluster:        enSdgsCluster,
        analytics:           enAnalytics,
        trends_analysis:     enTrendsAnalysis,
        article_impact:      enArticleImpact,
        top_researchers:         enTopResearchers,
        researcher_distribution: enResearcherDist,
        leaderboard:             enLeaderboard,
        become_sponsor:          enBecomeSponsor,
        sponsors:                enSponsors,
        partners:                enPartners,
        about:                   enAbout,
        history:                 enHistory,
        teams:                   enTeams,
        team_member:             enTeamMember,
        admin_teams:             enAdminTeams,
        insights_page:           enInsightsPage,
        change_password:         enChangePassword,
        settings:                enSettings,
        auth:                    enAuth,
        my_activity:             enMyActivity,
        notifications:           enNotifications,
        my_statistics:           enMyStatistics,
        messages:                enMessages,
        my_articles:             enMyArticles,
        dashboard_page:          enDashboardPage,
        my_profile:              enMyProfile,
        feeds:                   enFeeds,
        terms:                   enTerms,
        privacy:                 enPrivacy,
        faq:                     enFaq,
        help:                    enHelp,
        sitemap:                 enSitemap,
        system_status:           enSystemStatus,
        tutorial_orcid:          enTutorialOrcid,
        docs_page:               enDocsPage,
        log_history:             enLogHistory,
        tutorial_doi:            enTutorialDoi,
        tutorial_results:        enTutorialResults,
        tutorial_export:         enTutorialExport,
        scieco_dashboard:        enSciecoDashboard,
        collection_detail:       enCollectionDetail,
        contact:                 enContact,
        admin:                   enAdmin,
        monitoring:              enMonitoring,
        doc:                     enDoc,
        api:                     enApi,
      },
    },
    lng:         detectLang(),
    fallbackLng: 'id',
    defaultNS:   'translation',
    ns:          ['translation', 'navbar', 'footer', 'homepage', 'dashboard', 'researcher', 'researchers', 'articles', 'journals', 'institutions', 'article_profile', 'journal_profile', 'institution_profile', 'my_collections', 'sdgs_cluster', 'analytics', 'trends_analysis', 'article_impact', 'top_researchers', 'researcher_distribution', 'leaderboard', 'become_sponsor', 'sponsors', 'partners', 'about', 'history', 'teams', 'team_member', 'admin_teams', 'insights_page', 'change_password', 'settings', 'auth', 'my_activity', 'notifications', 'my_statistics', 'messages', 'my_articles', 'dashboard_page', 'my_profile', 'feeds', 'terms', 'privacy', 'faq', 'help', 'sitemap', 'system_status', 'tutorial_orcid', 'docs_page', 'log_history', 'tutorial_doi', 'tutorial_results', 'tutorial_export', 'scieco_dashboard', 'collection_detail', 'contact', 'admin', 'monitoring', 'doc', 'api', 'research_matching', 'collaboration_hub', 'innovation_marketplace', 'project_management', 'common_ui', 'chatbot', 'admin_panel'],
    interpolation: { escapeValue: false },
  });

export default i18n;
