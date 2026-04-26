// ===== ThreatLens Web Demo - Interactive Prototype =====
// SIMULATED MODE - All features work with mock data for demo purposes

const CONFIG = {
  useSimulatedAI: true, // All AI features are simulated for demo
  geminiApiKey: 'DEMO_KEY_NOT_USED',
  trustRegistryBaseUrl: 'https://demo.threatlens.app',
  trustRegistryApiKey: 'DEMO_KEY',
};

// ===== State Management =====
const state = {
  notifications: [],
  selectedNotification: null,
  scanResults: [],
  credentials: [],
  breachResults: [],
  protectImage: null,
  verifyImage: null,
};

// ===== Sample Data =====
const sampleNotifications = [
  {
    id: '1',
    title: 'Your Package Delivery',
    body: 'Your package could not be delivered. Click here to reschedule: http://fake-delivery.com/claim',
    app: 'SMS',
    timestamp: '2 min ago',
    type: 'phishing',
  },
  {
    id: '2',
    title: 'Congratulations! You won $10,000',
    body: 'Claim your prize now! Send your bank details to claims@lottery-winner.com',
    app: 'Email',
    timestamp: '15 min ago',
    type: 'scam',
  },
  {
    id: '3',
    title: 'Your OTP is 847293',
    body: 'Use this code to verify your account. Valid for 10 minutes.',
    app: 'SMS',
    timestamp: '1 hour ago',
    type: 'safe',
  },
  {
    id: '4',
    title: 'Limited Time Offer!',
    body: 'Buy now and get 90% OFF! Only 5 items left! Click: http://spam-shop.com/deals',
    app: 'WhatsApp',
    timestamp: '2 hours ago',
    type: 'spam',
  },
  {
    id: '5',
    title: 'Account Security Alert',
    body: 'We detected suspicious activity. Verify your identity: http://not-google.com/verify',
    app: 'Gmail',
    timestamp: '3 hours ago',
    type: 'phishing',
  },
];

const demoBreaches = [
  {
    id: 'adobe-2023',
    name: 'Adobe Data Breach',
    domain: 'adobe.com',
    date: '2023-10-15',
    dataClasses: ['Email', 'Password', 'Personal Info'],
    matchedCredential: 'user@example.com',
    description: 'Adobe customer data was exposed including encrypted passwords and personal information.',
    geminiGuidance: JSON.stringify({
      actionItems: [
        'Change your Adobe password immediately',
        'Enable two-factor authentication on Adobe account',
        'Check if you reused this password on other sites',
        'Monitor your email for phishing attempts',
      ],
      isFallback: false,
    }),
  },
  {
    id: 'linkedin-2021',
    name: 'LinkedIn Scraping Incident',
    domain: 'linkedin.com',
    date: '2021-06-22',
    dataClasses: ['Email', 'Phone', 'Location', 'Profile Info'],
    matchedCredential: 'user@example.com',
    description: 'Data from 700M LinkedIn profiles was scraped and posted on a hacking forum.',
    geminiGuidance: JSON.stringify({
      actionItems: [
        'Review your LinkedIn privacy settings',
        'Be cautious of recruitment scams',
        'Consider making your profile less visible',
        'Watch for targeted phishing using your profile data',
      ],
      isFallback: false,
    }),
  },
];

// ===== Tab Navigation =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
  });
});

