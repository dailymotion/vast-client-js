const should = require('should');
const sinon  = require('sinon');
const path = require('path');
const VASTParser = require('../src/parser/parser');
const VASTTracker = require('../src/tracker');

const now = new Date();
const vastParser = new VASTParser();

const urlfor = relpath => `file://${path.resolve(path.dirname(module.filename), 'vastfiles', relpath).replace(/\\/g, '/')}`;

describe('VASTTracker', function() {
    before(() => {
        this.sinon = sinon.sandbox.create();
        this.sinon.stub(Math, 'random').returns(0.1);
        this.clock = sinon.useFakeTimers(now.getTime());
    });

    after(() => {
        this.clock.restore();
        this.sinon.restore();
    });

    describe('#constructor', function() {
        this.Tracker = null;
        let _eventsSent = [];
        this.templateFilterCalls = [];
        this.response = {};

        before(done => {
            vastParser.addURLTemplateFilter(url => {
              this.templateFilterCalls.push(url);
              return url;
            });

            vastParser.parse(urlfor('wrapper-a.xml'), response => {
                this.response = response;
                done();
            });
        });

        after(() => {
            vastParser.clearUrlTemplateFilters();
        });

        describe('#linear', () => {
            before(() => {
                // Init tracker
                const ad = this.response.ads[0];
                const creative = this.response.ads[0].creatives[0];
                this.Tracker = new VASTTracker(ad, creative);
                // Mock emit
                this.Tracker.emit = event => {
                    _eventsSent.push(event);
                };
            });

            it('should have firstQuartile set', () => {
                this.Tracker.quartiles.firstQuartile.should.equal(22.53);
            });

            it('should have midpoint set', () => {
                this.Tracker.quartiles.midpoint.should.equal(45.06);
            });

            it('should have thirdQuartile set', () => {
                this.Tracker.quartiles.thirdQuartile.should.equal(67.59);
            });

            it('should have skipDelay disabled', () => {
                this.Tracker.skipDelay.should.equal(-1);
            });

            describe('#setProgress', () => {

                beforeEach(done => {
                    _eventsSent = [];
                    done();
                });

                it('should send start event when set at 1', () => {
                    this.Tracker.setProgress(1);
                    _eventsSent.should.eql(["start"]);
                });

                it('should send skip-countdown event', () => {
                    this.Tracker.skipDelay = 5;
                    this.Tracker.setProgress(6);
                    _eventsSent.should.eql(["skip-countdown"]);
                });

                it('should send rewind event when set back at 5', () => {
                    this.Tracker.setProgress(5);
                    _eventsSent.should.eql(["rewind"]);
                });

                it('should send firstQuartile event', () => {
                    this.Tracker.setProgress(23);
                    _eventsSent.should.eql(["firstQuartile"]);
                });

                it('should send progress-30 event VAST 3.0', () => {
                    this.Tracker.setProgress(30);
                    _eventsSent.should.eql(["progress-30"]);
                });

                it('should send midpoint event', () => {
                    this.Tracker.setProgress(46);
                    _eventsSent.should.eql(["midpoint"]);
                });

                it('should send progress-60% event VAST 3.0', () => {
                    this.Tracker.setProgress(54);
                    _eventsSent.should.eql(["progress-60%"]);
                });

                it('should send thirdQuartile event', () => {
                    this.Tracker.setProgress(68);
                    _eventsSent.should.eql(["thirdQuartile"]);
                });
            });

            describe('#setMuted', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.trackingEvents['mute'] = 'http://example.com/muted';
                    this.Tracker.trackingEvents['unmute'] = 'http://example.com/muted';
                    this.Tracker.setMuted(true);
                    done();
                });

                it('should be muted', () => {
                    this.Tracker.muted.should.eql(true);
                });

                it('should send muted event', () => {
                    _eventsSent.should.eql(["mute"]);
                });

                it('should be unmuted', () => {
                    _eventsSent = [];
                    this.Tracker.setMuted(false);
                    this.Tracker.muted.should.eql(false);
                });

                it('should send unmuted event', () => {
                    _eventsSent.should.eql(["unmute"]);
                });

                it('should send no event', () => {
                    _eventsSent = [];
                    this.Tracker.setMuted(false);
                    _eventsSent.should.eql([]);
                });
            });

            describe('#setPaused', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.setPaused(true);
                    done();
                });

                it('should be paused', () => {
                    this.Tracker.paused.should.eql(true);
                });

                it('should send pause event', () => {
                    _eventsSent.should.eql(["pause"]);
                });

                it('should be resumed', () => {
                    _eventsSent = [];
                    this.Tracker.setPaused(false);
                    this.Tracker.paused.should.eql(false);
                });

                it('should send resume event', () => {
                    _eventsSent.should.eql(["resume"]);
                });

                it('should send no event', () => {
                    _eventsSent = [];
                    this.Tracker.setPaused(false);
                    _eventsSent.should.eql([]);
                });
            });

            describe('#setFullscreen', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.trackingEvents['fullscreen'] = 'http://example.com/fullscreen';
                    this.Tracker.trackingEvents['exitFullscreen'] = 'http://example.com/exitFullscreen';
                    this.Tracker.setFullscreen(true);
                    done();
                });

                it('should be in fullscreen mode', () => {
                    this.Tracker.fullscreen.should.eql(true);
                });

                it('should send fullscreen event', () => {
                    _eventsSent.should.eql(["fullscreen"]);
                });

                it('should be in exitFullscreen mode', () => {
                    _eventsSent = [];
                    this.Tracker.setFullscreen(false);
                    this.Tracker.fullscreen.should.eql(false);
                });

                it('should send exitFullscreen event', () => {
                    _eventsSent.should.eql(["exitFullscreen"]);
                });

                it('should send no event', () => {
                    _eventsSent = [];
                    this.Tracker.setFullscreen(false);
                    _eventsSent.should.eql([]);
                });
            });

            describe('#setExpand', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.trackingEvents['expand'] = 'http://example.com/expand';
                    this.Tracker.trackingEvents['collapse'] = 'http://example.com/collapse';
                    this.Tracker.setExpand(true);
                    done();
                });

                it('should be in expanded mode', () => {
                    this.Tracker.expanded.should.eql(true);
                });

                it('should send expand event', () => {
                    _eventsSent.should.eql(["expand"]);
                });

                it('should be in collapsed mode', () => {
                    _eventsSent = [];
                    this.Tracker.setExpand(false);
                    this.Tracker.expanded.should.eql(false);
                });

                it('should send collapse event', () => {
                    _eventsSent.should.eql(["collapse"]);
                });

                it('should send no event', () => {
                    _eventsSent = [];
                    this.Tracker.setExpand(false);
                    _eventsSent.should.eql([]);
                });
            });

            describe('#setSkipDelay', () => {

                it('should have skipDelay set to 3', () => {
                    this.Tracker.setSkipDelay(3);
                    this.Tracker.skipDelay.should.eql(3);
                });

                it('should have skipDelay still set to 3', () => {
                    this.Tracker.setSkipDelay('blabla');
                    this.Tracker.skipDelay.should.eql(3);
                });
            });

            describe('#load', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.vastUtil.track = function(URLTemplates, variables) {
                        _eventsSent.push(this.resolveURLTemplates(URLTemplates, variables));
                    };
                    this.Tracker.load();
                    done();
                });

                it('should have impressed set to true', () => {
                    this.Tracker.impressed.should.eql(true);
                });

                it('should have called impression URLs', () => {
                    const creative     = this.Tracker.vastUtil.encodeURIComponentRFC3986(this.Tracker.creative.mediaFiles[0].fileURL);
                    const cacheBusting = 10000000;
                    _eventsSent[0].should.eql([
                        'http://example.com/wrapperA-impression',
                        'http://example.com/wrapperB-impression1',
                        'http://example.com/wrapperB-impression2',
                        `http://example.com/impression1_asset:${creative}_${cacheBusting}`,
                        `http://example.com/impression2_${cacheBusting}`,
                        `http://example.com/impression3_${cacheBusting}`
                    ]);
                });

                it('should have sent creativeView event', () => {
                    _eventsSent[1].should.eql('creativeView');
                });

                it('should only be called once', () => {
                    _eventsSent = [];
                    this.Tracker.load();
                    _eventsSent.should.eql([]);
                });
            });

            describe('#errorWithCode', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.vastUtil.track = function(URLTemplates, variables) {
                        _eventsSent.push(this.resolveURLTemplates(URLTemplates, variables));
                    };
                    this.Tracker.errorWithCode(405);
                    done();
                });

                it('should have called error urls', () => {
                    _eventsSent[0].should.eql([ 'http://example.com/wrapperA-error', 'http://example.com/wrapperB-error', 'http://example.com/error_405']);
                });
            });

            describe('#complete', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.complete();
                    done();
                });

                it('should have sent complete event and urls', () => {
                    _eventsSent.should.eql(['complete', ["http://example.com/linear-complete", "http://example.com/wrapperB-linear-complete", "http://example.com/wrapperA-linear-complete"]]);
                });

                it('should be called multiples times', () => {
                    _eventsSent = [];
                    this.Tracker.complete();
                    _eventsSent.should.eql(['complete', ["http://example.com/linear-complete", "http://example.com/wrapperB-linear-complete", "http://example.com/wrapperA-linear-complete"]]);
                });
            });

            describe('#close', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.close();
                    done();
                });

                it('should have sent close event and urls VAST 2.0', () => {
                    _eventsSent.should.eql(['close', [ 'http://example.com/linear-close']]);
                });

                it('should have sent closeLinear event and urls VAST 3.0', () => {
                    _eventsSent = [];
                    this.Tracker.trackingEvents['closeLinear'] = ['http://example.com/closelinear'];
                    delete this.Tracker.trackingEvents['close'];
                    this.Tracker.close();
                    _eventsSent.should.eql(['closeLinear', [ 'http://example.com/closelinear']]);
                });
            });

            describe('#skip', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.skip();
                    done();
                });

                it('should have sent skip event', () => {
                    _eventsSent.should.eql(['skip']);
                });
            });

            describe('#click', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.vastUtil.track = function(URLTemplates, variables) {
                        _eventsSent.push(this.resolveURLTemplates(URLTemplates, variables));
                    };
                    this.Tracker.click();
                    done();
                });

                it('should have sent clicktracking events', () => {
                    const ISOTimeStamp = this.Tracker.vastUtil.encodeURIComponentRFC3986((new Date).toISOString());
                    _eventsSent[0].should.eql([
                        `http://example.com/linear-clicktracking1_ts:${ISOTimeStamp}`,
                        'http://example.com/linear-clicktracking2',
                        'http://example.com/wrapperB-linear-clicktracking',
                        'http://example.com/wrapperA-linear-clicktracking1',
                        'http://example.com/wrapperA-linear-clicktracking2',
                        'http://example.com/wrapperA-linear-clicktracking3'
                    ]);
                });

                it('should have sent clickthrough event', () => {
                    _eventsSent[1].should.eql('clickthrough');
                });
            });
        });

        describe('#companion', () => {
            before(() => {
                // Init tracker
                const ad = this.response.ads[0];
                const creative = ad.creatives[1];
                const variation = creative.variations[0];
                this.Tracker = new VASTTracker(ad, creative, variation);
                // Mock emit
                this.Tracker.emit = (event, ...args) => {
                    _eventsSent.push({ event, args });
                };
            });

            describe('#click', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.vastUtil.track = function(URLTemplates, variables) {
                        _eventsSent.push(this.resolveURLTemplates(URLTemplates, variables));
                    };
                    this.Tracker.click();
                    done();
                });

                it('should have sent clicktracking events', () => {
                    const ISOTimeStamp = this.Tracker.vastUtil.encodeURIComponentRFC3986((new Date).toISOString());
                    _eventsSent[0].should.eql([
                        'http://example.com/companion1-clicktracking-first',
                        'http://example.com/companion1-clicktracking-second'
                    ]);
                });

                it('should have sent clickthrough event withy clickThrough url', () => {
                    _eventsSent[1].event.should.eql('clickthrough');
                    _eventsSent[1].args.should.eql([ 'http://example.com/companion1-clickthrough' ]);
                });
            });
        });

        describe('#nonlinear', () => {
            before(() => {
                // Init tracker
                const ad = this.response.ads[0];
                const creative = ad.creatives[2];
                const variation = creative.variations[0];
                this.Tracker = new VASTTracker(ad, creative, variation);
                // Mock emit
                this.Tracker.emit = (event, ...args) => {
                    _eventsSent.push({ event, args });
                };
            });

            describe('#click', () => {

                before(done => {
                    _eventsSent = [];
                    this.Tracker.vastUtil.track = function(URLTemplates, variables) {
                        _eventsSent.push(this.resolveURLTemplates(URLTemplates, variables));
                    };
                    this.Tracker.click();
                    done();
                });

                it('should have sent clicktracking events', () => {
                    const ISOTimeStamp = this.Tracker.vastUtil.encodeURIComponentRFC3986((new Date).toISOString());
                    _eventsSent[0].should.eql([
                        'http://example.com/nonlinear-clicktracking-1',
                        'http://example.com/nonlinear-clicktracking-2'
                    ]);
                });

                it('should have sent clickthrough event withy clickThrough url', () => {
                    _eventsSent[1].event.should.eql('clickthrough');
                    _eventsSent[1].args.should.eql([ 'http://example.com/nonlinear-clickthrough' ]);
                });
            });
        });
    });
});
