import path from 'path';
import should from 'should';
import { URLHandler } from '../src/url_handler';

const urlHandler = new URLHandler();

const urlfor = relpath =>
  `file://${path
    .resolve(path.dirname(module.filename), 'vastfiles', relpath)
    .replace(/\\/g, '/')}`;

describe('URLHandler', () =>
  describe('#get', function() {
    it("should return options.response when it's provided", done => {
      const options = { response: 'response' };
      urlHandler.get(urlfor('sample.xml'), options, function(err, xml) {
        should.not.exist(err);
        should.exists(xml);
        xml.should.equal('response');
        should.not.exist(options.response);
        done();
      });
    });

    it('should return a VAST XML DOM object', done => {
      urlHandler.get(urlfor('sample.xml'), function(err, xml) {
        should.not.exist(err);
        should.exists(xml);
        xml.documentElement.nodeName.should.equal('VAST');
        done();
      });
    });

    it('should return an error if not found', done => {
      urlHandler.get(urlfor('not-found.xml'), function(err, xml) {
        should.exists(err);
        should.not.exist(xml);
        done();
      });
    });
  }));
