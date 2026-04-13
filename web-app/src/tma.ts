import WebApp from '@twa-dev/sdk';

export function initializeTMA() {
  WebApp.ready();
  WebApp.expand();
  
  // Set theme colors
  const theme = WebApp.themeParams;
  if (theme.bg_color) {
    document.documentElement.style.setProperty('--bg-color', theme.bg_color);
  }
}

export function getUserData() {
  // @ts-ignore
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    // @ts-ignore
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  
  return { id: 123456789, first_name: 'DevUser' };
}
