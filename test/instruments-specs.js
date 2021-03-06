// transpile:mocha

import { Instruments, utils } from '..';
import * as tp from 'teen_process';
import chai from 'chai';
import xcode from 'appium-xcode';
import { withMocks, verify } from 'appium-test-support';
import { fs } from 'appium-support';
import sinon from 'sinon';


chai.should();

const XCODE_VERSION = {
  versionString: '7.1.1',
  versionFloat: 7.1,
  major: 7,
  minor: 1,
  patch: 1
};

describe('instruments', () => {
  describe('quickInstrument', async () => {
    it('should create instruments', async () => {
      let opts = {
        app: '/a/b/c/my.app',
      };
      let instruments = await Instruments.quickInstruments(opts);
      instruments.app.should.equal(opts.app);
    });
  });
  describe('constructor', () => {
    it('should create instruments', () => {
      let opts = {
        app: '/a/b/c/my.app',
      };
      let instruments = new Instruments(opts);
      instruments.app.should.equal(opts.app);
    });
  });
  describe('configure', withMocks({xcode, utils}, (mocks) => {
    it('should work', async () => {
      let instruments = new Instruments({});
      mocks.xcode
        .expects('getVersion')
        .once()
        .returns(Promise.resolve(XCODE_VERSION));
      mocks.xcode
        .expects('getAutomationTraceTemplatePath')
        .once()
        .returns(Promise.resolve('/a/b/c/d/tracetemplate'));
      mocks.utils
        .expects('getInstrumentsPath')
        .once()
        .returns(Promise.resolve('/a/b/c/instrumentspath'));
      await instruments.configure();
      instruments.xcodeVersion.versionString.should.equal(XCODE_VERSION.versionString);
      instruments.template.should.equal('/a/b/c/d/tracetemplate');
      instruments.instrumentsPath.should.equal('/a/b/c/instrumentspath');
      verify(mocks);
    });
  }));
  describe('spawnInstruments', withMocks({fs, tp, utils}, (mocks) => {
    it('should work', async () => {
      let instruments = new Instruments({});
      instruments.xcodeVersion = XCODE_VERSION;
      instruments.template = '/a/b/c/d/tracetemplate';
      instruments.instrumentsPath = '/a/b/c/instrumentspath';
      mocks.fs.expects('exists').once().returns(Promise.resolve(false));
      mocks.tp.expects('spawn').once().returns({});
      mocks.utils
        .expects('getIwdPath')
        .once()
        .returns(Promise.resolve('/a/b/c/iwd'));
      await instruments.spawnInstruments();
      verify(mocks);
    });
    it('should properly handle process arguments', async () => {
      let instruments = new Instruments({});
      instruments.processArguments = '-e firstoption firstoptionsarg -e secondoption second option arg';
      instruments.xcodeVersion = XCODE_VERSION;
      instruments.template = '/a/b/c/d/tracetemplate';
      instruments.instrumentsPath = '/a/b/c/instrumentspath';
      mocks.fs.expects('exists').once().returns(Promise.resolve(false));
      mocks.tp.expects('spawn').once()
        .withArgs(
          sinon.match(instruments.instrumentsPath),
          // sinon.match.string,
          ["-t", "/a/b/c/d/tracetemplate",
           "-D", "/tmp/appium-instruments/instrumentscli0.trace", undefined,
           "-e", "firstoption", "firstoptionsarg",
           "-e", "secondoption", "second option arg",
           "-e", "UIASCRIPT", undefined,
           "-e", "UIARESULTSPATH", "/tmp/appium-instruments"],
          sinon.match.object
        )
        .returns({});
      mocks.utils
        .expects('getIwdPath')
        .once()
        .returns(Promise.resolve('/a/b/c/iwd'));
      await instruments.spawnInstruments();

      verify(mocks);
    });
    it('should properly handle non-environment-variable process arguments', async () => {
      let instruments = new Instruments({});
      instruments.processArguments = 'some random process arguments';
      instruments.xcodeVersion = XCODE_VERSION;
      instruments.template = '/a/b/c/d/tracetemplate';
      instruments.instrumentsPath = '/a/b/c/instrumentspath';
      mocks.fs.expects('exists').once().returns(Promise.resolve(false));
      mocks.tp.expects('spawn').once()
        .withArgs(
          sinon.match(instruments.instrumentsPath),
          // sinon.match.string,
          ["-t", "/a/b/c/d/tracetemplate",
           "-D", "/tmp/appium-instruments/instrumentscli0.trace", undefined,
           "some random process arguments",
           "-e", "UIASCRIPT", undefined,
           "-e", "UIARESULTSPATH", "/tmp/appium-instruments"],
          sinon.match.object
        )
        .returns({});
      mocks.utils
        .expects('getIwdPath')
        .once()
        .returns(Promise.resolve('/a/b/c/iwd'));
      await instruments.spawnInstruments();

      verify(mocks);
    });
    it('should properly handle process arguments as hash', async () => {
      let instruments = new Instruments({});
      instruments.processArguments = {firstoption: 'firstoptionsarg', secondoption: 'second option arg'};
      instruments.xcodeVersion = XCODE_VERSION;
      instruments.template = '/a/b/c/d/tracetemplate';
      instruments.instrumentsPath = '/a/b/c/instrumentspath';
      mocks.fs.expects('exists').once().returns(Promise.resolve(false));
      mocks.tp.expects('spawn').once()
        .withArgs(
          sinon.match(instruments.instrumentsPath),
          // sinon.match.string,
          ["-t", "/a/b/c/d/tracetemplate",
           "-D", "/tmp/appium-instruments/instrumentscli0.trace", undefined,
           "-e", "firstoption", "firstoptionsarg",
           "-e", "secondoption", "second option arg",
           "-e", "UIASCRIPT", undefined,
           "-e", "UIARESULTSPATH", "/tmp/appium-instruments"],
          sinon.match.object
        )
        .returns({});
      mocks.utils
        .expects('getIwdPath')
        .once()
        .returns(Promise.resolve('/a/b/c/iwd'));
      await instruments.spawnInstruments();

      verify(mocks);
    });
    it('should add language and locale arguments when appropriate', async () => {
      let instruments = new Instruments({locale: "de_DE", language: "de"});
      instruments.processArguments = 'some random process arguments';
      instruments.xcodeVersion = XCODE_VERSION;
      instruments.template = '/a/b/c/d/tracetemplate';
      instruments.instrumentsPath = '/a/b/c/instrumentspath';
      mocks.fs.expects('exists').once().returns(Promise.resolve(false));
      mocks.tp.expects('spawn').once()
        .withArgs(
          sinon.match(instruments.instrumentsPath),
          // sinon.match.string,
          ["-t", "/a/b/c/d/tracetemplate",
           "-D", "/tmp/appium-instruments/instrumentscli0.trace", undefined,
           "some random process arguments",
           "-e", "UIASCRIPT", undefined,
           "-e", "UIARESULTSPATH", "/tmp/appium-instruments",
           "-AppleLanguages (de)",
           "-NSLanguages (de)",
           "-AppleLocale de_DE"],
          sinon.match.object
        )
        .returns({});
      mocks.utils
        .expects('getIwdPath')
        .once()
        .returns(Promise.resolve('/a/b/c/iwd'));
      await instruments.spawnInstruments();

      verify(mocks);
    });
  }));
});
