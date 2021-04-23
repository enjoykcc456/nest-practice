export const config = () => ({
  port: process.env.PORT || 3001,
  db: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nestjs',
    username: process.env.DB_USERNAME || 'dev',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '33206', 10),
  },
  auth: {
    myinfo: {
      api: {
        authoriseUrl:
          process.env.MYINFO_API_AUTHORISE ||
          'https://test.api.myinfo.gov.sg/com/v3/authorise',
        tokenUrl:
          process.env.MYINFO_API_TOKEN ||
          'https://test.api.myinfo.gov.sg/com/v3/token',
        personUrl:
          process.env.MYINFO_API_PERSON ||
          'https://test.api.myinfo.gov.sg/com/v3/person',
      },
      clientId: process.env.MYINFO_APP_CLIENT_ID || 'STG2-MYINFO-SELF-TEST',
      clientSecret:
        process.env.MYINFO_APP_CLIENT_SECRET ||
        '44d953c796cccebcec9bdc826852857ab412fbe2',
      redirectUrl:
        process.env.MYINFO_APP_REDIRECT_URL ||
        `http://localhost:${process.env.PORT}/callback`,
      signaturePublicCert:
        process.env.MYINFO_SIGNATURE_CERT_PUBLIC_CERT ||
        './ssl/staging_myinfo_public_cert.cer',
    },
    privateKey:
      process.env.APP_SIGNATURE_CERT_PRIVATE_KEY ||
      './ssl/stg-demoapp-client-privatekey-2018.pem',
    singpass: {
      api: {
        authoriseUrl:
          process.env.SINGPASS_API_AUTHORISE ||
          'http://localhost:5156/singpass/authorize',
        tokenUrl:
          process.env.SINGPASS_API_TOKEN ||
          'http://localhost:5156/singpass/token',
      },
      redirectUrl:
        process.env.SINGPASS_APP_REDIRECT_URL ||
        `http://localhost:${process.env.PORT}/callback`,
    },
  },
});
