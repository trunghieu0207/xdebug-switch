const COOKIE_NAME = 'XDEBUG_SESSION';
const COOKIE_VALUE = 'chrome';

function getCurrentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      resolve(tabs[0]);
    });
  });
}


function getUrlForCookies(tab) {
  try {
    const url = new URL(tab.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.origin;
  } catch (e) {
    return null;
  }
}

async function updateButton() {
  const btn = document.getElementById('toggleBtn');
  const tab = await getCurrentTab();
  const url = getUrlForCookies(tab);

  if (!url) {
    btn.textContent = 'Chỉ dùng trên http/https';
    btn.disabled = true;
    return;
  }

  const on = await isXdebugOn(url);
  btn.textContent = on ? 'Tắt Xdebug' : 'Bật Xdebug';
  btn.style.background = on ? '#e74c3c' : '#2ecc71';
  btn.disabled = false;

  btn.onclick = async () => {
    btn.disabled = true;
    if (on) {
      await turnOff(url);
    } else {
      await turnOn(url);
    }
    chrome.tabs.reload(tab.id);
    setTimeout(updateButton, 500);
  };
}


document.addEventListener('DOMContentLoaded', updateButton);

async function isXdebugOn(url) {
  return new Promise(resolve => {
    chrome.cookies.get({url, name: COOKIE_NAME}, cookie => {
      resolve(!!cookie);
    });
  });
}

async function turnOn(url) {
  return new Promise(resolve => {
    chrome.cookies.set({
      url,
      name: COOKIE_NAME,
      value: COOKIE_VALUE,
      path: '/'
    }, () => resolve());
  });
}

async function turnOff(url) {
  return new Promise(resolve => {
    chrome.cookies.remove({
      url,
      name: COOKIE_NAME
    }, () => resolve());
  });
}


async function updateButton() {
  const btn = document.getElementById('toggleBtn');
  const tab = await getCurrentTab();
  const url = getUrlForCookies(tab);
  if (!url) {
    btn.textContent = 'Invalid URL';
    btn.disabled = true;
    return;
  }
  const on = await isXdebugOn(url);
  btn.textContent = on ? 'Tắt Xdebug' : 'Bật Xdebug';
  btn.style.background = on ? '#e74c3c' : '#2ecc71';
  btn.disabled = false;
  
  btn.onclick = async () => {
    btn.disabled = true;
    if (on) {
      await turnOff(url);
    } else {
      await turnOn(url);
    }

    chrome.tabs.reload(tab.id);

    setTimeout(updateButton, 500);
  };
}

document.addEventListener('DOMContentLoaded', updateButton);