// ===== Image Shield Mode Switching =====
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.mode-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${mode}-mode`).classList.add('active');
  });
});

// ===== NOTIFICATION SCANNER =====

function renderNotifications() {
  const container = document.getElementById('notificationList');
  
  if (state.notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>No notifications yet. Click "Add Random" to simulate incoming notifications</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.notifications.map(notif => `
    <div class="notification-item ${state.selectedNotification === notif.id ? 'selected' : ''}" 
         onclick="selectNotification('${notif.id}')">
      <div class="notification-icon ${notif.type}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <div class="notification-content">
        <div class="notification-title">${escapeHtml(notif.title)}</div>
        <div class="notification-body">${escapeHtml(notif.body)}</div>
        <div class="notification-meta">${notif.app} • ${notif.timestamp}</div>
      </div>
    </div>
  `).join('');
}

function selectNotification(id) {
  state.selectedNotification = id;
  renderNotifications();
}

function addRandomNotification() {
  const available = sampleNotifications.filter(
    n => !state.notifications.find(existing => existing.body === n.body)
  );
  
  if (available.length === 0) {
    // Reset and start over
    state.notifications = [];
  }
  
  const pool = state.notifications.length === 0 ? sampleNotifications : available;
  const random = pool[Math.floor(Math.random() * pool.length)];
  
  state.notifications.push({
    ...random,
    id: Date.now().toString(),
    timestamp: 'Just now',
  });
  
  renderNotifications();
}

async function scanAllNotifications() {
  if (state.notifications.length === 0) {
    alert('Add some notifications first!');
    return;
  }
  
  const container = document.getElementById('scanResultsContainer');
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  const results = [];
  
  for (const notif of state.notifications) {
    const result = await analyzeNotificationWithGemini(notif);
    results.push(result);
  }
  
  state.scanResults = results;
  renderScanResults();
}

async function analyzeNotificationWithGemini(notification) {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
  
  // Simulated AI responses based on notification content patterns
  const aiResponses = {
    phishing: {
      classification: 'PHISHING',
      confidence: 92 + Math.floor(Math.random() * 6),
      summary: 'Contains suspicious links attempting to redirect to unverified domains. Classic phishing pattern detected.',
      guidance: [
        'Do not click any links in this message',
        'Verify sender by contacting them through official channels',
        'Report this as phishing in your app settings',
        'Delete the message immediately',
      ],
    },
    scam: {
      classification: 'SCAM',
      confidence: 89 + Math.floor(Math.random() * 8),
      summary: 'Financial scam detected. Message promises unrealistic rewards in exchange for personal information.',
      guidance: [
        'Do not send money or share personal information',
        'Search online to verify if this is a known scam',
        'Report to cybercrime authorities',
        'Block the sender',
      ],
    },
    spam: {
      classification: 'SPAM',
      confidence: 85 + Math.floor(Math.random() * 10),
      summary: 'Unsolicited promotional content with aggressive marketing tactics detected.',
      guidance: [
        'Do not respond to this message',
        'Mark as spam and block sender',
        'Delete the message',
        'Avoid clicking promotional links',
      ],
    },
    safe: {
      classification: 'SAFE',
      confidence: 94 + Math.floor(Math.random() * 5),
      summary: 'No threat indicators detected. Message appears to be legitimate communication.',
      guidance: [
        'No action needed',
        'Continue practicing normal security caution',
        'Keep your software updated',
      ],
    },
  };
  
  const response = aiResponses[notification.type] || aiResponses.safe;
  
  // Add slight variation to make it feel more "AI-like"
  return {
    ...response,
    summary: response.summary,
    guidance: response.guidance,
  };
}

function renderScanResults() {
  const container = document.getElementById('scanResultsContainer');
  
  if (state.scanResults.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>No scans yet. Add notifications and click "Scan All with AI"</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.scanResults.map((result, index) => `
    <div class="result-card ${result.classification.toLowerCase()}">
      <div class="result-header">
        <div class="result-classification ${result.classification.toLowerCase()}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            ${result.classification === 'SAFE' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : 
              '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
          </svg>
          ${result.classification}
        </div>
        <span class="result-confidence">${result.confidence}% confidence</span>
      </div>
      <p class="result-summary">${escapeHtml(result.summary)}</p>
      <div class="result-guidance">
        <h4>AI Guidance:</h4>
        <ul>
          ${result.guidance.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

// ===== IMAGE SHIELD =====

function handleProtectImageSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    state.protectImage = {
      file,
      dataUrl: e.target.result,
    };
    renderProtectPreview();
  };
  reader.readAsDataURL(file);
}

