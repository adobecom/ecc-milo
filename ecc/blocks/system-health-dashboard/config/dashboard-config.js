/* eslint-disable max-len */
// Dashboard configuration - centralized settings for maintainability

export const DASHBOARD_CONFIG = {
  // Time range options
  TIME_RANGES: {
    '1d': { label: '1 Day', days: 1 },
    '3d': { label: '3 Days', days: 3 },
    '7d': { label: '1 Week', days: 7 },
  },

  // View modes
  VIEW_MODES: {
    score: { label: 'Score', unit: '' },
    value: { label: 'Value', unit: '' },
  },

  // Tab configurations
  TABS: {
    splunk: {
      key: 'splunk',
      label: 'Splunk Errors',
      description: 'Error rates and request volume monitoring',
      icon: '🔍',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => inputs.requests?.toLocaleString() || 'N/A',
      },
      units: {
        score: '',
        value: ' requests',
      },
    },
    cwv: {
      key: 'cwv',
      label: 'Core Web Vitals',
      description: 'Core Web Vitals performance metrics',
      icon: '⚡',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => `${inputs.cwv_pass_rate_percent || 0}%`,
      },
      units: {
        score: '',
        value: '',
      },
    },
    api: {
      key: 'api',
      label: 'API Health',
      description: 'API failure rates and coverage',
      icon: '🔌',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => `${((inputs.failure_rate || 0) * 100).toFixed(1)}%`,
      },
      units: {
        score: '',
        value: '',
      },
    },
    prod: {
      key: 'prod',
      label: 'Production Incidents',
      description: 'Active production incidents',
      icon: '🚨',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => inputs.incidents?.length || 0,
      },
      units: {
        score: '',
        value: ' incidents',
      },
    },
    a11y: {
      key: 'a11y',
      label: 'Accessibility',
      description: 'Accessibility compliance score',
      icon: '♿',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => inputs.a11y_score || 0,
      },
      units: {
        score: '',
        value: '',
      },
    },
    escape: {
      key: 'escape',
      label: 'Escape Velocity',
      description: 'Escape velocity metrics',
      icon: '🚀',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => inputs.count || 0,
      },
      units: {
        score: '',
        value: ' escapes',
      },
    },
    e2e: {
      key: 'e2e',
      label: 'End-to-End Tests',
      description: 'E2E test failure rates',
      icon: '🧪',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => `${((inputs.failure_rate || 0) * 100).toFixed(1)}%`,
      },
      units: {
        score: '',
        value: '',
      },
    },
    down: {
      key: 'down',
      label: 'Downtime',
      description: 'System downtime tracking',
      icon: '⏱️',
      colorThresholds: {
        green: 90,
        yellow: 70,
        orange: 50,
      },
      valueFormatters: {
        score: (value) => `${value}`,
        value: (inputs) => `${inputs.downtime_minutes || 0} min`,
      },
      units: {
        score: '',
        value: '',
      },
    },
  },

  // Key metrics configuration
  KEY_METRICS: [
    {
      key: 'total_requests',
      label: 'Total Requests',
      getValue: (data) => data.tabs?.splunk?.inputs?.requests?.toLocaleString() || 'N/A',
    },
    {
      key: 'cwv_pass_rate',
      label: 'CWV Pass Rate',
      getValue: (data) => `${data.tabs?.cwv?.inputs?.cwv_pass_rate_percent || 0}%`,
    },
    {
      key: 'api_coverage',
      label: 'API Coverage',
      getValue: (data) => `${((data.tabs?.api?.inputs?.coverage || 0) * 100).toFixed(1)}%`,
    },
    {
      key: 'active_incidents',
      label: 'Active Incidents',
      getValue: (data) => data.tabs?.prod?.inputs?.incidents?.length || 0,
    },
  ],

  // AI suggestions configuration
  AI_SUGGESTIONS: [
    {
      icon: '💡',
      title: 'Optimize Error Handling',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consider implementing circuit breakers for external API calls.',
    },
    {
      icon: '⚡',
      title: 'Improve Core Web Vitals',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Focus on critical user journey test cases.',
    },
    {
      icon: '🔧',
      title: 'Reduce Production Incidents',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consider implementing blue-green deployments.',
    },
  ],

  // Color thresholds for health scores
  SCORE_COLORS: {
    green: { min: 90, color: 'green' },
    yellow: { min: 70, color: 'yellow' },
    orange: { min: 50, color: 'orange' },
    red: { min: 0, color: 'red' },
  },
};

// Helper functions
export const getScoreColor = (score) => {
  const { SCORE_COLORS } = DASHBOARD_CONFIG;
  const thresholds = Object.values(SCORE_COLORS).sort((a, b) => b.min - a.min);

  return thresholds.find((threshold) => score >= threshold.min)?.color || 'red';
};

export const getTabConfig = (tabKey) => DASHBOARD_CONFIG.TABS[tabKey] || null;

export const getTabValue = (tabKey, data, viewMode) => {
  const config = getTabConfig(tabKey);
  if (!config || !data?.tabs?.[tabKey]) return 'N/A';

  const { inputs } = data.tabs[tabKey];
  const formatter = config.valueFormatters[viewMode];
  const unit = config.units[viewMode];

  if (viewMode === 'score') {
    return `${data.tabs[tabKey].score}${unit}`;
  }

  return `${formatter(inputs)}${unit}`;
};
