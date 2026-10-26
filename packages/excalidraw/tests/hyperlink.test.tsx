import React from "react";
import { KEYS } from "@excalidraw/common";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import {
  render,
  fireEvent,
  waitFor,
  GlobalTestState,
  mockBoundingClientRect,
  restoreOriginalGetBoundingClientRect,
} from "./test-utils";

const { h } = window;

describe("Web embed hyperlink input", () => {
  beforeEach(async () => {
    mockBoundingClientRect();
    await render(<Excalidraw handleKeyboardGlobally={true} />);
    await waitFor(() => expect(h.state.width).toBe(200));
  });

  afterEach(() => {
    restoreOriginalGetBoundingClientRect();
  });

  it("handles pasted embed HTML in web embed input (issue #12452)", async () => {
    const embeddable = API.createElement({
      type: "embeddable",
      x: 20,
      y: 20,
      width: 120,
      height: 90,
    });
    API.setElements([embeddable]);
    API.setSelectedElements([embeddable]);
    API.setAppState({ showHyperlinkPopup: "editor" });

    const input = GlobalTestState.renderResult.container.querySelector(
      ".excalidraw-hyperlinkContainer-input",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();

    fireEvent.change(input, {
      target: {
        value:
          '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allowfullscreen></iframe>',
      },
    });
    fireEvent.keyDown(input, { key: KEYS.ENTER });

    expect(h.elements[0].link).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
    expect((h.app as any).embedsValidationStatus.get(embeddable.id)).toBe(true);
    expect(h.state.toast).toBeNull();
  });

  it("shows unableToEmbed toast when pasting embed HTML for disallowed domain", async () => {
    const embeddable = API.createElement({
      type: "embeddable",
      x: 20,
      y: 20,
      width: 120,
      height: 90,
    });
    API.setElements([embeddable]);
    API.setSelectedElements([embeddable]);
    API.setAppState({ showHyperlinkPopup: "editor" });

    const input = GlobalTestState.renderResult.container.querySelector(
      ".excalidraw-hyperlinkContainer-input",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();

    fireEvent.change(input, {
      target: {
        value: '<iframe src="https://example.com/embed"></iframe>',
      },
    });
    fireEvent.keyDown(input, { key: KEYS.ENTER });

    expect((h.app as any).embedsValidationStatus.get(embeddable.id)).toBe(
      false,
    );
    expect(h.state.toast?.message).toBe(
      "Embedding this url is currently not allowed. Raise an issue on GitHub to request the url whitelisted",
    );
  });

  it("handles normal URL input in web embed input", async () => {
    const embeddable = API.createElement({
      type: "embeddable",
      x: 20,
      y: 20,
      width: 120,
      height: 90,
    });
    API.setElements([embeddable]);
    API.setSelectedElements([embeddable]);
    API.setAppState({ showHyperlinkPopup: "editor" });

    const input = GlobalTestState.renderResult.container.querySelector(
      ".excalidraw-hyperlinkContainer-input",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();

    const normalUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    fireEvent.change(input, {
      target: {
        value: normalUrl,
      },
    });
    fireEvent.keyDown(input, { key: KEYS.ENTER });

    expect(h.elements[0].link).toBe(normalUrl);
    expect((h.app as any).embedsValidationStatus.get(embeddable.id)).toBe(true);
    expect(h.state.toast).toBeNull();
  });

  it("handles normal URL input on non-embeddable element", async () => {
    const rect = API.createElement({
      type: "rectangle",
      x: 20,
      y: 20,
      width: 120,
      height: 90,
    });
    API.setElements([rect]);
    API.setSelectedElements([rect]);
    API.setAppState({ showHyperlinkPopup: "editor" });

    const input = GlobalTestState.renderResult.container.querySelector(
      ".excalidraw-hyperlinkContainer-input",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();

    fireEvent.change(input, {
      target: {
        value: "https://excalidraw.com",
      },
    });
    fireEvent.keyDown(input, { key: KEYS.ENTER });

    expect(h.elements[0].link).toBe("https://excalidraw.com");
    expect(h.state.toast).toBeNull();
  });
});
