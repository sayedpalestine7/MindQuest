// googleAuth.js
const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          console.error('Google Sign-In client library loaded but not available');
          reject(new Error('Google Sign-In client library not available'));
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Sign-In client library');
        reject(new Error('Failed to load Google Sign-In client library'));
      };
      document.head.appendChild(script);
    }
  });
};
// frontend/src/utils/googleAuth.js
export const getGoogleIdToken = () => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.google || !window.google.accounts) {
        return reject(new Error('Google Sign-In client library not loaded'));
      }

      const clientId = '750136412610-agbc9lmgtjdecdkkgd83m7lihv5ief9i.apps.googleusercontent.com';
      
      // Initialize the Google Sign-In client
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential returned from Google'));
          }
        },
        auto_select: false,
        ux_mode: 'popup'
      });

      // Create a button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'none';
      document.body.appendChild(buttonContainer);

      // Render the button
      window.google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 300,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });

      // Programmatically click the button
      const button = buttonContainer.querySelector('div[role=button]');
      if (button) {
        button.click();
      } else {
        reject(new Error('Failed to initialize Google Sign-In button'));
      }

      // Clean up
      setTimeout(() => {
        if (document.body.contains(buttonContainer)) {
          document.body.removeChild(buttonContainer);
        }
      }, 1000);

    } catch (error) {
      console.error('Google Sign-In error:', error);
      reject(error);
    }
  });
};