function renderProtectPreview() {
  const container = document.getElementById('protectPreview');
  const btn = document.getElementById('protectBtn');
  
  if (state.protectImage) {
    container.innerHTML = `
      <img class="image-preview" src="${state.protectImage.dataUrl}" alt="Selected image" />
    `;
    btn.disabled = false;
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p>Image preview will appear here</p>
      </div>
    `;
    btn.disabled = true;
  }
}

async function protectImage() {
  if (!state.protectImage) return;
  
  const resultContainer = document.getElementById('protectResult');
  resultContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  // Simulate image signing (actual crypto would happen in native app)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock signature data
  const mockPayload = {
    version: 1,
    installID: generateUUID(),
    deviceModel: 'Web Demo',
    timestamp: new Date().toISOString(),
    sha256: await hashImage(state.protectImage.dataUrl),
    phash: generateMockPHash(),
    publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
    signature: generateMockSignature(),
  };
  
  resultContainer.innerHTML = `
    <div class="verification-status authentic">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
      <div class="verification-status-text authentic">
        <h4>Image Protected</h4>
        <p>Successfully signed with cryptographic signature</p>
      </div>
    </div>
    <div class="payload-details">
      <p><strong>Install ID:</strong> ${mockPayload.installID}</p>
      <p><strong>SHA-256:</strong> ${mockPayload.sha256}</p>
      <p><strong>Perceptual Hash:</strong> ${mockPayload.phash}</p>
      <p><strong>Timestamp:</strong> ${new Date(mockPayload.timestamp).toLocaleString()}</p>
      <p><strong>Signature:</strong> ${mockPayload.signature.slice(0, 40)}...</p>
    </div>
  `;
}

function handleVerifyImageSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    state.verifyImage = {
      file,
      dataUrl: e.target.result,
    };
    renderVerifyPreview();
  };
  reader.readAsDataURL(file);
}

function renderVerifyPreview() {
  const container = document.getElementById('verifyUploadArea');
  const btn = document.getElementById('verifyBtn');
  
  if (state.verifyImage) {
    container.innerHTML = `
      <img class="image-preview" src="${state.verifyImage.dataUrl}" alt="Selected image" style="max-height: 200px; margin-bottom: 12px;" />
      <p>Image ready for verification</p>
    `;
    btn.disabled = false;
  }
}

async function verifyImage() {
  if (!state.verifyImage) return;
  
  const resultContainer = document.getElementById('verifyResult');
  resultContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  // Simulate verification
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const cloudCheckEnabled = document.getElementById('cloudCheckToggle').checked;
  
  // Simulate random verification result (for demo purposes)
  const isAuthentic = Math.random() > 0.3; // 70% chance of authentic
  
  if (isAuthentic) {
    resultContainer.innerHTML = `
      <div class="verification-status authentic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <div class="verification-status-text authentic">
          <h4>Authentic Image</h4>
          <p>All verification checks passed. Image is genuine.</p>
        </div>
      </div>
      <div class="checks-list">
        <div class="check-item pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          EXIF payload found
        </div>
        <div class="check-item pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Signature valid
        </div>
        <div class="check-item pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Hash match (no tampering)
        </div>
        <div class="check-item pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Master certificate valid
        </div>
        ${cloudCheckEnabled ? `
        <div class="check-item pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Cloud registry: Active
        </div>
        ` : ''}
      </div>
    `;
  } else {
    resultContainer.innerHTML = `
      <div class="verification-status tampered">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <div class="verification-status-text tampered">
          <h4>No Protection Found</h4>
          <p>This image does not contain a ThreatLens signature</p>
        </div>
      </div>
      <div class="checks-list">
        <div class="check-item fail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          No EXIF payload detected
        </div>
        <div class="check-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="12" y1="4" x2="12" y2="4.01"/>
          </svg>
          Image cannot be verified as authentic
        </div>
      </div>
      <p style="margin-top: 12px; font-size: 13px; color: var(--color-text-secondary);">
        This is expected for images not signed by ThreatLens. Use the Protect feature to sign images.
      </p>
    `;
  }
}

// ===== BREACH MONITOR =====

function renderCredentials() {
  const container = document.getElementById('monitoredCredentials');
  
  if (state.credentials.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = state.credentials.map(cred => `
    <div class="credential-tag">
      <span>${escapeHtml(cred.value)}</span>
      <button onclick="removeCredential('${cred.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function addCredential() {
  const input = document.getElementById('credentialInput');
  const value = input.value.trim();
  
  if (!value) {
    alert('Please enter an email or username');
    return;
  }
  
  const isEmail = value.includes('@');
  if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    alert('Please enter a valid email address');
    return;
  }
  
  if (!isEmail && value.length < 3) {
    alert('Username must be at least 3 characters');
    return;
  }
  
  if (state.credentials.find(c => c.value === value)) {
    alert('This credential is already being monitored');
    return;
  }
  
  state.credentials.push({
    id: Date.now().toString(),
    value,
    type: isEmail ? 'email' : 'username',
  });
  
  input.value = '';
  renderCredentials();
}

function removeCredential(id) {
  state.credentials = state.credentials.filter(c => c.id !== id);
  renderCredentials();
}

