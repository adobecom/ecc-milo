import { expect } from '@esm-bundle/chai';
import {
  getCurrentEnvironment,
  isEnvironment,
  getImsEnvironment,
  getEventServiceHost,
} from '../../ecc/scripts/environment.js';
import { ENVIRONMENTS, IMS_ENVIRONMENTS, DOMAINS } from '../../ecc/scripts/constants.js';

describe('Environment Module', () => {
  let locationStub;

  beforeEach(() => {
    // Create a fake location object
    locationStub = {
      hostname: DOMAINS.LOCALHOST,
      host: DOMAINS.LOCALHOST,
      href: `http://${DOMAINS.LOCALHOST}`,
      origin: `http://${DOMAINS.LOCALHOST}`,
      search: '',
    };
  });

  describe('getCurrentEnvironment', () => {
    it('should return LOCAL for localhost with localTest param', () => {
      locationStub.hostname = DOMAINS.LOCALHOST;
      locationStub.search = '?localTest=true';
      expect(getCurrentEnvironment(locationStub)).to.equal(ENVIRONMENTS.LOCAL);
    });

    it('should return DEV02 for dev02 environment', () => {
      locationStub.host = 'dev02--events-milo--adobecom.aem.page';
      locationStub.hostname = 'dev02--events-milo--adobecom.aem.page';
      expect(getCurrentEnvironment(locationStub)).to.equal(ENVIRONMENTS.DEV02);
    });

    it('should return STAGE for stage environment', () => {
      locationStub.host = 'stage--events-milo--adobecom.aem.page';
      locationStub.hostname = 'stage--events-milo--adobecom.aem.page';
      expect(getCurrentEnvironment(locationStub)).to.equal(ENVIRONMENTS.STAGE);
    });

    it('should return PROD for production environment', () => {
      locationStub.host = 'main--events-milo--adobecom.aem.page';
      locationStub.hostname = 'main--events-milo--adobecom.aem.page';
      expect(getCurrentEnvironment(locationStub)).to.equal(ENVIRONMENTS.PROD);
    });

    it('should return DEV as fallback', () => {
      locationStub.host = 'unknown-host';
      locationStub.hostname = 'unknown-host';
      expect(getCurrentEnvironment(locationStub)).to.equal(ENVIRONMENTS.DEV);
    });
  });

  describe('isEnvironment', () => {
    it('should return true for matching environment', () => {
      locationStub.host = 'dev02--events-milo--adobecom.aem.page';
      locationStub.hostname = 'dev02--events-milo--adobecom.aem.page';
      expect(isEnvironment(ENVIRONMENTS.DEV02, locationStub)).to.be.true;
    });

    it('should return false for non-matching environment', () => {
      locationStub.host = 'dev02--events-milo--adobecom.aem.page';
      locationStub.hostname = 'dev02--events-milo--adobecom.aem.page';
      expect(isEnvironment(ENVIRONMENTS.PROD, locationStub)).to.be.false;
    });

    it('should throw error for invalid environment', () => {
      expect(() => isEnvironment('invalid-env', locationStub)).to.throw('Invalid environment: invalid-env');
    });
  });

  describe('getImsEnvironment', () => {
    it('should return PROD for production environment', () => {
      locationStub.host = 'main--events-milo--adobecom.aem.page';
      locationStub.hostname = 'main--events-milo--adobecom.aem.page';
      expect(getImsEnvironment(locationStub)).to.equal(IMS_ENVIRONMENTS.PROD);
    });

    it('should return STAGE for non-production environments', () => {
      locationStub.host = 'dev02--events-milo--adobecom.aem.page';
      locationStub.hostname = 'dev02--events-milo--adobecom.aem.page';
      expect(getImsEnvironment(locationStub)).to.equal(IMS_ENVIRONMENTS.STAGE);
    });
  });

  describe('getEventServiceHost', () => {
    it('should return correct host for AEM/HLX environment', () => {
      locationStub.href = 'https://dev--events-milo--adobecom.aem.page';
      locationStub.host = 'dev--events-milo--adobecom.aem.page';
      locationStub.hostname = 'dev--events-milo--adobecom.aem.page';
      locationStub.origin = 'https://dev--events-milo--adobecom.aem.page';
      expect(getEventServiceHost(undefined, locationStub)).to.equal('https://dev--events-milo--adobecom.aem.page');
    });

    it('should return relativeDomain if provided', () => {
      const relativeDomain = 'https://custom-domain.com';
      expect(getEventServiceHost(relativeDomain, locationStub)).to.equal(relativeDomain);
    });

    it('should return correct host for stage.adobe.com', () => {
      locationStub.hostname = DOMAINS.STAGE_ADOBE_COM;
      locationStub.origin = `https://${DOMAINS.STAGE_ADOBE_COM}`;
      expect(getEventServiceHost(undefined, locationStub)).to.equal(`https://${DOMAINS.STAGE_ADOBE_COM}`);
    });

    it('should return correct host for localhost', () => {
      locationStub.hostname = DOMAINS.LOCALHOST;
      expect(getEventServiceHost(undefined, locationStub)).to.equal('https://dev--events-milo--adobecom.hlx.page');
    });

    it('should return adobe.com as fallback', () => {
      locationStub.hostname = 'unknown-host';
      expect(getEventServiceHost(undefined, locationStub)).to.equal(`https://${DOMAINS.ADOBE_COM}`);
    });
  });
});
