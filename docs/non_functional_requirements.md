# Non-Functional Requirements

## 1. Performance

- NFR-1.1: The system shall respond to user input without noticeable delay.
- NFR-1.2: The system shall maintain smooth gameplay without frame drops during a run.
- NFR-1.3: The system shall not block the main thread during gameplay.

---

## 2. Reliability

- NFR-2.1: The system shall not crash during normal gameplay.
- NFR-2.2: The system shall handle edge cases without breaking the game state.
- NFR-2.3: The system shall recover gracefully from unexpected input where possible.

---

## 3. Usability

- NFR-3.1: The system shall be usable without external instructions or tutorials.
- NFR-3.2: The system shall present clear visual feedback for user actions.
- NFR-3.3: The system shall clearly communicate failure states.

---

## 4. Offline Capability

- NFR-4.1: The system shall function fully without network connectivity.
- NFR-4.2: The system shall not require backend services for gameplay in MVP.

---

## 5. Data Integrity (MVP Scope)

- NFR-5.1: The system shall not rely on persistent storage for gameplay progression.
- NFR-5.2: Any locally stored data (e.g., tutorial state) shall not impact core gameplay integrity.

---

## 6. Compatibility

- NFR-6.1: The system shall run in modern desktop web browsers.
- NFR-6.2: The system shall support keyboard and mouse input.

---

## 7. Security (Future Considerations)

- NFR-7.1: The system shall not expose sensitive data in the client.
- NFR-7.2: Future backend systems shall validate run submissions before persistence.
- NFR-7.3: Client-side data shall not be considered authoritative.

---

## 8. Maintainability

- NFR-8.1: The system shall be structured to allow future feature expansion.
- NFR-8.2: The system shall be readable and understandable for future contributors.
