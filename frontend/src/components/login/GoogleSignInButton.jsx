// GoogleSignInButton.jsx
import { useState } from 'react';

export function GoogleSignInButton({ onClick, isLoading: parentLoading, mode = 'signin' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async (e) => {
    e.preventDefault();
    if (isLoading || parentLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onClick();
    } catch (err) {
      console.error('Google Sign-In error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to authenticate with Google';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';
  const loadingText = mode === 'signup' ? 'Signing up...' : 'Signing in...';

  return (
    <div className="w-full">
      <button
        type="button"
        className={`btn btn-outline w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 gap-2 ${
          (isLoading || parentLoading) ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        onClick={handleClick}
        disabled={isLoading || parentLoading}
        aria-label={buttonText}
      >
        {(isLoading || parentLoading) ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            {loadingText}
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path
                  fill="#4285F4"
                  d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.229 -9.21652 56.479 -10.2543 57.329 L -10.2543 60.688 L -6.02321 60.688 C -3.54098 58.429 -2.50301 55.228 -2.50301 51.509 C -2.50278 51.509 -3.264 51.509 -3.264 51.509 Z"
                />
                <path
                  fill="#34A853"
                  d="M -14.754 63.239 C -11.514 63.239 -8.8045 62.159 -6.82564 60.688 L -10.2543 57.329 C -11.2843 58.049 -12.6345 58.469 -14.0045 58.469 C -16.9345 58.469 -19.4045 56.621 -20.2045 53.968 L -24.2143 53.968 L -24.2143 57.458 C -22.2045 61.399 -18.7243 63.239 -14.754 63.239 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M -20.2045 53.968 C -20.4645 53.148 -20.6045 52.279 -20.6045 51.369 C -20.6045 50.459 -20.4645 49.589 -20.2045 48.77 L -20.2045 45.28 L -24.2143 45.28 C -25.2841 47.37 -25.8845 49.77 -25.8845 51.369 C -25.8845 52.968 -25.2841 55.369 -24.2143 57.458 L -20.2045 53.968 Z"
                />
                <path
                  fill="#EA4335"
                  d="M -14.754 44.229 C -12.514 44.229 -10.5045 45.25 -9.07426 46.861 L -6.01426 43.801 C -8.28426 41.891 -11.334 40.5 -14.754 40.5 C -18.7243 40.5 -22.2045 42.34 -24.2143 45.28 L -20.2045 48.77 C -19.4045 46.119 -16.9345 44.229 -14.754 44.229 Z"
                />
              </g>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}

export default GoogleSignInButton;