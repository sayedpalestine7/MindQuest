
export const getGoogleIdToken = () => {
  return new Promise((resolve, reject) => {
    const waitForGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              resolve(response.credential);
            } else {
              reject("No credential returned");
            }
          },
        });

        window.google.accounts.id.prompt();
      } else {
        setTimeout(waitForGoogle, 100); // ⏳ wait until SDK loads
      }
    };

    waitForGoogle();
  });
};
