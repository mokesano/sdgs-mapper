import React, { Component } from 'react';
import { Link } from 'react-router';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error ke console atau service monitoring
    console.error('Error caught by boundary:', error, errorInfo);

    // Di production, Anda bisa mengirim error ke service monitoring
    if (process.env.NODE_ENV === 'production') {
      // Contoh: kirim ke API monitoring
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ error: error.message, stack: errorInfo.componentStack })
      // });
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl w-full">
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                  {t('error.oops')}
                </h1>
                <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"></div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('error.title')}
              </h2>
              <p className="text-gray-600">
                {t('error.component')}
              </p>
            </div>

            {/* Error Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex items-start space-x-3 mb-4">
                <svg
                  className="w-6 h-6 text-red-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('error.detail')}</h3>
                  {this.state.error && (
                    <p className="text-[15px] text-red-600 font-mono bg-red-50 p-2 rounded">
                      {this.state.error.toString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Component Stack (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-[15px] font-medium text-gray-700 hover:text-gray-900">
                    {t('error.stack')}
                  </summary>
                  <pre className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-48">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.resetErrorBoundary}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t('error.retry')}
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {t('error.home')}
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {t('error.support')}
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-[15px] text-gray-500">
                Jika masalah berlanjut, silakan hubungi tim support dengan menyertakan detail error di atas.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation('common_ui')(ErrorBoundary);