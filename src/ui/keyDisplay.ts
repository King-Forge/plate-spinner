const keyMap: Record<string, string> = {
  KeyA: "A",
  KeyB: "B",
  KeyC: "C",
  KeyD: "D",
  KeyE: "E",
  KeyF: "F",
  KeyG: "G",
  KeyH: "H",
  KeyI: "I",
  KeyJ: "J",
  KeyK: "K",
  KeyL: "L",
  KeyM: "M",
  KeyN: "N",
  KeyO: "O",
  KeyP: "P",
  KeyQ: "Q",
  KeyR: "R",
  KeyS: "S",
  KeyT: "T",
  KeyU: "U",
  KeyV: "V",
  KeyW: "W",
  KeyX: "X",
  KeyY: "Y",
  KeyZ: "Z",
  // Digits
  Digit0: "0",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  // Numpad
  Numpad0: "n0",
  Numpad1: "n1",
  Numpad2: "n2",
  Numpad3: "n3",
  Numpad4: "n4",
  Numpad5: "n5",
  Numpad6: "n6",
  Numpad7: "n7",
  Numpad8: "n8",
  Numpad9: "n9",
};

//looks up keyCode from keyboard event and returns display name, or null if keyCode is not for an alphanumeric key
function getKeyDisplayName(keyCode: string): string {
  return keyCode in keyMap ? keyMap[keyCode] : "";
}

export default getKeyDisplayName;
