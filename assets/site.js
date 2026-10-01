/* MicroLiving Midwest — progressive enhancement, no framework or build step.
   Forms stay in honest local-preview mode unless an HTTPS endpoint is set.
   No analytics, browser storage, credentials or private tokens are included. */
'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 800px)');
  const nav = $('#primary-nav');
  const menuButton = $('.menu-toggle');
  const standalone = document.body.dataset.standalone === 'true';
  const titles = {
    home: 'MicroLiving Midwest — Transforming Assets Into Homes',
    about: 'About — MicroLiving Midwest',
    model: 'Our Model — MicroLiving Midwest'
  };
  const descriptions = {
    home: 'MicroLiving Midwest connects underutilized land, mission-aligned capital, and community partnerships through a coordinated attainable-housing delivery model.',
    about: 'The story behind MicroLiving Midwest and the distinct roles of MicroLiving, Embrace Your Shine, and community partners.',
    model: 'Explore MicroLiving Midwest’s asset-light delivery model, go/no-go quality gates, and approach to institutional partnerships.'
  };

  function setMenu(open, returnFocus = false) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (returnFocus) menuButton.focus();
  }
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    if (mobile.addEventListener) mobile.addEventListener('change', () => setMenu(false));
  }

  function jumpTo(target, smooth = true, focus = true) {
    if (!target) return;
    if (focus) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    }
    target.scrollIntoView({behavior:smooth && !reducedMotion.matches ? 'smooth' : 'instant', block:'start'});
  }

  const skipLink = $('.skip-link');
  if (skipLink) skipLink.addEventListener('click', event => {
    event.preventDefault(); jumpTo($('#main'),false,true);
  });

  // The standalone file uses hash-based views. The zip contains real HTML pages.
  function renderRoute(initial = false) {
    const match = location.hash.match(/^#(home|about|model)(?:\/([a-z0-9-]+))?$/);
    if (!match && location.hash && location.hash !== '#main') return;
    const page = match ? match[1] : 'home';
    const section = match && match[2];
    const previousPage = document.body.dataset.currentPage;
    $$('[data-page]').forEach(view => { view.hidden = view.dataset.page !== page; });
    document.body.dataset.currentPage = page;
    document.title = titles[page];
    const description = $('meta[name="description"]');
    if (description) description.content = descriptions[page];
    $$('[data-nav-page]').forEach(a => {
      if (a.dataset.navPage === page) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const back = $('[data-back-top]');
    if (back) back.href = '#' + page;
    setMenu(false);
    requestAnimationFrame(() => {
      if (section) {
        const target = document.getElementById(page + '-' + section);
        if (target) jumpTo(target, !initial && previousPage === page, !initial);
      } else if (!initial || location.hash) {
        if (!initial) {
          const title = document.getElementById(page + '-title');
          if (title) { title.setAttribute('tabindex','-1'); title.focus({preventScroll:true}); }
        }
        window.scrollTo({top:0,behavior:'instant'});
      }
    });
  }
  if (standalone) {
    window.addEventListener('hashchange', () => renderRoute(false));
    // Clicking the current route should still scroll to its intended position.
    document.addEventListener('click', event => {
      const a = event.target.closest('a[href^="#"]');
      if (!a || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      if (/^#(home|about|model)(?:\/([a-z0-9-]+))?$/.test(a.getAttribute('href')) && a.hash === location.hash) {
        event.preventDefault(); renderRoute(false);
      }
    });
    renderRoute(true);
  }
  // Preserve useful keyboard focus for in-document links in the multi-page build.
  if (!standalone) {
    document.addEventListener('click', event => {
      const a = event.target.closest('a[href]');
      if (!a || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      let url;
      try { url = new URL(a.href); } catch (_) { return; }
      if (url.pathname !== location.pathname || url.origin !== location.origin || !url.hash) return;
      const target = document.getElementById(url.hash.slice(1));
      if (target && url.hash !== '#main') {
        event.preventDefault();
        history.pushState(null,'',url.hash);
        jumpTo(target);
      }
    });
  }

  const scaleTabs = $$('.scale-option');
  if (scaleTabs.length) {
    const panels = $$('.scale-panel');
    function selectScale(index, focus = false) {
      scaleTabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle('active', active);
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      });
      if (focus) scaleTabs[index].focus();
    }
    scaleTabs.forEach((tab,index) => {
      tab.addEventListener('click', () => selectScale(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index+1)%scaleTabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index+scaleTabs.length-1)%scaleTabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = scaleTabs.length-1;
        if (next !== undefined) { event.preventDefault(); selectScale(next,true); }
      });
    });
    selectScale(0);
  }
  document.documentElement.classList.add('js');
  $$('[data-year]').forEach(span => { span.textContent = String(new Date().getFullYear()); });

  const form = $('#inquiry-form');
  if (!form) return;
  const dialog = $('#inquiry-dialog');
  const preview = $('#inquiry-preview');
  const status = $('#form-status');
  const dialogStatus = $('#dialog-status');
  const label = $('#submit-label');
  const submit = $('button[type="submit"]',form);
  const notice = $('#form-notice');
  const config = window.MICROLIVING_CONFIG || {};
  let endpoint = '';
  let email = '';
  let message = '';
  let returnFocus;
  let submitting = false;

  if (config.FORM_ENDPOINT) {
    try {
      const url = new URL(config.FORM_ENDPOINT);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('A public HTTPS endpoint is required.');
      endpoint = url.href;
      label.textContent = 'Submit inquiry';
      notice.textContent = 'Submitting sends the information above to MicroLiving Midwest through its configured inquiry service. Please do not include sensitive personal or financial information.';
    } catch (error) { console.warn('The form remains in preview mode:',error.message); }
  }
  if (typeof config.CONTACT_EMAIL === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.CONTACT_EMAIL) && !/[\r\n]/.test(config.CONTACT_EMAIL)) {
    email = config.CONTACT_EMAIL;
    if (!endpoint) notice.textContent = 'This form prepares an inquiry. Copy or save it, or open your email app to review and send. Nothing is sent automatically.';
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll:true});
  });
  $('.dialog-close',dialog).addEventListener('click',closeDialog);
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog();
  });

  function preparePreview(fields) {
    message = [
      'MICROLIVING MIDWEST — PROJECT / PARTNERSHIP INQUIRY','',
      'Name: '+fields.name,'Email: '+fields.email,
      'Organization: '+(fields.organization || '(Not provided)'),'',
      'Asset / partnership type: '+fields.interest,
      'Scale ambition: '+fields.scale,'Timing: '+fields.timing,'',
      'Additional context:',fields.context || '(Not provided)'
    ].join('\n');
    preview.value = message;
    dialogStatus.textContent = '';
    const mail = $('#email-inquiry');
    mail.hidden = !email;
    if (email) {
      mail.href = 'mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('MicroLiving Midwest — Project inquiry')+'&body='+encodeURIComponent(message);
    }
    returnFocus = document.activeElement;
    document.body.classList.add('dialog-open');
    dialog.showModal();
  }

  form.addEventListener('submit',async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    status.textContent = '';
    const data = new FormData(form);
    if (String(data.get('companyWebsite') || '').trim()) {
      status.textContent = 'We could not prepare this inquiry. Please reload the page and try again.';
      return;
    }
    const fields = Object.fromEntries(['name','email','organization','interest','scale','timing','context'].map(key => [key,String(data.get(key) || '').trim()]));
    if (!fields.name) { status.textContent = 'Please enter your full name.'; $('#full-name').focus(); return; }
    if (!endpoint) { preparePreview(fields); return; }
    submitting = true;
    submit.disabled = true;
    form.setAttribute('aria-busy','true');
    label.textContent = 'Submitting…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),15000);
    try {
      const response = await fetch(endpoint,{
        method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(fields),credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal
      });
      if (!response.ok) throw new Error('The service did not accept the inquiry.');
      // Only show success after an explicit server acknowledgement.
      const result = await response.json();
      if (result.ok !== true) throw new Error('The service did not confirm acceptance.');
      status.textContent = 'Your inquiry was submitted. Thank you for starting the conversation.';
      form.reset();
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? 'The request timed out. Submission could not be confirmed. Your entries are still here; please try again.'
        : 'Submission could not be confirmed. Your entries are still here; please try again.';
    } finally {
      clearTimeout(timer); submitting = false; submit.disabled = false;
      form.removeAttribute('aria-busy'); label.textContent = 'Submit inquiry';
    }
  });

  $('#copy-inquiry').addEventListener('click',async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard not available.');
      await navigator.clipboard.writeText(message);
      dialogStatus.textContent = 'Message copied. Nothing has been sent.';
    } catch (_) {
      preview.focus(); preview.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* Text stays selected for manual copy. */ }
      dialogStatus.textContent = copied ? 'Message copied. Nothing has been sent.' : 'Message selected. Use your device’s Copy command.';
    }
  });
  $('#save-inquiry').addEventListener('click',() => {
    const url = URL.createObjectURL(new Blob([message],{type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a');
    a.href = url; a.download = 'microliving-midwest-inquiry.txt';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    dialogStatus.textContent = 'Your message was prepared as a text file. Nothing has been sent.';
  });
  submit.disabled = false;
})();
