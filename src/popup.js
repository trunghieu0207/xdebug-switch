const SESSION_COOKIE = { name: 'XDEBUG_SESSION', buttonName: 'Debug', value: 'chrome' };
const PROFILER_COOKIE = { name: 'XDEBUG_PROFILE', buttonName: 'Profiler', value: '1' };

function getCurrentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      resolve(tabs[0]);
    });
  });
}

function getUrlForCookies(tab) {
  try {
    const url = new URL(tab.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch (e) {
    return null;
  }
}

async function isCookieSet(url, cookieName) {
  return new Promise(resolve => {
    chrome.cookies.get({ url, name: cookieName }, cookie => {
      resolve(!!cookie);
    });
  });
}

async function setCookie(url, cookie) {
  return new Promise(resolve => {
    chrome.cookies.set({ url, name: cookie.name, value: cookie.value, path: '/' }, () => resolve());
  });
}

async function removeCookie(url, cookieName) {
  return new Promise(resolve => {
    chrome.cookies.remove({ url, name: cookieName }, () => resolve());
  });
}

async function updateButton(btnId, cookie, url, tab) {
  const btn = document.getElementById(btnId);
  if (!url) {
    btn.textContent = 'It only available on http/https';
    btn.disabled = true;
    return;
  }

  const isOn = await isCookieSet(url, cookie.name);
  btn.textContent = isOn ? `Disable ${cookie.buttonName}` : `Enable ${cookie.buttonName}`;
  if(isOn) {
    btn.classList.add('btn-off')
  } else {
    btn.classList.remove('btn-off')
  }
  // btn.style.background = isOn ? '#e74c3c' : '#cccccc';
  btn.disabled = false;

  btn.onclick = async () => {
    btn.disabled = true;
    if (isOn) {
      await removeCookie(url, cookie.name);
    } else {
      await setCookie(url, cookie);
    }
    chrome.tabs.reload(tab.id);
    setTimeout(() => updateButton(btnId, cookie, url, tab), 500);
  };
}

async function initialize() {
  const tab = await getCurrentTab();
  const url = getUrlForCookies(tab);
  await updateButton('toggleSessionBtn', SESSION_COOKIE, url, tab);
  await updateButton('toggleProfilerBtn', PROFILER_COOKIE, url, tab);
}

document.addEventListener('DOMContentLoaded', initialize);