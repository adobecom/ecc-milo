import { expect } from '@esm-bundle/chai';
import { DOMAIN_MAP, toStageOrigin, toProdOrigin } from '../../ecc/scripts/domain-mapping.js';

describe('Domain Mapping Module', () => {
  describe('DOMAIN_MAP', () => {
    it('should be a non-empty array', () => {
      expect(DOMAIN_MAP).to.be.an('array').that.is.not.empty;
    });

    it('should have prod and stage keys for every entry', () => {
      DOMAIN_MAP.forEach((entry) => {
        expect(entry).to.have.property('prod').that.is.a('string');
        expect(entry).to.have.property('stage').that.is.a('string');
      });
    });
  });

  describe('toStageOrigin', () => {
    it('should map www.adobe.com to www.stage.adobe.com', () => {
      expect(toStageOrigin('https://www.adobe.com')).to.equal('https://www.stage.adobe.com');
    });

    it('should map www.adobe.com with a path', () => {
      expect(toStageOrigin('https://www.adobe.com/events/my-event'))
        .to.equal('https://www.stage.adobe.com/events/my-event');
    });

    it('should map business.adobe.com to business.stage.adobe.com', () => {
      expect(toStageOrigin('https://business.adobe.com'))
        .to.equal('https://business.stage.adobe.com');
    });

    it('should map business.adobe.com with a path', () => {
      expect(toStageOrigin('https://business.adobe.com/events/summit'))
        .to.equal('https://business.stage.adobe.com/events/summit');
    });

    it('should map .aem.live suffix to .aem.page', () => {
      expect(toStageOrigin('https://main--da-events--adobecom.aem.live'))
        .to.equal('https://main--da-events--adobecom.aem.page');
    });

    it('should map .aem.live with a path', () => {
      expect(toStageOrigin('https://main--da-events--adobecom.aem.live/events/my-event'))
        .to.equal('https://main--da-events--adobecom.aem.page/events/my-event');
    });

    it('should handle various AEM host prefixes', () => {
      expect(toStageOrigin('https://stage--da-events--adobecom.aem.live'))
        .to.equal('https://stage--da-events--adobecom.aem.page');
      expect(toStageOrigin('https://dev--event-libs--adobecom.aem.live'))
        .to.equal('https://dev--event-libs--adobecom.aem.page');
    });

    it('should return input unchanged for already-stage origins', () => {
      expect(toStageOrigin('https://www.stage.adobe.com')).to.equal('https://www.stage.adobe.com');
      expect(toStageOrigin('https://main--da-events--adobecom.aem.page'))
        .to.equal('https://main--da-events--adobecom.aem.page');
    });

    it('should return input unchanged for unknown domains', () => {
      expect(toStageOrigin('https://example.com')).to.equal('https://example.com');
      expect(toStageOrigin('https://unknown.domain.org/path')).to.equal('https://unknown.domain.org/path');
    });

    it('should handle bare hostnames', () => {
      expect(toStageOrigin('www.adobe.com')).to.equal('www.stage.adobe.com');
      expect(toStageOrigin('business.adobe.com')).to.equal('business.stage.adobe.com');
    });

    it('should preserve query parameters and fragments', () => {
      expect(toStageOrigin('https://www.adobe.com/events?id=123#section'))
        .to.equal('https://www.stage.adobe.com/events?id=123#section');
    });

    it('should handle null and empty inputs', () => {
      expect(toStageOrigin(null)).to.equal(null);
      expect(toStageOrigin(undefined)).to.equal(undefined);
      expect(toStageOrigin('')).to.equal('');
    });
  });

  describe('toProdOrigin', () => {
    it('should map www.stage.adobe.com to www.adobe.com', () => {
      expect(toProdOrigin('https://www.stage.adobe.com')).to.equal('https://www.adobe.com');
    });

    it('should map www.stage.adobe.com with a path', () => {
      expect(toProdOrigin('https://www.stage.adobe.com/events/my-event'))
        .to.equal('https://www.adobe.com/events/my-event');
    });

    it('should map business.stage.adobe.com to business.adobe.com', () => {
      expect(toProdOrigin('https://business.stage.adobe.com'))
        .to.equal('https://business.adobe.com');
    });

    it('should map .aem.page suffix to .aem.live', () => {
      expect(toProdOrigin('https://main--da-events--adobecom.aem.page'))
        .to.equal('https://main--da-events--adobecom.aem.live');
    });

    it('should map .aem.page with a path', () => {
      expect(toProdOrigin('https://main--da-events--adobecom.aem.page/events/my-event'))
        .to.equal('https://main--da-events--adobecom.aem.live/events/my-event');
    });

    it('should handle various AEM host prefixes', () => {
      expect(toProdOrigin('https://stage--da-events--adobecom.aem.page'))
        .to.equal('https://stage--da-events--adobecom.aem.live');
      expect(toProdOrigin('https://dev--event-libs--adobecom.aem.page'))
        .to.equal('https://dev--event-libs--adobecom.aem.live');
    });

    it('should return input unchanged for already-prod origins', () => {
      expect(toProdOrigin('https://www.adobe.com')).to.equal('https://www.adobe.com');
      expect(toProdOrigin('https://main--da-events--adobecom.aem.live'))
        .to.equal('https://main--da-events--adobecom.aem.live');
    });

    it('should return input unchanged for unknown domains', () => {
      expect(toProdOrigin('https://example.com')).to.equal('https://example.com');
    });

    it('should handle bare hostnames', () => {
      expect(toProdOrigin('www.stage.adobe.com')).to.equal('www.adobe.com');
      expect(toProdOrigin('business.stage.adobe.com')).to.equal('business.adobe.com');
    });

    it('should preserve query parameters and fragments', () => {
      expect(toProdOrigin('https://www.stage.adobe.com/events?id=123#section'))
        .to.equal('https://www.adobe.com/events?id=123#section');
    });

    it('should handle null and empty inputs', () => {
      expect(toProdOrigin(null)).to.equal(null);
      expect(toProdOrigin(undefined)).to.equal(undefined);
      expect(toProdOrigin('')).to.equal('');
    });
  });

  describe('round-trip consistency', () => {
    it('should be idempotent for stage origins', () => {
      const stageUrl = 'https://www.stage.adobe.com/events/page';
      expect(toStageOrigin(stageUrl)).to.equal(stageUrl);
    });

    it('should be idempotent for prod origins', () => {
      const prodUrl = 'https://www.adobe.com/events/page';
      expect(toProdOrigin(prodUrl)).to.equal(prodUrl);
    });

    it('should round-trip prod -> stage -> prod', () => {
      const prodUrl = 'https://www.adobe.com/events/my-event';
      const stageUrl = toStageOrigin(prodUrl);
      expect(toProdOrigin(stageUrl)).to.equal(prodUrl);
    });

    it('should round-trip stage -> prod -> stage', () => {
      const stageUrl = 'https://www.stage.adobe.com/events/my-event';
      const prodUrl = toProdOrigin(stageUrl);
      expect(toStageOrigin(prodUrl)).to.equal(stageUrl);
    });

    it('should round-trip .aem.live -> .aem.page -> .aem.live', () => {
      const liveUrl = 'https://main--da-events--adobecom.aem.live/events/page';
      const pageUrl = toStageOrigin(liveUrl);
      expect(toProdOrigin(pageUrl)).to.equal(liveUrl);
    });

    it('should round-trip .aem.page -> .aem.live -> .aem.page', () => {
      const pageUrl = 'https://main--da-events--adobecom.aem.page/events/page';
      const liveUrl = toProdOrigin(pageUrl);
      expect(toStageOrigin(liveUrl)).to.equal(pageUrl);
    });
  });
});
