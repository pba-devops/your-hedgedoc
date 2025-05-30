'use strict'

const os = require('os')

module.exports = {
  domain: '',
  urlPath: '',
  host: '0.0.0.0',
  port: 3000,
  loglevel: 'info',
  urlAddPort: false,
  allowOrigin: ['localhost'],
  useSSL: false,
  hsts: {
    enable: true,
    maxAgeSeconds: 60 * 60 * 24 * 365,
    includeSubdomains: true,
    preload: false
  },
  csp: {
    enable: true,
    directives: {
    },
    addDefaults: true,
    addDisqus: false,
    addGoogleAnalytics: false,
    upgradeInsecureRequests: 'auto',
    reportURI: undefined,
    allowFraming: true,
    allowPDFEmbed: true
  },
  rateLimitNewNotes: 20,
  cookiePolicy: 'lax',
  protocolUseSSL: false,
  allowAnonymous: true,
  allowAnonymousEdits: false,
  allowFreeURL: false,
  requireFreeURLAuthentication: false,
  disableNoteCreation: false,
  forbiddenNoteIDs: ['robots.txt', 'favicon.ico', 'api', 'build', 'css', 'docs', 'fonts', 'js', 'uploads', 'vendor', 'views'],
  defaultPermission: 'editable',
  dbURL: '',
  db: {},
  // ssl path
  sslKeyPath: '',
  sslCertPath: '',
  sslCAPath: '',
  dhParamPath: '',
  // other path
  viewPath: './public/views',
  tmpPath: os.tmpdir(),
  defaultNotePath: './public/default.md',
  docsPath: './public/docs',
  uploadsPath: './public/uploads',
  // session
  sessionName: 'connect.sid',
  sessionSecret: 'secret',
  sessionSecretLen: 128,
  sessionLife: 14 * 24 * 60 * 60 * 1000, // 14 days
  staticCacheTime: 1 * 24 * 60 * 60 * 1000, // 1 day
  // socket.io
  heartbeatInterval: 5000,
  heartbeatTimeout: 10000,
  // too busy timeout
  tooBusyLag: 70,
  // document
  documentMaxLength: 100000,
  // image upload setting, available options are imgur/s3/filesystem/azure/lutim
  imageUploadType: 'filesystem',
  lutim: {
    url: 'https://framapic.org/'
  },
  imgur: {
    clientID: undefined
  },
  s3: {
    accessKeyId: undefined,
    secretAccessKey: undefined,
    region: undefined
  },
  s3bucket: undefined,
  s3folder: 'uploads',
  s3publicFiles: false,
  minio: {
    accessKey: undefined,
    secretKey: undefined,
    endPoint: undefined,
    secure: true,
    port: 9000
  },
  azure: {
    connectionString: undefined,
    container: undefined
  },
  // authentication
  oauth2: {
    providerName: undefined,
    authorizationURL: undefined,
    tokenURL: undefined,
    clientID: undefined,
    clientSecret: undefined,
    scope: undefined
  },
  facebook: {
    clientID: undefined,
    clientSecret: undefined
  },
  twitter: {
    consumerKey: undefined,
    consumerSecret: undefined
  },
  github: {
    clientID: undefined,
    clientSecret: undefined
  },
  gitlab: {
    baseURL: undefined,
    clientID: undefined,
    clientSecret: undefined,
    scope: undefined,
    version: 'v4'
  },
  mattermost: {
    baseURL: undefined,
    clientID: undefined,
    clientSecret: undefined
  },
  dropbox: {
    clientID: undefined,
    clientSecret: undefined,
    appKey: undefined
  },
  google: {
    clientID: undefined,
    clientSecret: undefined,
    hostedDomain: undefined
  },
  ldap: {
    providerName: undefined,
    url: undefined,
    bindDn: undefined,
    bindCredentials: undefined,
    searchBase: undefined,
    searchFilter: undefined,
    searchAttributes: undefined,
    usernameField: undefined,
    useridField: undefined,
    tlsca: undefined
  },
  saml: {
    providerName: undefined,
    idpSsoUrl: undefined,
    idpCert: undefined,
    clientCert: undefined,
    issuer: undefined,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    disableRequestedAuthnContext: false,
    groupAttribute: undefined,
    externalGroups: [],
    requiredGroups: [],
    attribute: {
      id: undefined,
      username: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    }
  },
  email: true,
  allowEmailRegister: true,
  allowGravatar: true,
  openID: false,
  // linkifyHeaderStyle - How is a header text converted into a link id.
  // Header Example: "3.1. Good Morning my Friend! - Do you have 5$?"
  // * 'keep-case' is the legacy HedgeDoc value.
  //    Generated id: "31-Good-Morning-my-Friend---Do-you-have-5"
  // * 'lower-case' is the same like legacy (see above), but converted to lower-case.
  //    Generated id: "#31-good-morning-my-friend---do-you-have-5"
  // * 'gfm' _GitHub-Flavored Markdown_ style as described here:
  //    https://gist.github.com/asabaylus/3071099#gistcomment-1593627
  //    It works like 'lower-case', but making sure the ID is unique.
  //    This is What GitHub, GitLab and (hopefully) most other tools use.
  //    Generated id:   "31-good-morning-my-friend---do-you-have-5"
  //    2nd appearance: "31-good-morning-my-friend---do-you-have-5-1"
  //    3rd appearance: "31-good-morning-my-friend---do-you-have-5-2"
  linkifyHeaderStyle: 'keep-case',
  enableStatsApi: true
}