async function scanForBreaches() {
  if (state.credentials.length === 0) {
    alert('Add credentials to monitor first!');
    return;
  }
  
  const btn = document.getElementById('scanBreachBtn');
  const resultsContainer = document.getElementById('breachResults');
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Scanning...';
  resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    const allBreaches = [];
    
    for (const cred of state.credentials) {
      const breaches = await checkCredentialBreaches(cred.value, cred.type);
      allBreaches.push(...breaches);
    }
    
    state.breachResults = allBreaches;
    renderBreachResults();
  } catch (error) {
    console.error('Breach scan error:', error);
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <p>Scan failed. ${error.message || 'Please try again.'}</p>
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      Scan Now
    `;
  }
}

async function checkCredentialBreaches(value, type) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulated breach database
  const simulatedBreaches = [
    {
      id: 'collection-1-2024',
      name: 'Data Aggregation Breach',
      domain: 'multiple-sites.com',
      date: '2024-01-15',
      dataClasses: ['Email', 'Password', 'IP Address'],
      description: `The credential "${value}" was found in a aggregated dataset containing data from multiple breached services.`,
    },
    {
      id: 'social-media-2023',
      name: 'Social Media Platform Leak',
      domain: 'socialplatform.io',
      date: '2023-08-22',
      dataClasses: ['Email', 'Username', 'Phone', 'Location'],
      description: `A major social media platform exposed user data including contact information and profile details.`,
    },
    {
      id: 'retail-2024',
      name: 'E-commerce Database Exposure',
      domain: 'onlineshop.store',
      date: '2024-03-10',
      dataClasses: ['Email', 'Name', 'Address', 'Purchase History'],
      description: `An online retailer's database was misconfigured, exposing customer records and order history.`,
    },
  ];
  
  // Return 1-2 random breaches for demo (simulating that this credential was found)
  const numBreaches = Math.floor(Math.random() * 2) + 1;
  const selectedBreaches = simulatedBreaches
    .sort(() => Math.random() - 0.5)
    .slice(0, numBreaches)
    .map(breach => ({
      ...breach,
      id: `${breach.id}-${value.replace(/@/g, '-')}`,
      matchedCredential: value,
    }));
  
  // Generate AI guidance for each
  for (const breach of selectedBreaches) {
    breach.geminiGuidance = await generateBreachGuidance(breach);
  }
  
  return selectedBreaches;
}

async function generateBreachGuidance(breach) {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Simulated AI guidance based on breach data types
  const dataTypes = breach.dataClasses.map(d => d.toLowerCase()).join(', ');
  
  const simulatedGuidance = {
    actionItems: [
      `Immediately change your password on ${breach.name || 'the affected service'}`,
      dataTypes.includes('password') 
        ? 'Use a unique password you haven\'t used elsewhere' 
        : 'Enable two-factor authentication for added security',
      dataTypes.includes('email') 
        ? 'Watch for phishing emails claiming to be from this company' 
        : 'Monitor your email for suspicious activity',
      dataTypes.includes('phone') || dataTypes.includes('personal')
        ? 'Be cautious of unsolicited calls or messages referencing this breach'
        : 'Check if your password was reused on other sites and change those too',
    ],
    isFallback: false,
  };
  
  return JSON.stringify(simulatedGuidance);
}

function renderBreachResults() {
  const container = document.getElementById('breachResults');
  
  if (state.breachResults.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p>No breaches found! Your monitored credentials are secure.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.breachResults.map(breach => {
    let guidance = { actionItems: [], isFallback: true };
    try {
      if (breach.geminiGuidance) {
        guidance = JSON.parse(breach.geminiGuidance);
      }
    } catch (e) {
      // Use fallback
    }
    
    return `
      <div class="breach-card">
        <div class="breach-header">
          <div class="breach-name">${escapeHtml(breach.name)}</div>
          <span class="breach-status at-risk">At Risk</span>
        </div>
        <div class="breach-meta">
          ${new Date(breach.date).toLocaleDateString()} • ${escapeHtml(breach.domain)}
        </div>
        <div class="breach-data-types">
          Leaked: ${breach.dataClasses.map(c => escapeHtml(c)).join(', ')}
        </div>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px;">
          ${escapeHtml(breach.description)}
        </p>
        ${guidance.actionItems.length > 0 ? `
        <div class="breach-guidance">
          <h4>AI Remediation Guidance:</h4>
          <ul>
            ${guidance.actionItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function loadDemoBreaches() {
  state.breachResults = demoBreaches;
  renderBreachResults();
}

// ===== Utility Functions =====

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function hashImage(dataUrl) {
  // Simple mock hash for demo
  const bytes = new TextEncoder().encode(dataUrl);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateMockPHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generateMockSignature() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let sig = '';
  for (let i = 0; i < 88; i++) {
    sig += chars[Math.floor(Math.random() * chars.length)];
  }
  return sig;
}

// ===== Initialization =====

document.addEventListener('DOMContentLoaded', () => {
  // Add drag-and-drop support for image uploads
  const protectArea = document.getElementById('protectUploadArea');
  const verifyArea = document.getElementById('verifyUploadArea');
  
  [protectArea, verifyArea].forEach(area => {
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.style.borderColor = 'var(--color-accent)';
      area.style.background = 'var(--color-accent-muted)';
    });
    
    area.addEventListener('dragleave', () => {
      area.style.borderColor = 'var(--color-border)';
      area.style.background = 'rgba(10, 15, 20, 0.68)';
    });
    
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.style.borderColor = 'var(--color-border)';
      area.style.background = 'rgba(10, 15, 20, 0.68)';
      
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const input = area.querySelector('input[type="file"]');
        if (input) {
          const event = new Event('change');
          input.files = e.dataTransfer.files;
          input.dispatchEvent(event);
        }
      }
    });
  });
  
  console.log('ThreatLens Web Demo initialized');
});
