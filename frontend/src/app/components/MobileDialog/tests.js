/* global describe, beforeEach, it */
import React from "react";
import { expect } from "chai";
import sinon from "sinon";
import { shallow } from "enzyme";

import MobileDialog from "./index.js";

describe("app/components/MobileDialog", () => {
  const experiment = {
    title: "Foobar",
    slug: "foobar",
    android_url: "https://example.com/survey"
  };

  let sendToGA, onCancel, preventDefault, subject, mockClickEvent, mockEscapeKeyDownEvent;
  beforeEach(() => {
    sendToGA = sinon.spy();
    onCancel = sinon.spy();
    preventDefault = sinon.spy();
    mockClickEvent = { preventDefault, target: {} };
    mockEscapeKeyDownEvent = {
      preventDefault,
      key: "Escape"
    };
    subject = shallow(
      <MobileDialog experiment={experiment} onCancel={onCancel} sendToGA={sendToGA}
        fetchCountryCode={() => {
          return Promise.resolve({
            json: () => {
              return { country_code: "US" };
            }
          });
        }} />
    );
  });

  it("should render expected content", () => {
    expect(subject.find(".modal-container"))
      .to.have.property("length", 1);
    expect(subject.find(".mobile-header-img")).to.be.ok;
  });

  it("should call onCancel on cancel button click", () => {
    subject.find(".modal-cancel").simulate("click", mockClickEvent);
    expect(onCancel.called).to.be.true;
    expect(sendToGA.lastCall.args).to.deep.equal(["event", {
      eventCategory: "SMS Modal Interactions",
      eventAction: "dialog dismissed",
      eventLabel: "cancel Send link to device dialog",
      dimension11: experiment.slug,
      dimension13: "Experiment Detail"
    }]);
  });

  it("should call onCancel when the <Escape> key is pressed", () => {
    subject.find(".modal-container").simulate("keyDown", mockEscapeKeyDownEvent);
    expect(onCancel.called).to.be.true;
    expect(sendToGA.lastCall.args).to.deep.equal(["event", {
      eventCategory: "SMS Modal Interactions",
      eventAction: "dialog dismissed",
      eventLabel: "cancel Send link to device dialog",
      dimension11: experiment.slug,
      dimension13: "Experiment Detail"
    }]);
  });

  describe("available platform store details", () => {
    const experiment = { title: "Foobar", slug: "foobar" };
    const fetchCountryCode = () => Promise.resolve({ json: () => { country_code: "US" } });
    const props = { experiment, fetchCountryCode, onCancel, sendToGA }

    const androidStoreName = "Google Play Store";
    const iosStoreName = "iOS App Store";

    it("should render the Google Play Store badge only", () => {
      const androidExperiment = {
        ...experiment,
        android_url: "https://example.com/android"
      };

      subject = shallow(<MobileDialog {...props} experiment={androidExperiment} />);

      expect(subject.find(".header-wrapped").render().text()).to.equal(`Download ${experiment.title} from the ${androidStoreName}.`);
      expect(subject.find(".mobile-header-img")).to.have.property("length", 1);
    })

    it("should render the ios App Store badge only", () => {
      const iosExperiment = {
        ...experiment,
        ios_url: "https://example.com/ios"
      };

      subject = shallow(<MobileDialog {...props} experiment={iosExperiment} />);

      expect(subject.find(".header-wrapped").render().text()).to.equal(`Download ${experiment.title} from the ${iosStoreName}.`);
      expect(subject.find(".mobile-header-img")).to.have.property("length", 1);
    })

    it("should render both the Google Play Store and iOS App Store badges", () => {
      const bothPlatformsExperiment = {
        ...experiment,
        android_url: "https://example.com/android",
        ios_url: "https://example.com/ios"
      };

      subject = shallow(<MobileDialog {...props} experiment={bothPlatformsExperiment} />);

      expect(subject.find(".header-wrapped").render().text()).to.equal(`Download ${experiment.title} from the ${androidStoreName} or the ${iosStoreName}.`);
      expect(subject.find(".mobile-header-img")).to.have.property("length", 2);
    })

  })
});
